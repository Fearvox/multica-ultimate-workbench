# Synthesis

Date: 2026-04-29

## Current Strategy

The Multica Ultimate Workbench is a durable local operating memory for a Hybrid Multica Two-Ring Workbench. It preserves strategy, decisions, risks, issue templates, agent role definitions, autopilot definitions, and helper scripts without replacing Multica itself.

Multica remains the native collaboration layer for live agents, direct chat, issue execution, comments, runtimes, and autopilots. This repository is the versioned source of truth for workbench design and operating discipline.

Version 1 should stay conservative: no Multica daemon changes, no Desktop UI changes, no core runtime modifications, and no silent high-risk automation.

## Verified Multica Workspace And Runtimes

Verified on 2026-04-29 before any workbench agent creation. Use the explicit read-only prefix:

```bash
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 ...
```

| Field | Value |
| --- | --- |
| Profile | `desktop-api.multica.ai` |
| Workspace | `DASH` |
| Workspace ID | `5470ee5d-0791-4713-beb4-fd6a187d6523` |

| Runtime | ID | Provider | Status |
| --- | --- | --- | --- |
| Claude | `dd23854a-7a38-4d04-8d02-014ba5a9df3d` | `claude` | online |
| Codex | `76228a28-203a-4249-9756-731d3cf68554` | `codex` | online |
| Hermes | `d3a6d5a7-a80e-42ba-9d9e-3cefbc27fcf2` | `hermes` | online |

The existing private `Workbench Max` agent on the Codex runtime must be preserved.

## Live Multica Agent Roster

Verified on 2026-04-29 after full roster creation.

| Agent | ID | Runtime | Visibility | Max Tasks | Status |
| --- | --- | --- | --- | ---: | --- |
| Workbench Admin | `5fb626ce-488c-44cd-81c1-0cfb3ea26bce` | Claude | private | 2 | idle |
| Workbench Supervisor | `4e19cffb-1abe-461a-9026-eeb7155668d1` | Codex | private | 2 | idle |
| Workbench Synthesizer | `3607eb50-98c3-41ae-99de-9f1ccff5c48c` | Hermes | private | 1 | idle |
| Codex Guardian | `28b28318-1ba5-4d41-883e-9763ce66c816` | Codex | private | 1 | idle |
| Codex Developer | `31317f6a-8723-4e5d-ab67-9d02c07d0aab` | Codex | private | 2 | idle |
| Hermes Researcher | `77bfbf5b-0cc7-4797-b703-b17eb700ad32` | Hermes | private | 3 | idle |
| Claude Architect | `36f427ec-5395-4e0b-8168-f4fd02086826` | Claude | private | 2 | idle |
| Claude Docs | `2a4acdbe-c9d3-4394-8194-67f0e90b7d21` | Claude | private | 2 | idle |
| QA Verifier | `45d11e94-303d-480b-b4b9-cffbcf8f79c4` | Codex | private | 2 | idle |
| Benchmark Scout | `54e53ad9-b677-4995-8a56-1c70d99be4c0` | Hermes | private | 1 | idle |
| Ops Mechanic | `cf068511-8cde-455d-9c91-a6cf84d581be` | Codex | private | 1 | idle |
| Memory Curator | `f437828c-a14b-4cc2-9449-6537e426a216` | Claude | private | 1 | idle |

Existing companion agent:

| Agent | ID | Runtime | Visibility | Max Tasks | Status |
| --- | --- | --- | --- | ---: | --- |
| Workbench Max | `4b0198c4-4736-4982-bdd5-ca5cdbb0a456` | Codex | private | 6 | idle |

## Ring Model

### Inner Ring

| Role | Purpose | Boundary |
| --- | --- | --- |
| Command | Convert fuzzy direction into executable issue shape. | Does not run specialist work directly when delegation is clearer. |
| Review | Verify evidence, risks, and completion claims. | Does not accept done without concrete outputs. |
| Synthesis | Maintain strategy, decisions, logs, and next actions. | Does not replace Multica issue/comment history. |

### Outer Ring

| Role | Purpose | Boundary |
| --- | --- | --- |
| Specialist execution | Complete bounded implementation, analysis, or research tasks. | Does not assign work to other Outer Ring agents. |
| Parallel advice | Provide narrow review or options through mentions. | Does not become the owner of the work unless explicitly assigned. |
| Scheduled checks | Use autopilots to create review issues on a cadence. | Does not silently perform high-risk work. |

## Active Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Workbench scope creep into Multica core runtime | Version 1 becomes risky and hard to validate. | Keep repository as operating memory only. |
| Secret or token leakage into durable docs | Security breach and contaminated history. | Never store secrets, OAuth material, or private tokens here. |
| Automation silently performing unsafe changes | Loss of human control over high-risk work. | Autopilots create issues for approval-driven execution. |
| Outer Ring agents coordinating each other | Confused ownership and unreviewed delegation chains. | Outer Ring agents only execute assigned bounded tasks. |
| Done claims without evidence | False completion and broken trust. | Every completion must include verification evidence. |

## Next Immediate Action

Post a formal `Workbench Supervisor` verdict on `DAS-1`, then create a bounded implementation issue for `Codex Developer` to verify or harden the existing read-only `scripts/list-workbench-state.sh` helper. The next implementation issue must use sequential assignment only: `Codex Developer` owns the change, `Workbench Supervisor` reviews, and `QA Verifier` verifies evidence.
