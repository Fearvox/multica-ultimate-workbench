# Synthesis

Date: 2026-04-29
Last updated: 2026-04-30 UTC during DAS-9 skill expansion.

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

## SDD Operating Flow

Non-trivial workbench issues move through the SDD pipeline as structured comments, not status transitions:

1. Raw Requirement - Workbench Admin captures the literal request, confirmed facts, assumptions, output, and constraints.
2. Product Design - Claude Architect defines user-facing behavior, success criteria, non-goals, and edge cases.
3. Technical Design - Claude Architect maps runtime owner, data path, files/resources, integrations, risk surface, and verification approach.
4. Task List - Workbench Admin turns the design into bounded owner-scoped tasks with approval gates and verification commands.
5. Execution And Verification - The assigned implementation owner completes the scoped work, reports evidence, and Supervisor reviews before closure.

Each stage uses an `SDD_STAGE` comment header and a Supervisor PASS/FLAG/BLOCK gate. Issue statuses remain coarse (`todo`, `in_progress`, `in_review`, `done`, `blocked`) so existing routing and autopilots stay stable.

Use `issue-templates/sdd-workflow.md` for non-trivial SDD-gated work. Workbench Admin may use a documented quick-fix or emergency bypass only for low-risk or time-critical tasks, and the execution evidence still needs review.

## Active Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Workbench scope creep into Multica core runtime | Version 1 becomes risky and hard to validate. | Keep repository as operating memory only. |
| Secret or token leakage into durable docs | Security breach and contaminated history. | Never store secrets, OAuth material, or private tokens here. |
| Automation silently performing unsafe changes | Loss of human control over high-risk work. | Autopilots create issues for approval-driven execution. |
| Outer Ring agents coordinating each other | Confused ownership and unreviewed delegation chains. | Outer Ring agents only execute assigned bounded tasks. |
| Done claims without evidence | False completion and broken trust. | Every completion must include verification evidence. |
| Autopilot-created issues lack the local workbench repo | Agents cannot verify this repository's docs/specs from their assigned workdir. | Mitigated on 2026-04-29 by linking `file:///Users/0xvox/multica-ultimate-workbench` into workspace `DASH`; keep the repo link visible in `workspace get`. |
| Agent roster and human member counts get conflated | Health cards can under-report the actual agent roster. | Health autopilot must run `agent list` and `workspace members` separately and report counts/names separately. |
| Workspace skills drift from local source | Agents may run stale or invisible operating protocols. | Keep canonical skill source in `skills/`, record live IDs, and verify `skill list` plus agent bindings after changes. |
| Prompt bloat from over-attached skills | Agents waste context and quota on irrelevant operating protocols. | Attach skills by role, keep high-frequency skills compact, and use `workbench-token-context-discipline` for large histories/docs. |

## Workspace Skill Pack

Created in Multica workspace `DASH` on 2026-04-29 and attached to the 12 target workbench agents. `Workbench Max` was intentionally preserved and not modified. `DAS-5` verified that a fresh Workbench Admin task can see `workbench-conductor` and `workbench-sdd` and can check out the local skill source at commit `2812d01`.

DAS-9 expanded the pack from 7 core skills to 15 high-frequency skills. The expansion kept the same principle: local source first, live sync after backup, role-specific bindings, and `Workbench Max` untouched. `DAS-10` fresh Workbench Admin smoke run `5dfe420e-0f0b-4d7d-84e5-d56e6e44ad30` posted PASS comment `7e3f1946-d016-460b-b2d6-743c95c45393`.

| Skill | Live ID | Purpose |
| --- | --- | --- |
| `workbench-sdd` | `2cf724da-976a-40e6-be9b-ecbdc2af9041` | Raw requirement -> product design -> technical design -> task list -> execution/verification. |
| `workbench-conductor` | `811318a4-f396-4c87-8a89-80b5d871c6f5` | Two-ring routing, role boundaries, and issue/comment discipline. |
| `workbench-research` | `ee3222fc-2722-4502-9e7f-883901ad01fc` | Evidence-first research and source discipline. |
| `workbench-review-qa` | `e8c8d908-1a13-4d5c-8b5f-dc48a908a149` | PASS/FLAG/BLOCK review and QA verification. |
| `workbench-implementation` | `b4bf2dce-9acc-4082-ab6b-7fcb1383950a` | Minimal-patch implementation and ops discipline. |
| `workbench-design-docs` | `66f04cd9-f62d-42b9-be2b-24ded62484bc` | Product design, technical design, copy, and docs. |
| `workbench-memory-synthesis` | `8d80f2f9-46cf-4d1e-a0bb-63c7064907eb` | Durable memory, decision logging, and handoffs. |
| `workbench-debug-investigate` | `d5b663e5-2eaf-4a43-979c-5ee19b209a49` | Root-cause investigation for bugs, regressions, quota anomalies, and runtime failures. |
| `workbench-code-review` | `b7b035cb-67d6-4fbd-a756-c410190576a9` | Findings-first review discipline for diffs, live changes, and evidence quality. |
| `workbench-frontend-design-qa` | `961497cb-a1f3-48df-961d-f9983ee918aa` | Visual/UI QA for responsive surfaces, text fit, hierarchy, and interaction states. |
| `workbench-browser-proofshot-qa` | `2acab3df-7b28-4ca4-a34b-4c713a453ada` | Browser verification with screenshots, traces, console/network checks, and repro steps. |
| `workbench-docs-release` | `f2bac02b-5daf-400e-93df-49e97f64c59c` | Documentation sync after behavior, roster, skill, or release changes. |
| `workbench-token-context-discipline` | `6fe7672c-5821-40bf-abd0-ac52b953eb56` | Compact context, cache-aware execution, and role-specific skill attachment discipline. |
| `workbench-product-brainstorming` | `a9ec34a7-8c0d-4858-a013-899bff60d664` | Bounded product ideation with options, tradeoffs, recommendation, and smallest test. |
| `workbench-gsd-tasking` | `dd07acb0-a647-48d5-b88a-e6730553f9fa` | Owner-scoped tasks with gates, rollback, verification, and smoke tests. |

## Next Immediate Action

DAS-13 live retest passed: a fresh Workbench Admin run used live `workbench-sdd`, avoided parent/deep reads, emitted literal `HANDOFF_SUMMARY`, `SCOPED_EVIDENCE`, and `ANTI_OVER_READ` headers, and Supervisor accepted the result. Next: use compact SDD handoffs in the next real multi-stage issue and watch whether Product Design / Technical Design stages also avoid broad history reads.
