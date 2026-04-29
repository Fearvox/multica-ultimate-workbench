#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/0xvox/multica-ultimate-workbench"

CANONICAL_MULTICA_PROFILE="desktop-api.multica.ai"
CANONICAL_MULTICA_WORKSPACE_ID="5470ee5d-0791-4713-beb4-fd6a187d6523"
CANONICAL_CLAUDE_RUNTIME_ID="dd23854a-7a38-4d04-8d02-014ba5a9df3d"
CANONICAL_CODEX_RUNTIME_ID="76228a28-203a-4249-9756-731d3cf68554"
CANONICAL_HERMES_RUNTIME_ID="d3a6d5a7-a80e-42ba-9d9e-3cefbc27fcf2"

MULTICA_PROFILE="${MULTICA_PROFILE:-$CANONICAL_MULTICA_PROFILE}"
MULTICA_WORKSPACE_ID="${MULTICA_WORKSPACE_ID:-$CANONICAL_MULTICA_WORKSPACE_ID}"
CLAUDE_RUNTIME_ID="${CLAUDE_RUNTIME_ID:-$CANONICAL_CLAUDE_RUNTIME_ID}"
CODEX_RUNTIME_ID="${CODEX_RUNTIME_ID:-$CANONICAL_CODEX_RUNTIME_ID}"
HERMES_RUNTIME_ID="${HERMES_RUNTIME_ID:-$CANONICAL_HERMES_RUNTIME_ID}"

if [[ "${CONFIRM_CREATE_WORKBENCH_ROSTER:-}" != "yes" ]]; then
  cat >&2 <<'MSG'
Refusing to create the full Multica Workbench roster.

Set CONFIRM_CREATE_WORKBENCH_ROSTER=yes only at action time after verifying
the target Multica profile, workspace, runtime IDs, and creation intent.
MSG
  exit 1
fi

target_mismatch=0

check_target() {
  local label="$1"
  local actual="$2"
  local expected="$3"

  if [[ "$actual" != "$expected" ]]; then
    printf 'Target mismatch: %s=%q, expected %q\n' "$label" "$actual" "$expected" >&2
    target_mismatch=1
  fi
}

check_target "MULTICA_PROFILE" "$MULTICA_PROFILE" "$CANONICAL_MULTICA_PROFILE"
check_target "MULTICA_WORKSPACE_ID" "$MULTICA_WORKSPACE_ID" "$CANONICAL_MULTICA_WORKSPACE_ID"
check_target "CLAUDE_RUNTIME_ID" "$CLAUDE_RUNTIME_ID" "$CANONICAL_CLAUDE_RUNTIME_ID"
check_target "CODEX_RUNTIME_ID" "$CODEX_RUNTIME_ID" "$CANONICAL_CODEX_RUNTIME_ID"
check_target "HERMES_RUNTIME_ID" "$HERMES_RUNTIME_ID" "$CANONICAL_HERMES_RUNTIME_ID"

if [[ "$target_mismatch" -ne 0 ]]; then
  echo "Refusing to create the workbench roster because the effective target does not exactly match the verified target." >&2
  echo "No Multica call was made." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Refusing to create the workbench roster because jq is required for exact-name idempotency checks." >&2
  echo "No Multica mutation was made." >&2
  exit 1
fi

multica_workbench() {
  multica --profile "$MULTICA_PROFILE" --workspace-id "$MULTICA_WORKSPACE_ID" "$@"
}

EXISTING_AGENT_NAME_LIST=()

read_existing_agent_names() {
  local agent_list_json
  local existing_names_json
  local existing_name

  if ! agent_list_json="$(multica_workbench agent list --output json)"; then
    echo "Refusing to create the workbench roster because agent list preflight failed." >&2
    echo "No Multica mutation was made." >&2
    exit 1
  fi

  if ! existing_names_json="$(printf '%s\n' "$agent_list_json" | jq -ce '
    if type == "array" then
      [
        .[]
        | if type == "object" and ((.name? | type == "string") or (.display_name? | type == "string")) then
            (.name? // .display_name?)
          else
            error("agent list item is missing a string name")
          end
      ]
      | unique
    else
      error("agent list JSON must be an array")
    end
  ')"; then
    echo "Refusing to create the workbench roster because agent list JSON did not match the expected shape." >&2
    echo "No Multica mutation was made." >&2
    exit 1
  fi

  EXISTING_AGENT_NAME_LIST=()
  while IFS= read -r existing_name; do
    EXISTING_AGENT_NAME_LIST+=("$existing_name")
  done < <(printf '%s\n' "$existing_names_json" | jq -r '.[]')
}

agent_exists() {
  local name="$1"
  local existing_name

  if [[ "${#EXISTING_AGENT_NAME_LIST[@]}" -eq 0 ]]; then
    return 1
  fi

  for existing_name in "${EXISTING_AGENT_NAME_LIST[@]}"; do
    if [[ "$existing_name" == "$name" ]]; then
      return 0
    fi
  done

  return 1
}

create_agent_if_missing() {
  local name="$1"
  local runtime_id="$2"
  local max_concurrent_tasks="$3"
  local description="$4"
  local instructions_file="$5"
  local runtime_config="$6"

  if agent_exists "$name"; then
    printf '{"status":"skipped","agent":%s,"reason":"already_exists"}\n' "$(jq -Rn --arg v "$name" '$v')"
    return
  fi

  multica_workbench agent create \
    --name "$name" \
    --description "$description" \
    --instructions "$(cat "$ROOT/$instructions_file")" \
    --runtime-id "$runtime_id" \
    --runtime-config "$runtime_config" \
    --max-concurrent-tasks "$max_concurrent_tasks" \
    --visibility private \
    --output json

  printf '{"status":"created","agent":%s}\n' "$(jq -Rn --arg v "$name" '$v')"
}

read_existing_agent_names

create_agent_if_missing \
  "Workbench Admin" \
  "$CLAUDE_RUNTIME_ID" \
  2 \
  "Front door, requirement clarification, issue creation, and specialist dispatch." \
  "agents/inner/workbench-admin.md" \
  '{}'

create_agent_if_missing \
  "Workbench Supervisor" \
  "$CODEX_RUNTIME_ID" \
  2 \
  "Risk review, goal-backward verification, evidence checks, and loop stopping." \
  "agents/inner/workbench-supervisor.md" \
  '{"custom_args":["--ask-for-approval","on-request"]}'

create_agent_if_missing \
  "Workbench Synthesizer" \
  "$HERMES_RUNTIME_ID" \
  1 \
  "Canonical synthesis, decision logs, and handoffs." \
  "agents/inner/workbench-synthesizer.md" \
  '{}'

create_agent_if_missing \
  "Codex Developer" \
  "$CODEX_RUNTIME_ID" \
  2 \
  "Focused implementation with tests and verification." \
  "agents/outer/codex-developer.md" \
  '{"custom_args":["--ask-for-approval","on-request"]}'

create_agent_if_missing \
  "Hermes Researcher" \
  "$HERMES_RUNTIME_ID" \
  3 \
  "Deep research, alternate approaches, and OAuth-backed local routes." \
  "agents/outer/hermes-researcher.md" \
  '{}'

create_agent_if_missing \
  "Claude Architect" \
  "$CLAUDE_RUNTIME_ID" \
  2 \
  "Long-context architecture and MCP-aware investigation." \
  "agents/outer/claude-architect.md" \
  '{}'

create_agent_if_missing \
  "Claude Docs" \
  "$CLAUDE_RUNTIME_ID" \
  2 \
  "Specs, README, release notes, and boundary-aware documentation." \
  "agents/outer/claude-docs.md" \
  '{}'

create_agent_if_missing \
  "QA Verifier" \
  "$CODEX_RUNTIME_ID" \
  2 \
  "Tests, browser checks, screenshots, and regression evidence." \
  "agents/outer/qa-verifier.md" \
  '{"custom_args":["--ask-for-approval","on-request"]}'

create_agent_if_missing \
  "Benchmark Scout" \
  "$HERMES_RUNTIME_ID" \
  1 \
  "Benchmark artifact quality, privacy, repeatability, and publication boundary review." \
  "agents/outer/benchmark-scout.md" \
  '{}'

create_agent_if_missing \
  "Ops Mechanic" \
  "$CODEX_RUNTIME_ID" \
  1 \
  "Daemons, CLI paths, config precedence, launchd, and local machine repair." \
  "agents/outer/ops-mechanic.md" \
  '{"custom_args":["--ask-for-approval","on-request"]}'

create_agent_if_missing \
  "Memory Curator" \
  "$CLAUDE_RUNTIME_ID" \
  1 \
  "Synthesis, vault notes, stale-memory checks, and canonical decisions." \
  "agents/outer/memory-curator.md" \
  '{}'
