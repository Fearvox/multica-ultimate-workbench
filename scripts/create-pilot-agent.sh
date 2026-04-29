#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/0xvox/multica-ultimate-workbench"

MULTICA_PROFILE="${MULTICA_PROFILE:-desktop-api.multica.ai}"
MULTICA_WORKSPACE_ID="${MULTICA_WORKSPACE_ID:-5470ee5d-0791-4713-beb4-fd6a187d6523}"
CODEX_RUNTIME_ID="${CODEX_RUNTIME_ID:-76228a28-203a-4249-9756-731d3cf68554}"

if [[ "${CONFIRM_CREATE_CODEX_GUARDIAN:-}" != "yes" ]]; then
  cat >&2 <<'MSG'
Refusing to create the Codex Guardian pilot agent.

Set CONFIRM_CREATE_CODEX_GUARDIAN=yes only at action time after verifying
the target Multica profile, workspace, runtime ID, and creation intent.
MSG
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
