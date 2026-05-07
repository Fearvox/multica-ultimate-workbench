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

## Inner Ring Routing Rules

Workbench Admin owns Friction Tier selection at intake:

- `FAST_PATH` for low-risk reading, summaries, copy, ACKs, empty scaffolds, and
  other no-code/no-secret/no-runtime work.
- `STANDARD_PATH` for ordinary patches, demos, tests, PR prep, and visual fixes
  with touched-path verification.
- `HEAVY_PATH` for runtime, agents/autopilots, deploy, payment, OAuth, secrets,
  branch/merge, public proof, daemon/Desktop/core, and remote VM work.

Workbench Supervisor owns tier enforcement at review:

- upgrade the tier when evidence shows higher risk;
- require Temporal Pincer for Heavy PASS/done/ready-to-merge claims;
- apply Completion Cooling after 75% so late-stage work verifies, commits, or
  hands off instead of adding scope;
- put new ideas into the one-line Parking Lot and wait 24 hours before
  assignment, issue creation, or doc expansion.

## Remote Execution Cell

| Agent | Ring | Preferred Runtime | Visibility | Max Concurrent Tasks | Primary Trigger |
| --- | --- | --- | --- | ---: | --- |
| NYC Codex Builder | Outer | Codex on `<REMOTE_MULTICA_DEVICE>` | private | 2 | Assigned long repo/build/benchmark issue |
| NYC Hermes Researcher | Outer | Hermes on `<REMOTE_MULTICA_DEVICE>` | private | 3 | Assigned long-context research or batch knowledge issue |
| NYC Ops Mechanic | Outer | Codex on `<REMOTE_MULTICA_DEVICE>` | private | 1 | Assigned remote runtime health issue |
| NYC VM Runner | Outer | Codex on `<REMOTE_MULTICA_DEVICE>` | private | 1 | Assigned remote VM/browser/sandbox issue |
| Remote Algorithm Advisor | Outer | Claude Code VM / GPT-5.5 xhigh | private | 1 | Assigned Algorithm Advisory Gate issue |

Remote agents are execution cells, not new orchestrators. They must use the `Ultimate Workbench` GitHub repo resource as the primary source. The laptop-only `file://<LOCAL_WORKBENCH_REPO>` workspace repo is not a valid checkout anchor on `<REMOTE_MULTICA_DEVICE>`.

Remote Hermes and remote VM work may also receive `L2_PRESSURE: yes` or
`RV_PRESSURE: required`. In that case the assigned owner follows
[workbench-l2-pressure-gate](../skills/workbench-l2-pressure-gate/SKILL.md): verify
Research Vault access, post `RV_PRESSURE_CHECK`, apply prior failures and proven
patterns to the route, and avoid raw vault dumps.

## Shared Wake Reports

Any Workbench role that answers "gm", "where are we", "what can move now",
"最近干了什么", or a dropped-lead/session-catchup request follows
[workbench-waking-up](../skills/workbench-waking-up/SKILL.md): recall memory
leads, verify live repo/issue/automation/runner state, report drift before new
work, and bridge reusable direct-chat discoveries into durable public-safe
Workbench surfaces.

## Shared Hermes Docs Sync

Any Hermes-family role that reviews Claude-authored public docs, skill-map
changes, install instructions, agent role docs, issue templates, or
Super.engineering/Hermes speed-match writeups follows
[workbench-hermes-docs-sync](../skills/workbench-hermes-docs-sync/SKILL.md).
Hermes reviews coverage and public safety after Claude Code drafts the patch;
it does not silently mutate live runtime config or rewrite unrelated docs.

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
