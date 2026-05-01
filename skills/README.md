# Workbench Skills

Public source for the skill grammar used by the Ultimate Workbench. Live skill
IDs and runtime bindings are private deployment details and are not tracked here.

## Core Pack

| Skill | Purpose |
| --- | --- |
| `workbench-sdd` | Raw requirement -> product design -> technical design -> task list -> execution/review. |
| `workbench-goal-mode` | Goal-persistence wrapper for `/goal` work that must continue until the objective is verified. |
| `workbench-conductor` | Two-ring routing, role boundaries, issue/comment discipline. |
| `workbench-research` | Evidence-first research and source discipline. |
| `workbench-review-qa` | PASS/FLAG/BLOCK review and QA verification. |
| `workbench-implementation` | Minimal-patch implementation with verification. |
| `workbench-design-docs` | Product design, technical design, copy, and docs. |
| `workbench-memory-synthesis` | Durable memory, decision logs, and handoffs. |
| `workbench-debug-investigate` | Root-cause investigation for bugs, quota anomalies, and runtime failures. |
| `workbench-code-review` | Findings-first review for diffs and evidence quality. |
| `workbench-frontend-design-qa` | UI QA for hierarchy, fit, responsive behavior, and interaction states. |
| `workbench-browser-proofshot-qa` | Browser verification with screenshots/traces kept outside public Git. |
| `workbench-capy-vm-lane` | Controlled VM/browser/sandbox execution and teardown evidence. |
| `workbench-docs-release` | Documentation sync after behavior, roster, skill, or release changes. |
| `workbench-token-context-discipline` | Compact context, cache-aware execution, and role-specific skill attachment. |
| `workbench-product-brainstorming` | Bounded product ideation with tradeoffs and smallest tests. |
| `workbench-gsd-tasking` | Owner-scoped tasks with gates, rollback, verification, and smoke tests. |

## Deployment Boundary

Source files in this directory are public-safe. Live deployment metadata belongs
in ignored local files, Multica itself, or private issue comments.

Before syncing a skill live:

1. Review the source file.
2. Confirm the target workspace and runtime out of band.
3. Sync only the scoped skill.
4. Verify from the live task context.
5. Record only sanitized outcomes in public docs.
