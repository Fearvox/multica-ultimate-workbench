# Implementation Issue Template

## Goal

State the concrete behavior or artifact to build.

## Context

List the repo, branch, relevant files, and source-of-truth docs.

## Goal Mode

- `GOAL_MODE`: yes/no
- `GOAL_LOCK` if yes:
  - objective:
  - owner:
  - non_goals:
  - closeout_gates: build / test / help_smoke / docs_report / git_status / evidence
  - operator_call_conditions:

## Owner

Assigned agent:

## Specialists

@mentions requested:

## Systems / Paths

- Repo:
- Files:
- Services:

## Non-goals

- No unrelated refactors.
- No destructive cleanup.
- No public/private boundary changes.

## Approval Gates

- Commands requiring confirmation:
- Patches requiring confirmation:
- Data transmission requiring confirmation:

## Verification

- Command:
- Expected result:
- Screenshot or artifact:
- If `GOAL_MODE: yes`, every relevant closeout gate must have evidence or an explicit not-applicable rationale.

## Reporting Format

For normal issues:

1. What changed.
2. Verification evidence.
3. Residual risk.
4. Next action.

For `GOAL_MODE: yes` issues:

```text
GOAL_LOCK:
WHAT_CHANGED:
VERIFICATION:
DOCS_REPORT:
GIT_STATUS:
RESIDUAL_RISK:
OPERATOR_NEEDED: yes/no
VERDICT: PASS | FLAG | BLOCK
```
