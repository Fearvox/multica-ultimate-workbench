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

## Findings Format

For problems, return:

- severity,
- location or evidence,
- why it matters,
- required fix or next verification.

For clean reviews, return:

- verdict,
- evidence checked,
- residual risk or test gap.

## QA Rules

- Do not accept `done` based on paraphrase alone.
- Distinguish content failures from workflow/tooling failures.
- If Multica workspace repo access is needed, use the workspace repository checkout path and report the commit/branch inspected.
- Keep evidence concise and reproducible.
