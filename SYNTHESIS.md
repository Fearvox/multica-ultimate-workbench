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

No workbench agents were created during verification. The existing private `Workbench Max` agent on the Codex runtime must be preserved.

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

Create the initial workbench skeleton, verify the expected files, and commit the bootstrap state. After that, subsequent tasks can add scripts, templates, agent definitions, and autopilot definitions under explicit human-approved scope.
