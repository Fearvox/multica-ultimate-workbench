# Run Finalization Reconciliation Lane

This lane handles the control-plane failure where an agent produces final
output, posts or retries a result comment, and the issue moves to review while
the run record remains active.

It is not an answer-quality lane. It is a lifecycle correctness lane.

## Problem

External-worker setups are useful only when the operator can trust the control
plane. A good answer with a stuck run is still operationally expensive:

- the operator waits on a run that has already produced usable output;
- a foreground issue or comment command may time out after doing the side
  effect;
- a retry can duplicate the result comment;
- `in_review` stops being a reliable signal that execution has settled;
- token, credit, wall-clock, tool-call, and message-count claims remain
  unverifiable when run telemetry is absent.

## Invariant

When an issue enters `in_review`, `done`, or `blocked`, every related execution
run must be in a terminal or explicitly reconciled state.

Allowed run states:

```text
completed
failed
cancelled
canceled
timeout
needs_reconcile
```

Active run states such as `running`, `in_progress`, `active`, `pending`, or
`queued` require a reconciliation pass before any `PASS` or closeout claim.

## Idempotent Result Comment Rule

Final result comments need a deterministic dedupe key before publish:

```text
result/<issue-id>/<run-id>/<stage>/<normalized-result-hash>
```

If a foreground command times out after posting a comment, the retry must first
query existing comments for the same dedupe key. If the key already exists, the
runtime should reuse the existing comment ID instead of posting again.

## Reconciler Trigger

Run reconciliation should trigger when any of these are true:

- issue status is `in_review`, `done`, or `blocked` while a related run is still
  active;
- an active run's message stream already contains a verdict marker such as
  `PASS`, `FLAG`, or `BLOCK`;
- exact duplicate comment bodies appear after a retry;
- the run has final output evidence but no terminal timestamp;
- token or credit fields are absent when efficiency is part of the claim.

## Required Report

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

Verdict rules:

- `PASS`: issue/review state and run state agree, duplicate comment check is
  clean, and required telemetry is visible or explicitly out of scope.
- `FLAG`: the answer is usable, but lifecycle, duplicate, or telemetry evidence
  needs follow-up.
- `BLOCK`: final output cannot be trusted, closeout would be misleading, or a
  retry would likely duplicate side effects.

## Telemetry Contract

Run records should expose these fields for each run when available:

```text
input_tokens
cache_read_tokens
cache_write_tokens
output_tokens
credit_cost
wall_clock_ms
tool_call_count
message_count
```

If any field is unavailable, reports must say so. Do not claim token or credit
efficiency from comment history alone.

## Flight Recorder Support

`scripts/collect-flight-recorder.sh <issue-id>` surfaces reconciliation signals
without storing raw payloads:

- active run count;
- active runs that already contain verdict markers;
- duplicate comment body counts;
- visibility of token, credit, tool-call, and message-count fields;
- `FLAG` when issue status is review/terminal while active runs remain.

## Public-Surface Safety

Do not commit raw comments, raw run messages, private URLs, live workspace IDs,
operator names, or screenshots. Public artifacts should describe the invariant,
the detection signal, and the required fix.
