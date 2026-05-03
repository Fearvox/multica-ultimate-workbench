# Goal Mode v2 — Autonomous Conductor Issue

Use this template when creating goal-driven autonomous work that should persist
across multiple agents, turns, and evidence gates until the objective is
achieved or a real blocker appears.

## Required Header

```text
/goal
GOAL_MODE: yes
GOAL_MODE_V2: yes
HEAVY_PATH: yes
SELF_AWARENESS_REQUIRED: yes
```

## Required Sections

### RAW_REQUIREMENT

<-- operator shorthand or full intent. 3-word shorthands are valid input; the
conductor will expand them during DESIGNING. -->

### NON_NEGOTIABLES

<-- what must NOT be touched: agents, runtimes, lanes, config, secrets. Be
explicit. Default: do not touch Workbench Max, daemon/Desktop/core, live
autopilot config, secrets, OAuth, Vercel production. -->

### SUCCESS_METRIC

<-- what observable state proves the goal is achieved. Not a task list. -->

### OPERATOR_CALL_CONDITIONS

<-- when to stop and ask the human. Default: permission/secret/payment/runtime
mutation, blocked lane is only route, 2 prior failures, design trade-off needs
taste judgment. -->

## Conductor Workflow (for the assignee)

1. Post `GOAL_LOCK` (per workbench-goal-mode-v2 skill)
2. If Heavy: post `SELF_AWARENESS_BOOTSTRAP`
3. If L2_PRESSURE: post `RV_PRESSURE_CHECK`
4. Enter `DESIGNING` → produce `DECISION_PACKET`
5. Enter `DISPATCHING` → create bounded child issues
6. Enter `OBSERVING` → monitor, re-route only on new evidence
7. Enter `REVIEWING` → evaluate against closeout gates
8. Pass → `LEARNING / ARCHIVING` → `NEXT_GOAL` or `DONE`
9. Block → `BLOCKER_CLASSIFIED` → operator call or cooldown retry

## Required Closeout

```text
GOAL_MODE_V2_CLOSEOUT
goal_id:
objective:
state_machine_path:
decision_packets_produced:
issues_dispatched:
evidence_harvested:
noise_cancelled:
operator_calls:
residual_risk:
archive_actions_taken:
verdict: PASS | FLAG | BLOCK
```

## Related

- Skill: `skills/workbench-goal-mode-v2/SKILL.md`
- Autopilot: `autopilots/goal-conductor.md`
- State machine: see SKILL.md for full diagram and transition rules
- Dedupe/cooldown policy: see SKILL.md "Dedupe, Cooldown, and Noise Controls"
