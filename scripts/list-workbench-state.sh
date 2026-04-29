#!/usr/bin/env bash
set -euo pipefail

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
multica workspace get --output json 2>/dev/null || true

echo
echo "== Multica workspaces =="
multica workspace list 2>/dev/null || true

echo
echo "== Multica runtimes =="
multica runtime list --output json 2>/dev/null || multica runtime list 2>/dev/null || true

echo
echo "== Multica agents =="
multica agent list --output json 2>/dev/null || multica agent list 2>/dev/null || true

echo
echo "== Codex approval options =="
codex --help 2>/dev/null | sed -n '/--ask-for-approval/,+18p' || true

echo
echo "== Git status for workbench repo =="
git -C /Users/0xvox/multica-ultimate-workbench status --short || true
