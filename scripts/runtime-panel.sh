#!/usr/bin/env bash
set -euo pipefail

WORKBENCH_ROOT="${WORKBENCH_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
REGISTRY_DIR="${WORKBENCH_ROOT}/runtime-registry"
SSH_TIMEOUT="${RUNTIME_PANEL_SSH_TIMEOUT:-5}"

usage() {
  cat <<'USAGE'
Usage:
  scripts/runtime-panel.sh [--format json] [--json]

Read-only fleet status panel. Reads every card under runtime-registry/ and
fuses registry metadata with live runner evidence fetched via SSH.

Sources:
  runtime-registry/*.json              — registry cards (local, versioned in git)
  /srv/windburn/evidence/runner/current.json — live evidence (via SSH)

Options:
  --format json    Output structured JSON (agent-consumable)
  --json           Alias for --format json
  --help           Show this message

Environment:
  RUNTIME_PANEL_SSH_TIMEOUT    SSH connect timeout in seconds (default: 5)
  HERMES_DROPLET_HOST          Resolved from registry card host_env field

Examples:
  scripts/runtime-panel.sh
  scripts/runtime-panel.sh --json | jq .fleet
  RUNTIME_PANEL_SSH_TIMEOUT=10 scripts/runtime-panel.sh
USAGE
}

FORMAT="${1:-}"
case "$FORMAT" in
  --help|-h|help) usage; exit 0 ;;
  --format) FORMAT="${2:-terminal}"; shift 2 || true ;;
  --json) FORMAT="json" ;;
  "") FORMAT="terminal" ;;
  *) FORMAT="terminal" ;;
esac

resolve_host() {
  local host_env="$1"
  if [ -z "$host_env" ]; then echo ""; return; fi
  echo "${!host_env:-}"
}

fetch_runner_evidence() {
  local host="$1"
  local evidence_path="${2:-/srv/windburn/evidence/runner/current.json}"

  if [ -z "$host" ]; then
    echo '{"status":"UNKNOWN","reason":"host_env not set"}'
    return
  fi

  ssh \
    -o ConnectTimeout="$SSH_TIMEOUT" \
    -o StrictHostKeyChecking=accept-new \
    -o PasswordAuthentication=no \
    -o BatchMode=yes \
    "$host" \
    "cat '$evidence_path' 2>/dev/null || echo '{}'" 2>/dev/null || {
    echo '{"status":"OFFLINE","reason":"ssh unreachable"}'
    return
  }
}

build_runtime_entry() {
  local card_json="$1"
  local evidence_json="$2"

  jq -n \
    --argjson card "$card_json" \
    --argjson evidence "$evidence_json" \
    '
    def s: if . == null then null else (. // "" | tostring) end;
    def b: if . == true then true else false end;
    {
      runtime_id: $card.runtime_id,
      instance: $card.action_payload.hermes_instance,
      route_label: $card.action_payload.route_label,
      provider: $card.action_payload.provider,
      model: $card.action_payload.model,
      repo: $card.repo,
      allowed_actions: $card.allowed_actions,
      permissions: {
        shell: $card.permissions.shell,
        remote_mutation: $card.permissions.remote_mutation,
        provider_writeback: $card.permissions.provider_writeback
      },
      host_env_ref: $card.action_payload.host_env,
      evidence_host_env_ref: ($card.action_payload.evidence_host_env // $card.action_payload.host_env),
      privacy_note: $card.privacy_note
    }
    + if $evidence.status then {
      live: {
        status: ($evidence.status | s),
        reason: ($evidence.reason | s),
        tmux_present: ($evidence.tmux.session_present | b),
        tmux_session_count: ($evidence.tmux.session_count // 0),
        codex_auth: ($evidence.credentials.codex_auth_present | b),
        hermes_auth: ($evidence.credentials.hermes_auth_present | b),
        provider_env: ($evidence.credentials.provider_env_present | b),
        smoke_verdict: ($evidence.latest_hermes_codex_smoke.verdict | s),
        smoke_reason: ($evidence.latest_hermes_codex_smoke.reason | s),
        failed_units: ($evidence.failed_units // 0),
        system_state: ($evidence.system_state | s),
        remote_mutation: ($evidence.remote_mutation | b),
        evidence_at: ($evidence.generated_at_utc | s),
        source: "runner-evidence"
      }
    } else {} end
    '
}

print_terminal_panel() {
  local fleet_json="$1"
  echo "$fleet_json" | jq -r '
    def dot(s):  if s == "PASS" then "●" elif s == "BLOCK" then "■"
                 elif s == "FLAG" then "◆" elif s == "OFFLINE" then "○"
                 elif s == "UNKNOWN" then "◇" else "○" end;
    def yn(b):   if b == true then "✓" elif b == false then "✗" else "?" end;
    def L(k):    k + (" " * (12 - (k | length)));

    [
      "",
      "══ Multica Fleet Status ══  \(.generated_at_utc[0:19] // "unknown")Z  ══  \(.registry_count) runtime(s) ══",
      "",
      (.fleet[] | [
        "▸ \(.instance // .runtime_id)    \(.live.status // "UNKNOWN") \(dot(.live.status // "UNKNOWN"))",
        "  " + ("─" * 62),
        "  \(L("Status"))     \(.live.status // "UNKNOWN")",
        "  \(L("Provider"))   \(.provider // "?") / \(.model // "?")",
        "  \(L("Auth"))       codex \(yn(.live.codex_auth))  hermes \(yn(.live.hermes_auth))  provider \(yn(.live.provider_env))",
        "  \(L("Tmux"))       \(if .live.tmux_present then "observed (\(.live.tmux_session_count) session)" else "not observed" end)",
        "  \(L("Smoke"))      \(.live.smoke_verdict // "?")  —  \(.live.smoke_reason // "?")",
        "  \(L("Shell"))      \(.permissions.shell // "?")",
        "  \(L("Mutation"))   \(.permissions.remote_mutation // false)",
        "  \(L("Allowed"))    \(.allowed_actions // [] | join(", "))",
        "  \(L("Repo"))       \(.repo // "?")",
        "  \(L("Host"))        \(.host_env_ref // "?")  (evidence: \(.evidence_host_env_ref // "?"))",
        "  \(L("Evidence"))    \(.live.source // "none")  @  \(.live.evidence_at // "?")",
        ""
      ] | join("\n")),
      "── \(.generated_at_utc[0:19] // "unknown")Z  ──  \(.registry_count) in registry  ──  read-only  ──"
    ] | join("\n")
  '
}

main() {
  if [ ! -d "$REGISTRY_DIR" ]; then
    echo "runtime-panel: no runtime-registry/ directory found at $REGISTRY_DIR" >&2
    exit 1
  fi

  local card_files
  card_files=("$REGISTRY_DIR"/*.json)
  if [ ! -f "${card_files[0]}" ]; then
    echo '{"fleet":[],"generated_at_utc":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","mode":"read-only"}' | \
      jq '. + {note: "no runtime cards found in runtime-registry/"}'
    exit 0
  fi

  local generated_at entries_json first
  generated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  entries_json="["
  first=true

  for card_file in "${card_files[@]}"; do
    local card_json host_env evidence_host_env host evidence_json entry_json
    card_json="$(jq '.' "$card_file")"
    host_env="$(echo "$card_json" | jq -r '.action_payload.host_env // ""')"
    evidence_host_env="$(echo "$card_json" | jq -r '.action_payload.evidence_host_env // ""')"
    host="$(resolve_host "${evidence_host_env:-$host_env}")"
    evidence_json="$(fetch_runner_evidence "$host")"
    entry_json="$(build_runtime_entry "$card_json" "$evidence_json")"

    if [ "$first" = true ]; then first=false; else entries_json+=","; fi
    entries_json+="$entry_json"
  done
  entries_json+="]"

  local fleet_json
  fleet_json="$(jq -n \
    --argjson fleet "$entries_json" \
    --arg generated_at "$generated_at" \
    '{fleet: $fleet, generated_at_utc: $generated_at, mode: "read-only", registry_count: ($fleet | length)}')"

  case "$FORMAT" in
    json) echo "$fleet_json" | jq '.' ;;
    *)    print_terminal_panel "$fleet_json" ;;
  esac
}

main
