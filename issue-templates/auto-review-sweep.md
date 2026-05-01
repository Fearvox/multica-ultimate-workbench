# Auto Review Sweep Template

## Scope

This issue is a sweep controller created by the Auto Review Sweeper autopilot. It is not itself a target for review.

## Target Selection

- Scan `in_review` issues.
- Exclude this sweep issue.
- Exclude `Auto Review Sweep` issues unless a prior failed sweep must be inspected.
- Review at most three target issues.
- Prefer oldest `updated_at` first.

## Required Commands

```bash
multica issue list --output json
multica issue get <target-issue-id> --output json
multica issue comment list <target-issue-id> --output json
multica issue runs <target-issue-id> --output json
```

Checkout before repo-local evidence:

```text
Prefer the target issue's project-bound GitHub repo resource.
Use multica repo checkout file://<LOCAL_WORKBENCH_REPO> only on laptop-local runtimes.
```

On remote runtimes such as `<REMOTE_MULTICA_DEVICE>`, treat the laptop `file://` path as invalid unless the issue proves it is mounted there.

## Target Review Block

```text
AUTO_REVIEW
TARGET: <identifier>
VERDICT: PASS | FLAG | BLOCK
VERDICT_SUMMARY: three lines or fewer
EVIDENCE: concrete issue/comment/run IDs, commands, or file paths checked
STATUS_ACTION: done | kept in_review | blocked | no_change
NEXT_ACTION: exact next owner/action, or none
```

## Sweep Summary

```text
REVIEW_SWEEP_SUMMARY
TARGETS_SCANNED:
TARGETS_REVIEWED:
PASSED_TO_DONE:
FLAGGED_LEFT_IN_REVIEW:
BLOCKED:
PENDING:
RESIDUAL_RISK:
```

## Safety

- Do not edit files.
- Do not mutate agents, runtimes, skills, or autopilots.
- Do not dump raw run messages, secrets, OAuth material, or broad workspace JSON.
- Do not create persistent artifacts unless the target issue explicitly asks for them.
