# Workbench Skills

Public source for the skill grammar used by the Ultimate Workbench. Live skill
IDs and runtime bindings are private deployment details and are not tracked here.

## Install

```bash
npx skills add Fearvox/multica-ultimate-workbench --list --full-depth
npx skills add Fearvox/multica-ultimate-workbench --skill workbench-self-awareness-infra workbench-sdd workbench-conductor
npx skills add Fearvox/multica-ultimate-workbench --all
```

The pack is directory-structured for the `skills` CLI: each skill lives at
`skills/<skill-name>/SKILL.md` with frontmatter `name` and `description`.

## Core Pack

| Skill | Purpose |
| --- | --- |
| [`workbench-self-awareness-infra`](workbench-self-awareness-infra/SKILL.md) | Capability discovery and current-state verification before SDD, Goal Mode, L2 Pressure, or execution. |
| [`workbench-sdd`](workbench-sdd/SKILL.md) | Raw requirement -> product design -> technical design -> task list -> execution/review. |
| [`workbench-goal-mode`](workbench-goal-mode/SKILL.md) | Goal-persistence wrapper for `/goal` work that must continue until the objective is verified. |
| [`workbench-l2-pressure-gate`](workbench-l2-pressure-gate/SKILL.md) | Research Vault pressure gate for remote Hermes, VM, HarnessMax, and autonomous evolution sweeps. |
| [`workbench-algorithm-advisory-gate`](workbench-algorithm-advisory-gate/SKILL.md) | Advisory-only algorithm and data-structure review gate between Technical Design and Task List. |
| [`workbench-conductor`](workbench-conductor/SKILL.md) | Two-ring routing, role boundaries, issue/comment discipline. |
| [`workbench-research`](workbench-research/SKILL.md) | Evidence-first research and source discipline. |
| [`workbench-review-qa`](workbench-review-qa/SKILL.md) | PASS/FLAG/BLOCK review and QA verification. |
| [`workbench-implementation`](workbench-implementation/SKILL.md) | Minimal-patch implementation with verification. |
| [`workbench-design-docs`](workbench-design-docs/SKILL.md) | Product design, technical design, copy, and docs. |
| [`workbench-memory-synthesis`](workbench-memory-synthesis/SKILL.md) | Durable memory, decision logs, and handoffs. |
| [`workbench-debug-investigate`](workbench-debug-investigate/SKILL.md) | Root-cause investigation for bugs, quota anomalies, and runtime failures. |
| [`workbench-code-review`](workbench-code-review/SKILL.md) | Findings-first review for diffs and evidence quality. |
| [`workbench-frontend-design-qa`](workbench-frontend-design-qa/SKILL.md) | UI QA for hierarchy, fit, responsive behavior, and interaction states. |
| [`workbench-browser-proofshot-qa`](workbench-browser-proofshot-qa/SKILL.md) | Browser verification with screenshots/traces kept outside public Git. |
| [`workbench-capy-vm-lane`](workbench-capy-vm-lane/SKILL.md) | Controlled VM/browser/sandbox execution and teardown evidence. |
| [`workbench-capy-process-check`](workbench-capy-process-check/SKILL.md) | Real-time Capy task and PR observation through Brave/Computer Use with primary evidence readback. |
| [`workbench-sanity-context`](workbench-sanity-context/SKILL.md) | Sanity schema and context-registry work for cross-CLI sanitized workbench memory. |
| [`workbench-agent-install-unifier`](workbench-agent-install-unifier/SKILL.md) | Skills, MCP, and AGENTS.md distribution across coding agents with readback and rollback. |
| [`workbench-flue-agent-harness`](workbench-flue-agent-harness/SKILL.md) | Deployable Flue agent harness lane for HTTP, CI, Node, Cloudflare, and sandbox-backed agents. |
| [`workbench-docs-release`](workbench-docs-release/SKILL.md) | Documentation sync after behavior, roster, skill, or release changes. |
| [`workbench-token-context-discipline`](workbench-token-context-discipline/SKILL.md) | Compact context, cache-aware execution, and role-specific skill attachment. |
| [`workbench-product-brainstorming`](workbench-product-brainstorming/SKILL.md) | Bounded product ideation with tradeoffs and smallest tests. |
| [`workbench-gsd-tasking`](workbench-gsd-tasking/SKILL.md) | Owner-scoped tasks with gates, rollback, verification, and smoke tests. |

## Deployment Boundary

Source files in this directory are public-safe. Live deployment metadata belongs
in ignored local files, Multica itself, or private issue comments.

Before syncing a skill live:

1. Review the source file.
2. Confirm the target workspace and runtime out of band.
3. Sync only the scoped skill.
4. Verify from the live task context.
5. Record only sanitized outcomes in public docs.
