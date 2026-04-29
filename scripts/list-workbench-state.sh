#!/usr/bin/env bash
set -euo pipefail

MULTICA_PROFILE="${MULTICA_PROFILE:-desktop-api.multica.ai}"
MULTICA_WORKSPACE_ID="${MULTICA_WORKSPACE_ID:-5470ee5d-0791-4713-beb4-fd6a187d6523}"

redact_state_output() {
  sed -E \
    -e "/([Aa][Uu][Tt][Hh][Oo][Rr][Ii][Zz][Aa][Tt][Ii][Oo][Nn]|[Cc][Oo][Oo][Kk][Ii][Ee]|[Xx]-[Aa][Pp][Ii]-[Kk][Ee][Yy]|[Aa][Pp][Ii]-[Kk][Ee][Yy]|[Aa][Pp][Ii]_[Kk][Ee][Yy]|[Aa][Pp][Ii][Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt]|[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]|[A-Za-z_][A-Za-z0-9_]*_([Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt]))/s/.*/[REDACTED SENSITIVE LINE]/" \
    -e "s/([A-Za-z_][A-Za-z0-9_]*_([Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt])=)[^[:space:]\"',;}]+/\\1[REDACTED]/g"
}

multica_workbench() {
  multica --profile "$MULTICA_PROFILE" --workspace-id "$MULTICA_WORKSPACE_ID" "$@"
}

summarize_json_or_raw() {
  local jq_filter="$1"

  if command -v jq >/dev/null 2>&1; then
    jq "$jq_filter" 2>/dev/null || true
  else
    cat
  fi
}

echo "== Workbench state =="
date

echo
echo "== Tool paths =="
for bin in multica codex claude hermes; do
  if command -v "$bin" >/dev/null 2>&1; then
    type -a "$bin"
  else
    echo "MISSING: $bin"
  fi
done

echo
echo "== Multica workspace (profile: $MULTICA_PROFILE, workspace: $MULTICA_WORKSPACE_ID) =="
(multica_workbench workspace get "$MULTICA_WORKSPACE_ID" --output json 2>/dev/null || true) \
  | summarize_json_or_raw '{id:(.id // .workspace_id), name:(.name // .display_name // .title)}' \
  | redact_state_output

echo
echo "== Multica workspaces (profile: $MULTICA_PROFILE, workspace: $MULTICA_WORKSPACE_ID) =="
(multica_workbench workspace list 2>/dev/null || true) | redact_state_output

echo
echo "== Multica runtimes (profile: $MULTICA_PROFILE, workspace: $MULTICA_WORKSPACE_ID) =="
(multica_workbench runtime list --output json 2>/dev/null || true) \
  | summarize_json_or_raw '[.. | objects | select(.provider? != null) | {id:(.id // .runtime_id), name:(.name // .display_name), provider, status:(.status // .state // if .online == true then "online" elif .online == false then "offline" else null end)}] | unique_by(.id)' \
  | redact_state_output

echo
echo "== Multica agents (profile: $MULTICA_PROFILE, workspace: $MULTICA_WORKSPACE_ID) =="
(multica_workbench agent list --output json 2>/dev/null || true) \
  | summarize_json_or_raw '[.. | objects | select((.runtime_id? != null) or (.runtimeId? != null) or (.runtime?.id? != null)) | {id:(.id // .agent_id), name:(.name // .display_name), runtime_id:(.runtime_id // .runtimeId // .runtime.id), visibility:(.visibility // .access // .scope)}] | unique_by(.id)' \
  | redact_state_output

echo
echo "== Codex approval options =="
codex --help 2>/dev/null | sed -n '/--ask-for-approval/,+18p' || true

echo
echo "== Git status for workbench repo =="
git -C /Users/0xvox/multica-ultimate-workbench status --short || true
