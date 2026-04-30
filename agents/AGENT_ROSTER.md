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
| Benchmark Scout | Outer | Hermes or Codex | private | 1 | Assigned benchmark review issue |
| Ops Mechanic | Outer | Codex | private | 1 | Assigned ops issue |
| Memory Curator | Outer | Claude Code or Hermes | private | 1 | Assigned synthesis/memory issue |

## Preserved Special Bench

| Agent | Ring | Preferred Runtime | Visibility | Max Concurrent Tasks | Primary Trigger |
| --- | --- | --- | --- | ---: | --- |
| Workbench Max | Special | Codex | private | 6 | Human-explicit assignment only |

`Workbench Max` is a preserved companion workbench, not part of the default Inner or Outer Ring routing pool. Do not modify its instructions, bindings, or role unless the human explicitly asks.
