---
name: workbench-review-qa
description: PASS, FLAG, and BLOCK review discipline for workflow review, QA verification, release checks, and issue closeout.
---

# Workbench Review QA

Use this skill for code review, workflow review, QA verification, release checks, and issue closeout.

## Verdicts

- `PASS`: objective is met and evidence is sufficient.
- `FLAG`: useful progress, but a non-blocking issue or missing evidence remains.
- `BLOCK`: objective is not met, unsafe, unverifiable, or materially wrong.

## Review Method

1. Identify the promised objective.
2. Inspect the real output, diff, issue comments, runtime state, or checked-out repo.
3. Compare evidence against the objective.
4. Verify the smallest real path that proves the claim.
5. Report findings first, ordered by severity.
6. Check command syntax and live-resource ownership when the work involves Multica CLI mutations.
7. If duplicate comments or artifacts exist, identify the primary artifact and explain why.

## Findings Format

For problems, return:

- severity,
- location or evidence,
- why it matters,
- required fix or next verification.

For clean reviews, return:

- verdict,
- `VERDICT_SUMMARY`: three lines or fewer,
- evidence checked,
- residual risk or test gap.

Every SDD review should include `VERDICT_SUMMARY` so the next agent can continue from the review header without re-reading the full review body.

## Auto Review Sweeper

For automatic `in_review` handoffs, use this exact block on each reviewed target:

```text
AUTO_REVIEW
TARGET: <identifier>
VERDICT: PASS | FLAG | BLOCK
VERDICT_SUMMARY: three lines or fewer
EVIDENCE: concrete issue/comment/run IDs, commands, or file paths checked
STATUS_ACTION: done | kept in_review | blocked | no_change
NEXT_ACTION: exact next owner/action, or none
```

- `PASS` may move the target issue to `done` only when the original goal is satisfied and no required follow-up remains.
- `FLAG` leaves the issue in `in_review` with a bounded next action.
- `BLOCK` sets the issue to `blocked` with blocking evidence.
- If evidence is still arriving, leave the issue unchanged and mark it pending in the sweep summary.

## QA Rules

- Do not accept `done` based on paraphrase alone.
- Distinguish content failures from workflow/tooling failures.
- If repo access is needed, prefer the issue's project-bound GitHub repo resource and report the commit/branch inspected.
- Treat `file:///Users/0xvox/multica-ultimate-workbench` as laptop-local fallback only; remote runtimes must flag it as invalid unless explicitly mounted.
- Keep evidence concise and reproducible.
- Verify `Workbench Max` remains untouched when a task says it must be preserved.
