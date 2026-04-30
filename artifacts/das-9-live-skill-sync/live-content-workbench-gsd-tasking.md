# Workbench GSD Tasking

Use this skill to turn approved requirements, product designs, or technical designs into executable tasks.

## Tasking Standard

- Each task has one owner, one outcome, one evidence requirement, and one verification path.
- Parallelize only when write scopes or live mutation surfaces are clearly separate.
- Put approval gates before live mutations, destructive changes, external posts, billing changes, or broad binding updates.
- Include rollback or recovery evidence for live resource updates.
- Keep smoke tests separate when they depend on committed source or synchronized live state.

## Task Shape

For each task, include:

- `ID`
- `OWNER`
- `OBJECTIVE`
- `SCOPE`
- `NON-GOALS`
- `INPUTS`
- `OUTPUT`
- `VERIFICATION`
- `ROLLBACK`
- `DEPENDENCIES`

## Output Contract

Return:

- `TASKS`: ordered `T1`, `T2`, `T3` list.
- `GATES`: approval or review points.
- `PARALLELISM`: what can run concurrently and what must serialize.
- `FINAL SMOKE`: end-to-end check.
- `CLOSEOUT`: docs, comments, commits, and residual risks.
