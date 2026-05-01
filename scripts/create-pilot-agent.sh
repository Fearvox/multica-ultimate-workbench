#!/usr/bin/env bash
set -euo pipefail

ROOT="${WORKBENCH_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

MULTICA_PROFILE="${MULTICA_PROFILE:-desktop-api.multica.ai}"
: "${MULTICA_WORKSPACE_ID:?Set MULTICA_WORKSPACE_ID before creating agents}"
: "${CODEX_RUNTIME_ID:?Set CODEX_RUNTIME_ID before creating agents}"

if [[ "${CONFIRM_CREATE_CODEX_GUARDIAN:-}" != "yes" ]]; then
  cat >&2 <<'MSG'
Refusing to create the Codex Guardian pilot agent.

Set CONFIRM_CREATE_CODEX_GUARDIAN=yes only at action time after verifying
the target Multica profile, workspace, runtime ID, and creation intent.
MSG
  exit 1
fi

target_mismatch=0

if [[ -n "${EXPECTED_MULTICA_PROFILE:-}" && "$MULTICA_PROFILE" != "$EXPECTED_MULTICA_PROFILE" ]]; then
  printf 'Target mismatch: MULTICA_PROFILE=%q, expected %q\n' "$MULTICA_PROFILE" "$EXPECTED_MULTICA_PROFILE" >&2
  target_mismatch=1
fi

if [[ -n "${EXPECTED_MULTICA_WORKSPACE_ID:-}" && "$MULTICA_WORKSPACE_ID" != "$EXPECTED_MULTICA_WORKSPACE_ID" ]]; then
  printf 'Target mismatch: MULTICA_WORKSPACE_ID=%q, expected %q\n' "$MULTICA_WORKSPACE_ID" "$EXPECTED_MULTICA_WORKSPACE_ID" >&2
  target_mismatch=1
fi

if [[ -n "${EXPECTED_CODEX_RUNTIME_ID:-}" && "$CODEX_RUNTIME_ID" != "$EXPECTED_CODEX_RUNTIME_ID" ]]; then
  printf 'Target mismatch: CODEX_RUNTIME_ID=%q, expected %q\n' "$CODEX_RUNTIME_ID" "$EXPECTED_CODEX_RUNTIME_ID" >&2
  target_mismatch=1
fi

if [[ "$target_mismatch" -ne 0 ]]; then
  echo "Refusing to create Codex Guardian because the effective target does not exactly match the verified pilot target." >&2
  echo "No Multica call was made." >&2
  exit 1
fi

multica --profile "$MULTICA_PROFILE" --workspace-id "$MULTICA_WORKSPACE_ID" agent create \
  --name "Codex Guardian" \
  --description "High-risk local ops, command approval, rollback planning, and evidence-first verification." \
  --instructions "$(cat "$ROOT/agents/outer/codex-guardian.md")" \
  --runtime-id "$CODEX_RUNTIME_ID" \
  --runtime-config '{"custom_args":["--ask-for-approval","on-request"]}' \
  --max-concurrent-tasks 1 \
  --visibility private \
  --output json
