# Workspace Skills

This directory is the local, reviewable source for high-frequency Multica workspace skills.

The live Multica workspace stores skills in the workspace cloud layer. These files are the durable source of truth for what was installed and why.

## Core Pack

| Skill | Purpose |
| --- | --- |
| `workbench-sdd` | Specification-driven development: raw requirement -> product design -> technical design -> task list -> execution/verification. |
| `workbench-conductor` | Two-ring orchestration, routing, issue/comment discipline, and role boundaries. |
| `workbench-research` | Evidence-first research, architecture discovery, and source discipline. |
| `workbench-review-qa` | PASS/FLAG/BLOCK review and verification protocol. |
| `workbench-implementation` | Minimal-patch implementation and ops discipline. |
| `workbench-design-docs` | Product/design/doc handoff quality. |
| `workbench-memory-synthesis` | Durable memory, decision logging, and session synthesis. |
| `workbench-debug-investigate` | Root-cause investigation for bugs, regressions, quota anomalies, and runtime failures. |
| `workbench-code-review` | Findings-first review discipline for diffs, live changes, and evidence quality. |
| `workbench-frontend-design-qa` | Visual/UI QA for responsive surfaces, text fit, hierarchy, and interaction states. |
| `workbench-browser-proofshot-qa` | Browser-based verification with screenshots, traces, console/network checks, and repro steps. |
| `workbench-docs-release` | Post-change documentation sync for decisions, synthesis, skill maps, and release handoffs. |
| `workbench-token-context-discipline` | Compact context, cache-aware execution, and role-specific skill attachment discipline. |
| `workbench-product-brainstorming` | Bounded product ideation with options, tradeoffs, recommendation, and smallest test. |
| `workbench-gsd-tasking` | Owner-scoped task decomposition with gates, rollback, verification, and smoke tests. |

## Attachment Map

Target map after DAS-9 expansion:

| Agent | Skills |
| --- | --- |
| Workbench Admin | `workbench-conductor`, `workbench-sdd`, `workbench-product-brainstorming`, `workbench-token-context-discipline`, `workbench-gsd-tasking` |
| Workbench Supervisor | `workbench-review-qa`, `workbench-code-review`, `workbench-conductor`, `workbench-sdd`, `workbench-token-context-discipline` |
| Workbench Synthesizer | `workbench-memory-synthesis`, `workbench-docs-release`, `workbench-conductor`, `workbench-token-context-discipline` |
| Codex Guardian | `workbench-implementation`, `workbench-debug-investigate`, `workbench-code-review`, `workbench-token-context-discipline` |
| Codex Developer | `workbench-implementation`, `workbench-debug-investigate`, `workbench-code-review`, `workbench-gsd-tasking` |
| Hermes Researcher | `workbench-research`, `workbench-product-brainstorming`, `workbench-token-context-discipline` |
| Claude Architect | `workbench-sdd`, `workbench-research`, `workbench-design-docs`, `workbench-frontend-design-qa`, `workbench-gsd-tasking` |
| Claude Docs | `workbench-design-docs`, `workbench-docs-release`, `workbench-memory-synthesis`, `workbench-token-context-discipline` |
| QA Verifier | `workbench-review-qa`, `workbench-browser-proofshot-qa`, `workbench-frontend-design-qa`, `workbench-code-review` |
| Benchmark Scout | `workbench-research`, `workbench-review-qa`, `workbench-token-context-discipline` |
| Ops Mechanic | `workbench-implementation`, `workbench-debug-investigate`, `workbench-review-qa`, `workbench-token-context-discipline` |
| Memory Curator | `workbench-memory-synthesis`, `workbench-docs-release`, `workbench-token-context-discipline` |

`Workbench Max` is intentionally preserved and not modified by the DAS-9 expansion.

## Live IDs

Created in the Multica `DASH` workspace on 2026-04-29:

| Skill | ID |
| --- | --- |
| `workbench-sdd` | `2cf724da-976a-40e6-be9b-ecbdc2af9041` |
| `workbench-conductor` | `811318a4-f396-4c87-8a89-80b5d871c6f5` |
| `workbench-research` | `ee3222fc-2722-4502-9e7f-883901ad01fc` |
| `workbench-review-qa` | `e8c8d908-1a13-4d5c-8b5f-dc48a908a149` |
| `workbench-implementation` | `b4bf2dce-9acc-4082-ab6b-7fcb1383950a` |
| `workbench-design-docs` | `66f04cd9-f62d-42b9-be2b-24ded62484bc` |
| `workbench-memory-synthesis` | `8d80f2f9-46cf-4d1e-a0bb-63c7064907eb` |
| `workbench-debug-investigate` | `TBD after DAS-9 live sync` |
| `workbench-code-review` | `TBD after DAS-9 live sync` |
| `workbench-frontend-design-qa` | `TBD after DAS-9 live sync` |
| `workbench-browser-proofshot-qa` | `TBD after DAS-9 live sync` |
| `workbench-docs-release` | `TBD after DAS-9 live sync` |
| `workbench-token-context-discipline` | `TBD after DAS-9 live sync` |
| `workbench-product-brainstorming` | `TBD after DAS-9 live sync` |
| `workbench-gsd-tasking` | `TBD after DAS-9 live sync` |

## Verification

Verified after creation:

- `multica skill list --output json` returned all 7 skills with non-empty content.
- `multica agent skills list <agent-id> --output json` returned the expected binding map for all 12 target agents.
- `Workbench Max` remained unmodified with no skill assignments.
- `DAS-5` fresh Workbench Admin task saw `workbench-conductor` and `workbench-sdd`, checked out commit `2812d01`, and posted PASS comment `ee351c22-5394-49a8-919f-abdaf162c632`.

DAS-9 source expansion verification target:

- All 15 local skill files exist and stay compact enough for role-specific attachment.
- Existing 7 live skills are updated from local source.
- New 8 live skills are created and their IDs replace the `TBD` rows above.
- The attachment map above is applied to the 12 target workbench agents.
- `Workbench Max` remains unmodified with zero skill assignments.
- A final smoke issue verifies that at least one fresh workbench task sees the expanded skill grammar.
