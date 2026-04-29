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

## Attachment Map

Initial target map:

| Agent | Skills |
| --- | --- |
| Workbench Admin | `workbench-conductor`, `workbench-sdd` |
| Workbench Supervisor | `workbench-review-qa`, `workbench-conductor`, `workbench-sdd` |
| Workbench Synthesizer | `workbench-memory-synthesis`, `workbench-conductor`, `workbench-sdd` |
| Codex Guardian | `workbench-review-qa`, `workbench-implementation` |
| Codex Developer | `workbench-implementation`, `workbench-sdd` |
| Hermes Researcher | `workbench-research`, `workbench-sdd` |
| Claude Architect | `workbench-sdd`, `workbench-research`, `workbench-design-docs` |
| Claude Docs | `workbench-design-docs`, `workbench-memory-synthesis` |
| QA Verifier | `workbench-review-qa`, `workbench-conductor` |
| Benchmark Scout | `workbench-research`, `workbench-review-qa` |
| Ops Mechanic | `workbench-implementation`, `workbench-review-qa` |
| Memory Curator | `workbench-memory-synthesis`, `workbench-review-qa` |

`Workbench Max` is intentionally preserved and not modified by the initial core-pack rollout.

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

## Verification

Verified after creation:

- `multica skill list --output json` returned all 7 skills with non-empty content.
- `multica agent skills list <agent-id> --output json` returned the expected binding map for all 12 target agents.
- `Workbench Max` remained unmodified with no skill assignments.
