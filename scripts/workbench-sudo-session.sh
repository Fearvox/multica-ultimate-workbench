#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage:
  scripts/workbench-sudo-session.sh -- <command> [args...]

Runs one operator-approved sudo validation, keeps that sudo timestamp alive
with non-interactive refreshes, then runs the command. The keepalive never
reads password files and never prompts again; if the sudo timestamp disappears,
it fails closed.

Example:
  scripts/workbench-sudo-session.sh -- bash -lc 'mo clean --dry-run && mo clean'
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 2 || "${1:-}" != "--" ]]; then
  usage
  exit 2
fi
shift

keepalive_seconds="${WORKBENCH_SUDO_KEEPALIVE_SECONDS:-45}"
if ! [[ "$keepalive_seconds" =~ ^[0-9]+$ ]] || (( keepalive_seconds < 15 )); then
  echo "WORKBENCH_SUDO_KEEPALIVE_SECONDS must be an integer >= 15" >&2
  exit 2
fi

echo "Validating sudo once for this terminal session..." >&2
sudo -v

(
  while true; do
    sudo -n -v 2>/dev/null || exit 0
    sleep "$keepalive_seconds"
  done
) &
keeper_pid=$!

cleanup() {
  kill "$keeper_pid" 2>/dev/null || true
  wait "$keeper_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

"$@"
