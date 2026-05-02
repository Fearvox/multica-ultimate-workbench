# Agent Roster

| Agent | Ring | Preferred Runtime | Visibility | Max Concurrent Tasks | Primary Trigger |
| --- | --- | --- | --- | ---: | --- |
| Workbench Admin | Inner | Claude Code + Mimo | private | 2 | Direct chat, issue assignment |
| Workbench Supervisor | Inner | Codex or Claude Code | private | 2 | @mention review, assigned review issue |
| Workbench Synthesizer | Inner | Hermes or Claude Code | private | 1 | Checkpoint issue, autopilot-created issue |
| Codex Guardian | Outer | Codex | private | 1 | Assigned high-risk issue |
| Codex Developer | Outer | Codex | private | 2 | Assigned implementation issue |
| Hermes Researcher | Outer | Hermes | private | 3 | @mention research, assigned research issue |
| Claude Architect | Outer | Claude Code + Mimo | private | 2 | @mention architecture review |
| Claude Docs | Outer | Claude Code + Mimo | private | 2 | Assigned docs issue |
| QA Verifier | Outer | Codex | private | 2 | @mention verification, assigned QA issue |
| Workbench VM Runner | Outer | Codex | private | 1 | Assigned `capy-vm` issue |
| Benchmark Scout | Outer | Hermes or Codex | private | 1 | Assigned benchmark review issue |
| Ops Mechanic | Outer | Codex | private | 1 | Assigned ops issue |
| Memory Curator | Outer | Claude Code or Hermes | private | 1 | Assigned synthesis/memory issue |

## Remote Execution Cell

| Agent | Ring | Preferred Runtime | Visibility | Max Concurrent Tasks | Primary Trigger |
| --- | --- | --- | --- | ---: | --- |
| NYC Codex Builder | Outer | Codex on `<REMOTE_MULTICA_DEVICE>` | private | 2 | Assigned long repo/build/benchmark issue |
| NYC Hermes Researcher | Outer | Hermes on `<REMOTE_MULTICA_DEVICE>` | private | 3 | Assigned long-context research or batch knowledge issue |
| NYC Ops Mechanic | Outer | Codex on `<REMOTE_MULTICA_DEVICE>` | private | 1 | Assigned remote runtime health issue |
| NYC VM Runner | Outer | Codex on `<REMOTE_MULTICA_DEVICE>` | private | 1 | Assigned remote VM/browser/sandbox issue |

Remote agents are execution cells, not new orchestrators. They must use the `Ultimate Workbench` GitHub repo resource as the primary source. The laptop-only `file://<LOCAL_WORKBENCH_REPO>` workspace repo is not a valid checkout anchor on `<REMOTE_MULTICA_DEVICE>`.

Remote Hermes and remote VM work may also receive `L2_PRESSURE: yes` or
`RV_PRESSURE: required`. In that case the assigned owner follows
[workbench-l2-pressure-gate](../skills/workbench-l2-pressure-gate/SKILL.md): verify
Research Vault access, post `RV_PRESSURE_CHECK`, apply prior failures and proven
patterns to the route, and avoid raw vault dumps.

## Preserved Special Bench

| Agent | Ring | Preferred Runtime | Visibility | Max Concurrent Tasks | Primary Trigger |
| --- | --- | --- | --- | ---: | --- |
| Workbench Max | Special | Codex | private | 6 | Human-explicit assignment only |

`Workbench Max` is a preserved companion workbench, not part of the default Inner or Outer Ring routing pool. Do not modify its instructions, bindings, or role unless the human explicitly asks.

## Shared Goal Mode

Any assigned owner may receive `/goal` or `GOAL_MODE: yes`. In that case the
agent follows [workbench-goal-mode](../skills/workbench-goal-mode/SKILL.md): lock the
objective, execute through the relevant closeout gates, and report `PASS`,
`FLAG`, or `BLOCK` from evidence instead of stopping after a partial local fix.
