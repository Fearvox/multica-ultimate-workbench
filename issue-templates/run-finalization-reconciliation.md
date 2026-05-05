# Run Finalization Reconciliation

## Summary

Fix or review a lifecycle mismatch where final output or result comments exist
but the associated run is still active.

## Scope

- Issue:
- Run ID:
- Agent/runtime:
- Observed issue status:
- Observed run status:
- Final output evidence:
- Duplicate comment evidence:

## Expected Behavior

- Result comments are idempotent under retry.
- A run reaches a terminal state before the issue is closed or passed.
- If terminal state cannot be proven, the issue remains `in_review` or moves to
  `blocked` with a clear reason.
- Token, cache-token, output-token, credit, wall-clock, tool-call, and
  message-count fields are reported when available.

## Required Checks

```bash
multica issue get <issue-id> --output json
multica issue comment list <issue-id> --output json
multica issue runs <issue-id> --output json
scripts/collect-flight-recorder.sh <issue-id>
```

## Report Block

```text
RUN_FINALIZATION_RECONCILIATION
target_issue:
run_id:
observed_issue_status:
observed_run_status:
final_comment_id:
duplicate_comment_ids:
timeout_evidence:
telemetry_available:
action_taken:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

## Acceptance Criteria

- `scripts/collect-flight-recorder.sh <issue-id>` reports no active runs for a
  review/terminal issue, or reports an explicit `FLAG`/`BLOCK`.
- Retry does not create a second equivalent result comment.
- Reviewer can distinguish answer quality from control-plane lifecycle health.
- Any efficiency claim names the exact visible telemetry fields, or states that
  telemetry is absent.

## Safety

Do not paste raw run messages, private workspace IDs, private URLs, secrets,
screenshots, or personal names into public comments or PR text.
