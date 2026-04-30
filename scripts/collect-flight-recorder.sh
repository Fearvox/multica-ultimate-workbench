#!/usr/bin/env bash
set -euo pipefail

MULTICA_PROFILE="${MULTICA_PROFILE:-desktop-api.multica.ai}"
MULTICA_WORKSPACE_ID="${MULTICA_WORKSPACE_ID:-5470ee5d-0791-4713-beb4-fd6a187d6523}"
COMMENT_LIMIT="${FLIGHT_RECORDER_COMMENT_LIMIT:-50}"
MAX_RUN_MESSAGES_WARN="${FLIGHT_RECORDER_MAX_RUN_MESSAGES_WARN:-150}"
MAX_COMMENT_CHARS_WARN="${FLIGHT_RECORDER_MAX_COMMENT_CHARS_WARN:-8000}"

usage() {
  cat <<'USAGE'
Usage:
  scripts/collect-flight-recorder.sh <issue-id> [--artifact-dir DIR]

Read-only Multica run digest collector.

Defaults:
  - Prints a compact Markdown RUN_DIGEST to stdout.
  - Writes no persistent files unless --artifact-dir is provided.
  - Never stores raw issue, comment, or run-message payloads.

Environment:
  MULTICA_PROFILE
  MULTICA_WORKSPACE_ID
  FLIGHT_RECORDER_COMMENT_LIMIT
  FLIGHT_RECORDER_MAX_RUN_MESSAGES_WARN
  FLIGHT_RECORDER_MAX_COMMENT_CHARS_WARN
USAGE
}

ISSUE_ID=""
ARTIFACT_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --artifact-dir)
      ARTIFACT_DIR="${2:-}"
      if [[ -z "$ARTIFACT_DIR" ]]; then
        echo "ERROR: --artifact-dir requires a directory" >&2
        exit 2
      fi
      shift 2
      ;;
    -*)
      echo "ERROR: unknown flag: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [[ -n "$ISSUE_ID" ]]; then
        echo "ERROR: only one issue id is accepted" >&2
        exit 2
      fi
      ISSUE_ID="$1"
      shift
      ;;
  esac
done

if [[ -z "$ISSUE_ID" ]]; then
  usage >&2
  exit 2
fi

if ! command -v multica >/dev/null 2>&1; then
  echo "ERROR: multica CLI not found" >&2
  exit 127
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq not found" >&2
  exit 127
fi

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/workbench-flight-recorder.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT

json_payload() {
  awk '
    /^[[:space:]]*[\[{]/ { seen = 1 }
    seen { print }
  '
}

redact_text() {
  sed -E \
    -e 's/(Authorization:[[:space:]]*Bearer[[:space:]]+)[A-Za-z0-9._~+\/=-]+/\1[REDACTED]/Ig' \
    -e 's/([A-Za-z_][A-Za-z0-9_]*(KEY|TOKEN|SECRET|PASSWORD)[A-Za-z0-9_]*=)[^[:space:]"'"'"',;}]+/\1[REDACTED]/g' \
    -e 's/(sk-[A-Za-z0-9_-]{20,})/[REDACTED]/g'
}

multica_workbench() {
  multica --profile "$MULTICA_PROFILE" --workspace-id "$MULTICA_WORKSPACE_ID" "$@"
}

capture_json() {
  local target="$1"
  shift

  local raw="$TMP_DIR/raw.out"
  local err="$TMP_DIR/raw.err"
  : > "$raw"
  : > "$err"

  if "$@" > "$raw" 2> "$err"; then
    json_payload < "$raw" > "$target" || true
  else
    json_payload < "$raw" > "$target" || true
  fi

  if ! jq empty "$target" >/dev/null 2>&1; then
    printf 'null\n' > "$target"
  fi
}

ISSUE_JSON="$TMP_DIR/issue.json"
COMMENTS_JSON="$TMP_DIR/comments.json"
RUNS_JSON="$TMP_DIR/runs.json"
ISSUE_SUMMARY="$TMP_DIR/issue-summary.json"
COMMENTS_SUMMARY="$TMP_DIR/comments-summary.json"
RUNS_SUMMARY="$TMP_DIR/runs-summary.json"
MESSAGES_SUMMARY="$TMP_DIR/run-message-summary.json"
DIGEST="$TMP_DIR/run-digest.md"

capture_json "$ISSUE_JSON" multica_workbench issue get "$ISSUE_ID" --output json
capture_json "$COMMENTS_JSON" multica_workbench issue comment list "$ISSUE_ID" --limit "$COMMENT_LIMIT" --output json
capture_json "$RUNS_JSON" multica_workbench issue runs "$ISSUE_ID" --output json

jq '
  if type == "object" then
    {
      id: (.id // .issue_id // null),
      title: (.title // null),
      status: (.status // .state // null),
      priority: (.priority // null),
      assignee: (.assignee.name // .assignee_name // .assignee // null),
      created_at: (.created_at // .createdAt // null),
      updated_at: (.updated_at // .updatedAt // null),
      description_len: ((.description // .body // .content // "") | tostring | length)
    }
  else
    {}
  end
' "$ISSUE_JSON" > "$ISSUE_SUMMARY"

jq '
  def items:
    if type == "array" then .
    elif type == "object" and (.items | type) == "array" then .items
    elif type == "object" and (.comments | type) == "array" then .comments
    else [] end;
  def body: (.body // .content // .text // .message // "");
  items | map({
    id: (.id // .comment_id // null),
    created_at: (.created_at // .createdAt // null),
    author: (.author.name // .author_name // .created_by.name // .creator.name // .user.name // null),
    body_len: (body | tostring | length),
    has_pass: (body | tostring | test("PASS")),
    has_flag: (body | tostring | test("FLAG")),
    has_block: (body | tostring | test("BLOCK")),
    has_sdd_stage: (body | tostring | test("SDD_STAGE")),
    has_checkout_evidence: (body | tostring | test("multica repo checkout|repo checkout|git status|git -C"))
  })
' "$COMMENTS_JSON" > "$COMMENTS_SUMMARY"

jq '
  def items:
    if type == "array" then .
    elif type == "object" and (.items | type) == "array" then .items
    elif type == "object" and (.runs | type) == "array" then .runs
    else [] end;
  items | map({
    id: (.id // .task_id // .run_id // .execution_id // null),
    status: (.status // .state // null),
    agent: (.agent.name // .agent_name // .assignee.name // .assignee_name // .owner.name // null),
    started_at: (.started_at // .startedAt // .created_at // .createdAt // null),
    completed_at: (.completed_at // .completedAt // .updated_at // .updatedAt // null),
    input_tokens: (.token_usage.input // .tokenUsage.input // .usage.input // .usage.input_tokens // .input_tokens // null),
    output_tokens: (.token_usage.output // .tokenUsage.output // .usage.output // .usage.output_tokens // .output_tokens // null),
    cache_read_tokens: (.token_usage.cache_read_input_tokens // .tokenUsage.cache_read_input_tokens // .usage.cache_read_input_tokens // .cache_read_input_tokens // null),
    cache_write_tokens: (.token_usage.cache_creation_input_tokens // .tokenUsage.cache_creation_input_tokens // .usage.cache_creation_input_tokens // .cache_creation_input_tokens // null)
  })
' "$RUNS_JSON" > "$RUNS_SUMMARY"

printf '[]\n' > "$MESSAGES_SUMMARY"

while IFS= read -r run_id; do
  [[ -n "$run_id" && "$run_id" != "null" ]] || continue

  safe_run_id="$(printf '%s' "$run_id" | tr -cd 'A-Za-z0-9_-')"
  run_messages_json="$TMP_DIR/run-messages-$safe_run_id.json"
  run_messages_summary="$TMP_DIR/run-messages-$safe_run_id-summary.json"

  capture_json "$run_messages_json" multica_workbench issue run-messages "$run_id" --output json

  jq --arg run_id "$run_id" '
    def items:
      if type == "array" then .
      elif type == "object" and (.items | type) == "array" then .items
      elif type == "object" and (.messages | type) == "array" then .messages
      else [] end;
    def txt: (.content // .text // .message // .body // "");
    items as $m |
    {
      run_id: $run_id,
      count: ($m | length),
      max_sequence: (if ($m | length) == 0 then 0 else ($m | map(.sequence // .seq // 0) | max) end),
      first_len: (if ($m | length) == 0 then 0 else ($m[0] | txt | tostring | length) end),
      last_len: (if ($m | length) == 0 then 0 else ($m[-1] | txt | tostring | length) end),
      type_counts: ($m | group_by(.type // "unknown") | map({type: (.[0].type // "unknown"), count: length})),
      has_checkout_evidence: ([$m[] | (txt | tostring | test("multica repo checkout|repo checkout|git status|git -C"))] | any),
      has_verdict_marker: ([$m[] | (txt | tostring | test("PASS|FLAG|BLOCK"))] | any)
    }
  ' "$run_messages_json" > "$run_messages_summary"

  jq --slurpfile item "$run_messages_summary" '. + $item' "$MESSAGES_SUMMARY" > "$TMP_DIR/messages.tmp"
  mv "$TMP_DIR/messages.tmp" "$MESSAGES_SUMMARY"
done < <(jq -r '.[] | .id // empty' "$RUNS_SUMMARY")

collected_at="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
issue_title="$(jq -r '.title // "(unknown)"' "$ISSUE_SUMMARY")"
issue_status="$(jq -r '.status // "(unknown)"' "$ISSUE_SUMMARY")"
issue_assignee="$(jq -r '.assignee // "(none)"' "$ISSUE_SUMMARY")"
comment_count="$(jq 'length' "$COMMENTS_SUMMARY")"
run_count="$(jq 'length' "$RUNS_SUMMARY")"
verdict_count="$(jq '[.[] | select(.has_pass or .has_flag or .has_block)] | length' "$COMMENTS_SUMMARY")"
sdd_count="$(jq '[.[] | select(.has_sdd_stage)] | length' "$COMMENTS_SUMMARY")"
checkout_comment_count="$(jq '[.[] | select(.has_checkout_evidence)] | length' "$COMMENTS_SUMMARY")"
checkout_message_count="$(jq '[.[] | select(.has_checkout_evidence)] | length' "$MESSAGES_SUMMARY")"
failed_run_count="$(jq '[.[] | select((.status // "" | tostring) | test("failed|cancelled|canceled|error|timeout"; "i"))] | length' "$RUNS_SUMMARY")"
max_comment_len="$(jq 'if length == 0 then 0 else map(.body_len) | max end' "$COMMENTS_SUMMARY")"
max_run_messages="$(jq 'if length == 0 then 0 else map(.count) | max end' "$MESSAGES_SUMMARY")"
token_visible_count="$(jq '[.[] | select(.input_tokens != null or .output_tokens != null or .cache_read_tokens != null or .cache_write_tokens != null)] | length' "$RUNS_SUMMARY")"

{
  echo "# RUN_DIGEST"
  echo
  echo "- collected_at_utc: \`$collected_at\`"
  echo "- profile: \`$MULTICA_PROFILE\`"
  echo "- workspace_id: \`$MULTICA_WORKSPACE_ID\`"
  echo "- issue_id: \`$ISSUE_ID\`"
  echo "- title: $(printf '%s' "$issue_title" | redact_text)"
  echo "- status: \`$issue_status\`"
  echo "- assignee: \`$issue_assignee\`"
  echo
  echo "## Evidence Counts"
  echo
  echo "- comments_checked: \`$comment_count\`"
  echo "- runs_checked: \`$run_count\`"
  echo "- verdict_marker_comments: \`$verdict_count\`"
  echo "- sdd_stage_comments: \`$sdd_count\`"
  echo "- checkout_evidence_comments: \`$checkout_comment_count\`"
  echo "- checkout_evidence_run_messages: \`$checkout_message_count\`"
  echo "- token_usage_visible_in_runs_json: \`$token_visible_count\`"
  echo "- max_comment_chars: \`$max_comment_len\`"
  echo "- max_run_messages: \`$max_run_messages\`"
  echo
  echo "## Run Summary"
  echo
  jq -r '
    if length == 0 then
      "- none"
    else
      .[] | "- run `\(.id // "(missing)")`: status=`\(.status // "(unknown)")`, agent=`\(.agent // "(unknown)")`, input=`\(.input_tokens // "n/a")`, output=`\(.output_tokens // "n/a")`, cache_read=`\(.cache_read_tokens // "n/a")`, cache_write=`\(.cache_write_tokens // "n/a")`"
    end
  ' "$RUNS_SUMMARY"
  echo
  echo "## Governor Flags"
  echo

  flags=0
  if [[ "$run_count" -eq 0 ]]; then
    echo "- BLOCK: no execution runs found for this issue."
    flags=$((flags + 1))
  fi
  if [[ "$failed_run_count" -gt 0 ]]; then
    echo "- FLAG: failed/cancelled/error/timeout runs detected: \`$failed_run_count\`."
    flags=$((flags + 1))
  fi
  if [[ "$comment_count" -eq 0 ]]; then
    echo "- FLAG: no comments found; completion evidence is missing."
    flags=$((flags + 1))
  fi
  if [[ "$verdict_count" -eq 0 ]]; then
    echo "- FLAG: no PASS/FLAG/BLOCK marker found in checked comments."
    flags=$((flags + 1))
  fi
  if [[ "$max_comment_len" -gt "$MAX_COMMENT_CHARS_WARN" ]]; then
    echo "- FLAG: max comment length \`$max_comment_len\` exceeds threshold \`$MAX_COMMENT_CHARS_WARN\`."
    flags=$((flags + 1))
  fi
  if [[ "$max_run_messages" -gt "$MAX_RUN_MESSAGES_WARN" ]]; then
    echo "- FLAG: max run message count \`$max_run_messages\` exceeds threshold \`$MAX_RUN_MESSAGES_WARN\`."
    flags=$((flags + 1))
  fi
  if [[ "$token_visible_count" -eq 0 ]]; then
    echo "- INFO: run JSON did not expose token usage fields; use UI/API billing view for quota attribution."
    flags=$((flags + 1))
  fi
  if [[ "$flags" -eq 0 ]]; then
    echo "- none"
  fi
  echo
  echo "## Persistence"
  echo
  if [[ -n "$ARTIFACT_DIR" ]]; then
    echo "- artifact_dir: \`$ARTIFACT_DIR\`"
    echo "- raw_payloads_saved: \`false\`"
  else
    echo "- artifact_dir: \`disabled\`"
    echo "- raw_payloads_saved: \`false\`"
  fi
} > "$DIGEST"

if [[ -n "$ARTIFACT_DIR" ]]; then
  mkdir -p "$ARTIFACT_DIR"
  cp "$ISSUE_SUMMARY" "$ARTIFACT_DIR/issue-summary.json"
  cp "$COMMENTS_SUMMARY" "$ARTIFACT_DIR/comments-summary.json"
  cp "$RUNS_SUMMARY" "$ARTIFACT_DIR/runs-summary.json"
  cp "$MESSAGES_SUMMARY" "$ARTIFACT_DIR/run-message-summary.json"
  cp "$DIGEST" "$ARTIFACT_DIR/run-digest.md"
fi

redact_text < "$DIGEST"
