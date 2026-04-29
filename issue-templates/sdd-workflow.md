# SDD Workflow Issue Template

## Goal

State the concrete outcome the user needs.

## Context

List the source request, repo, branch, relevant files, prior issue/comment IDs, and constraints.

## Owner

Assigned stage owner:

## Systems / Paths

- Repo:
- Files:
- Services:
- Multica issues/comments:

## Non-goals

- No unrelated refactors.
- No destructive cleanup.
- No public/private boundary changes.
- No live Multica agent, runtime, autopilot, daemon, Desktop UI, or core runtime changes unless explicitly approved.

## SDD Bypass

Use full SDD for non-trivial work. Workbench Admin may mark `SDD_BYPASS: quick-fix` or `SDD_BYPASS: emergency` only for low-risk or time-critical tasks, and Supervisor still reviews the execution result before close.

## Approval Gates

- Supervisor PASS is required between SDD stages unless a documented bypass applies.
- Commands requiring confirmation:
- Patches requiring confirmation:
- Data transmission requiring confirmation:

## Raw Requirement

```text
SDD_STAGE: Raw Requirement
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
```

- Literal request:
- Confirmed facts:
- Assumptions:
- Expected output:
- Known constraints:

## Product Design

```text
SDD_STAGE: Product Design
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
```

- User-facing behavior:
- Success criteria:
- Non-goals:
- Edge cases:
- Next stage handoff:

## Technical Design

```text
SDD_STAGE: Technical Design
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
```

- Runtime owner:
- Data path:
- Files/resources to modify:
- Integration points:
- Risk surface:
- Verification approach:

## Task List

```text
SDD_STAGE: Task List
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
```

- Tasks:
- Dependencies:
- Execution owner:
- Approval gates:
- Verification commands:
- Reporting format:

## Execution And Verification

```text
SDD_STAGE: Execution And Verification
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
```

1. What changed.
2. Changed files/resources.
3. Verification commands and results.
4. Commit hash or artifact link.
5. Residual risk or missing verification.
6. Next action.
