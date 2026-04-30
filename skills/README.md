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
| `workbench-capy-vm-lane` | Controlled VM/Computer execution for GUI, browser, sandbox, screenshots, lease discipline, and teardown evidence. |
| `workbench-docs-release` | Post-change documentation sync for decisions, synthesis, skill maps, and release handoffs. |
| `workbench-token-context-discipline` | Compact context, cache-aware execution, and role-specific skill attachment discipline. |
| `workbench-product-brainstorming` | Bounded product ideation with options, tradeoffs, recommendation, and smallest test. |
| `workbench-gsd-tasking` | Owner-scoped task decomposition with gates, rollback, verification, and smoke tests. |

## Attachment Map

Target map after DAS-9 expansion:

| Agent | Skills |
| --- | --- |
| Workbench Admin | `workbench-conductor`, `workbench-sdd`, `workbench-product-brainstorming`, `workbench-token-context-discipline`, `workbench-gsd-tasking` |
| Workbench Supervisor | `workbench-review-qa`, `workbench-code-review`, `workbench-conductor`, `workbench-sdd`, `workbench-token-context-discipline`, `workbench-capy-vm-lane` |
| Workbench Synthesizer | `workbench-memory-synthesis`, `workbench-docs-release`, `workbench-conductor`, `workbench-token-context-discipline` |
| Codex Guardian | `workbench-implementation`, `workbench-debug-investigate`, `workbench-code-review`, `workbench-token-context-discipline` |
| Codex Developer | `workbench-implementation`, `workbench-debug-investigate`, `workbench-code-review`, `workbench-gsd-tasking` |
| Hermes Researcher | `workbench-research`, `workbench-product-brainstorming`, `workbench-token-context-discipline` |
| Claude Architect | `workbench-sdd`, `workbench-research`, `workbench-design-docs`, `workbench-frontend-design-qa`, `workbench-gsd-tasking` |
| Claude Docs | `workbench-design-docs`, `workbench-docs-release`, `workbench-memory-synthesis`, `workbench-token-context-discipline` |
| QA Verifier | `workbench-review-qa`, `workbench-browser-proofshot-qa`, `workbench-frontend-design-qa`, `workbench-code-review`, `workbench-capy-vm-lane` |
| Workbench VM Runner | `workbench-capy-vm-lane`, `workbench-browser-proofshot-qa`, `workbench-token-context-discipline`, `workbench-review-qa` |
| Benchmark Scout | `workbench-research`, `workbench-review-qa`, `workbench-token-context-discipline` |
| Ops Mechanic | `workbench-implementation`, `workbench-debug-investigate`, `workbench-review-qa`, `workbench-token-context-discipline` |
| Memory Curator | `workbench-memory-synthesis`, `workbench-docs-release`, `workbench-token-context-discipline` |

`Workbench Max` is intentionally preserved and not modified by the DAS-9 expansion.

`Workbench Max` is a preserved Special bench rather than a normal Inner or Outer Ring routing target. It should keep zero broad workbench skill assignments unless the human explicitly assigns a change.

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
| `workbench-debug-investigate` | `d5b663e5-2eaf-4a43-979c-5ee19b209a49` |
| `workbench-code-review` | `b7b035cb-67d6-4fbd-a756-c410190576a9` |
| `workbench-frontend-design-qa` | `961497cb-a1f3-48df-961d-f9983ee918aa` |
| `workbench-browser-proofshot-qa` | `2acab3df-7b28-4ca4-a34b-4c713a453ada` |
| `workbench-capy-vm-lane` | `23205bad-177e-4937-8934-d0ea5b8b1a4e` |
| `workbench-docs-release` | `f2bac02b-5daf-400e-93df-49e97f64c59c` |
| `workbench-token-context-discipline` | `6fe7672c-5821-40bf-abd0-ac52b953eb56` |
| `workbench-product-brainstorming` | `a9ec34a7-8c0d-4858-a013-899bff60d664` |
| `workbench-gsd-tasking` | `dd07acb0-a647-48d5-b88a-e6730553f9fa` |

## Verification

Verified after creation:

- `multica skill list --output json` returned all 7 skills with non-empty content.
- `multica agent skills list <agent-id> --output json` returned the expected binding map for all 12 target agents.
- `Workbench Max` remained unmodified with no skill assignments.
- `DAS-5` fresh Workbench Admin task saw `workbench-conductor` and `workbench-sdd`, checked out commit `2812d01`, and posted PASS comment `ee351c22-5394-49a8-919f-abdaf162c632`.

DAS-9 source expansion verification:

- All 15 local skill files exist and stay compact enough for role-specific attachment.
- All 15 local skill files include Codex-compatible YAML frontmatter (`name` and `description`) as of DAS-31.
- Existing 7 live skills were updated from local source on 2026-04-30 UTC.
- New 8 live skills were created on 2026-04-30 UTC and their IDs are recorded above.
- `multica skill list --output json` returned 15 skills after sync.
- `multica skill get <id> --output json` returned non-empty content for all 15 skills after sync.
- The attachment map above was applied to the 12 target workbench agents and independently verified against `agent skills list`.
- `Workbench Max` remains unmodified with zero skill assignments.
- `DAS-10` fresh Workbench Admin smoke run `5dfe420e-0f0b-4d7d-84e5-d56e6e44ad30` posted PASS comment `7e3f1946-d016-460b-b2d6-743c95c45393`, seeing the expected 5 Admin skills and confirming no mutation.

Capy VM Lane live sync verification:

- `workbench-capy-vm-lane` was created on 2026-04-30 UTC as live skill `23205bad-177e-4937-8934-d0ea5b8b1a4e`.
- `Workbench VM Runner` was created on the Codex runtime as private agent `e42ff104-7ff2-41d8-936d-fe18448c2e1c` with max concurrency 1.
- `multica agent skills list e42ff104-7ff2-41d8-936d-fe18448c2e1c --output json` returned the expected 4-skill VM Runner binding: `workbench-capy-vm-lane`, `workbench-browser-proofshot-qa`, `workbench-token-context-discipline`, and `workbench-review-qa`.
- Live evidence is stored under `artifacts/capy-vm-live-sync/20260430T1031Z`.

## Curator Maintenance

Skill maintenance follows [../docs/skill-curator.md](../docs/skill-curator.md).

Default rule: review first, mutate later. The curator can classify skills and bindings as `active`, `stale`, `archived`, or `pinned`, but v1 must not delete files, rewrite live skills, or detach live bindings without explicit human approval and Supervisor review.

Stale classification should use objective indicators from [../docs/skill-curator.md](../docs/skill-curator.md), not vibes. Two indicators produce a `FLAG`; three or more can justify a stale proposal, still without automatic deletion or detachment.
