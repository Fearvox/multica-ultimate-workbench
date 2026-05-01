---
name: workbench-goal-mode
description: Goal-persistence execution wrapper for autonomous work that must continue across turns until the stated objective is actually satisfied.
---

# Workbench Goal Mode

Use this skill when an issue contains `/goal`, `GOAL_MODE: yes`, asks for full
autonomous completion, or asks an agent to keep working until a concrete outcome
is achieved.

Goal Mode is an execution wrapper, not a permission override. It keeps the
objective alive across turns, reruns, local fixes, and partial evidence, while
preserving existing approval, safety, and review gates.

## Activation

Before changing files or live resources, post a compact lock:

```text
GOAL_LOCK:
objective:
owner:
non_goals:
closeout_gates:
operator_call_conditions:
```

- `objective` is the user-visible outcome, not a task list.
- `owner` is one assigned agent or human owner.
- `non_goals` prevents the agent from expanding into adjacent work.
- `closeout_gates` names the evidence required before claiming done.
- `operator_call_conditions` names the few cases where human input is needed.

## Execution Rules

1. Build a checklist from the locked goal, then execute it.
2. Do not stop after a local fix if the broader goal remains unverified.
3. When a command, build, test, or smoke fails, investigate and repair before
   asking for help.
4. Treat repeated identical failures as a mechanism problem: change the probe or
   report the exact blocker instead of retrying the same action.
5. Use fresh reruns when context is stale, repo state changed, auth changed, or
   the previous run was bound to the wrong repo/resource.
6. Preserve issue-level scope, approval gates, secrets boundaries, and runtime
   ownership. `/goal` does not permit destructive cleanup, force pushes, hidden
   live mutations, broad repo reads, or credential handling.

## Required Closeout Gates

For code, ops, or workflow-changing tasks, address every relevant gate before
claiming completion:

- `build`: documented build or closest real startup/build smoke.
- `test`: targeted tests plus the smallest meaningful regression check.
- `help_smoke`: CLI help, startup, UI load, or endpoint smoke when command/user
  surfaces changed.
- `docs_report`: docs, changelog, handoff, or explicit "not needed" rationale.
- `git_status`: clean state or intentionally explained dirty state.
- `evidence`: exact commands, files, links, screenshots, issue IDs, run IDs, or
  artifact paths.

If a gate does not apply, say why. A skipped gate without rationale is `FLAG`.

## Operator Call Conditions

Call the operator only for true external blockers:

- missing credentials or approval that cannot be inferred from the issue;
- unavailable third-party service or remote host;
- destructive or irreversible operation approval;
- repo/resource access failure that cannot be fixed inside the assigned context;
- requirement conflict where continuing would change the user's goal.

The blocker report must include attempted fixes, exact evidence, and the smallest
operator action needed.

## Closeout Contract

Use this scaffold:

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

`PASS` means the locked objective is achieved and every relevant closeout gate
has evidence. `FLAG` means useful progress remains reviewable but a gate or risk
is unresolved. `BLOCK` means the objective cannot be safely completed without an
operator or upstream fix.
