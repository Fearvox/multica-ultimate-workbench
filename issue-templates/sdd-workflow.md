# SDD Workflow Issue Template

## Goal

State the concrete outcome the user needs.

## Context

List the source request, repo, branch, relevant files, prior issue/comment IDs, and constraints.

## Intake / Project Routing

- Intake source: `quick-capture` / `direct-chat` / `manual-issue` / `autopilot` / `agent-created`
- Project:
- Repo resource:
- Source URL, if enriched:
- Literal request preserved: yes/no

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

Use the Friction Tier Router before SDD. Full SDD applies when Standard or Heavy
work needs product/technical/task staging. Workbench Admin may mark
`SDD_BYPASS: fast-path`, `SDD_BYPASS: quick-fix`, or `SDD_BYPASS: emergency`
only for low-risk, explicit, or time-critical tasks, and Supervisor still
reviews the execution result before close.

## Goal Mode

Use `GOAL_MODE: yes` when the owner must keep the objective alive across turns,
reruns, local fixes, and partial evidence until the stated outcome is verified.
Goal Mode does not bypass approval gates, secrets rules, repo-anchor checks, or
Supervisor review.

- `GOAL_MODE`: yes/no
- `GOAL_LOCK` if yes:
  - objective:
  - owner:
  - non_goals:
  - closeout_gates: build / test / help_smoke / docs_report / git_status / evidence
  - operator_call_conditions:

## Approval Gates

- Supervisor PASS is required between SDD stages unless a documented bypass applies.
- Commands requiring confirmation:
- Patches requiring confirmation:
- Data transmission requiring confirmation:

## Evidence Budget

- Every stage must name exact evidence IDs: comment IDs, run IDs, commit hashes, artifact paths, or file paths.
- Prefer the prior stage `HANDOFF_SUMMARY` plus named `SCOPED_EVIDENCE` before reading full comment history.
- Do not read full issue lists, full agent rosters, or unrelated docs unless the stage explains why.
- If the artifact cannot fit in one reviewable comment, compress it before posting instead of splitting it.

## Rerun Policy

Use a fresh rerun instead of extending a polluted run when repo context, branch state, auth state, runtime config, or prior issue state is stale. The rerun must cite the previous run ID and start from the newest `HANDOFF_SUMMARY` and `SCOPED_EVIDENCE`.

## Raw Requirement

```text
SDD_STAGE: Raw Requirement
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
INTAKE_SOURCE:
PROJECT:
REPO_RESOURCE:
URL_CONTEXT:
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:
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
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:
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
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:
```

- Runtime owner:
- Execution target: `local-worktree` / `agent-cli` / `capy-vm` / `human-desktop`
- Data path:
- Files/resources to modify:
- Integration points:
- VM lease, if `capy-vm`:
  - owner issue id:
  - owner agent:
  - image:
  - ttl minutes:
  - network policy:
  - secrets policy:
  - artifact dir:
- Risk surface:
- Verification approach:

## Algorithm Advisory Gate

Use this stage when the Technical Design has meaningful algorithm,
data-structure, ranking, search, cache, queue, graph, streaming, ingestion,
dedupe, or complexity risk.

```text
SDD_STAGE: Algorithm Advisory Gate
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:
```

- Runtime:
- Model:
- Isolation:
- Skill sources:
- Code scope:
- Correctness verdict: PASS / BLOCK
- Complexity verdict: PASS / FLAG / BLOCK
- Data-structure notes:
- Algorithmic risks:
- Task List injections:
- Verification injections:
- Settings readback:
- Residual risk:
- Next stage handoff:

## Task List

```text
SDD_STAGE: Task List
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:
```

- Tasks:
- Dependencies:
- Execution owner:
- Execution target:
- Goal mode: yes/no
- Goal lock, if yes:
  - objective:
  - non-goals:
  - closeout gates:
  - operator-call conditions:
- Approval gates:
- Artifacts required:
- Teardown rule:
- Verification commands:
- Reporting format:

## Execution And Verification

```text
SDD_STAGE: Execution And Verification
OWNER:
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:
```

1. What changed.
2. Changed files/resources.
3. Verification commands and results.
4. Commit hash or artifact link.
5. Goal Mode closeout gates, if applicable.
6. Residual risk or missing verification.
7. Next action.
