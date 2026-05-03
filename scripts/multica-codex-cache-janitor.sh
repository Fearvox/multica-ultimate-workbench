#!/usr/bin/env bash
set -euo pipefail

ROOT="${MULTICA_WORKSPACES_ROOT:-$HOME/multica_workspaces_desktop-api.multica.ai}"
MIN_AGE_MINUTES="${MIN_AGE_MINUTES:-5}"
APPLY=0
VERBOSE=0

usage() {
  cat <<'USAGE'
Usage: scripts/multica-codex-cache-janitor.sh [--apply] [--root PATH] [--min-age-minutes N] [--verbose]

Prunes Multica per-run Codex plugin sync caches at */codex-home/.tmp.

Safety rules:
  - default mode is dry-run
  - only deletes runs with .gc_meta.json containing completed_at
  - only deletes .tmp dirs older than --min-age-minutes
  - never touches workdir, logs, output, config, auth, or sessions

Environment:
  MULTICA_WORKSPACES_ROOT  override workspace root
  MIN_AGE_MINUTES         default minimum age before delete
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --apply)
      APPLY=1
      shift
      ;;
    --root)
      ROOT="${2:?missing value for --root}"
      shift 2
      ;;
    --min-age-minutes)
      MIN_AGE_MINUTES="${2:?missing value for --min-age-minutes}"
      shift 2
      ;;
    --verbose)
      VERBOSE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if ! [[ "$MIN_AGE_MINUTES" =~ ^[0-9]+$ ]]; then
  echo "--min-age-minutes must be a non-negative integer" >&2
  exit 2
fi

mtime_epoch() {
  local path="$1"
  local value

  if value="$(stat -f %m "$path" 2>/dev/null)" && [[ "$value" =~ ^[0-9]+$ ]]; then
    printf '%s\n' "$value"
    return
  fi

  stat -c %Y "$path"
}

size_kib() {
  du -sk "$1" 2>/dev/null | awk '{print $1 + 0}'
}

has_completed_meta() {
  local run_dir="$1"
  local meta="$run_dir/.gc_meta.json"
  [ -f "$meta" ] || return 1
  grep -Eq '"completed_at"[[:space:]]*:[[:space:]]*"[^"]+"' "$meta"
}

now="$(date +%s)"
min_age_seconds=$((MIN_AGE_MINUTES * 60))
found=0
eligible=0
removed=0
skipped_active=0
skipped_young=0
freed_kib=0

if [ ! -d "$ROOT" ]; then
  echo "root not found: $ROOT" >&2
  exit 1
fi

while IFS= read -r -d '' tmp_dir; do
  found=$((found + 1))
  codex_home="$(dirname "$tmp_dir")"
  run_dir="$(dirname "$codex_home")"

  if ! has_completed_meta "$run_dir"; then
    skipped_active=$((skipped_active + 1))
    [ "$VERBOSE" -eq 1 ] && echo "skip active-or-unknown: $tmp_dir"
    continue
  fi

  mtime="$(mtime_epoch "$tmp_dir")"
  age_seconds=$((now - mtime))
  if [ "$age_seconds" -lt "$min_age_seconds" ]; then
    skipped_young=$((skipped_young + 1))
    [ "$VERBOSE" -eq 1 ] && echo "skip young: $tmp_dir (${age_seconds}s old)"
    continue
  fi

  eligible=$((eligible + 1))
  kib="$(size_kib "$tmp_dir")"
  freed_kib=$((freed_kib + kib))

  if [ "$APPLY" -eq 1 ]; then
    rm -rf "$tmp_dir"
    removed=$((removed + 1))
    echo "removed ${kib}KiB $tmp_dir"
  else
    echo "would_remove ${kib}KiB $tmp_dir"
  fi
done < <(find "$ROOT" -path '*/codex-home/.tmp' -type d -prune -print0)

mode="dry-run"
[ "$APPLY" -eq 1 ] && mode="apply"

cat <<SUMMARY
mode=$mode
root=$ROOT
found_tmp_dirs=$found
eligible_tmp_dirs=$eligible
removed_tmp_dirs=$removed
skipped_active_or_unknown=$skipped_active
skipped_too_young=$skipped_young
candidate_kib=$freed_kib
SUMMARY
