#!/usr/bin/env bash
set -euo pipefail

redact_state_output() {
  sed -E \
    -e "/([Aa][Uu][Tt][Hh][Oo][Rr][Ii][Zz][Aa][Tt][Ii][Oo][Nn]|[Cc][Oo][Oo][Kk][Ii][Ee]|[Xx]-[Aa][Pp][Ii]-[Kk][Ee][Yy]|[Aa][Pp][Ii]-[Kk][Ee][Yy]|[Aa][Pp][Ii]_[Kk][Ee][Yy]|[Aa][Pp][Ii][Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt]|[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd])/s/.*/[REDACTED SENSITIVE LINE]/" \
    -e "s/([A-Za-z_][A-Za-z0-9_]*_([Kk][Ee][Yy]|[Tt][Oo][Kk][Ee][Nn]|[Ss][Ee][Cc][Rr][Ee][Tt])=)[^[:space:]\"',;}]+/\\1[REDACTED]/g"
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
echo "== Multica workspace =="
(multica workspace get --output json 2>/dev/null || true) | redact_state_output

echo
echo "== Multica workspaces =="
(multica workspace list 2>/dev/null || true) | redact_state_output

echo
echo "== Multica runtimes =="
(multica runtime list --output json 2>/dev/null || multica runtime list 2>/dev/null || true) | redact_state_output

echo
echo "== Multica agents =="
(multica agent list --output json 2>/dev/null || multica agent list 2>/dev/null || true) | redact_state_output

echo
echo "== Codex approval options =="
codex --help 2>/dev/null | sed -n '/--ask-for-approval/,+18p' || true

echo
echo "== Git status for workbench repo =="
git -C /Users/0xvox/multica-ultimate-workbench status --short || true
