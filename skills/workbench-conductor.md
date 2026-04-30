# Workbench Conductor

Use this skill when coordinating the Hybrid Multica Two-Ring Workbench.

The workbench has an Inner Ring for command, review, and synthesis, and an Outer Ring for bounded specialist execution. Multica issues and comments are the live coordination record. This repository is the durable operating-memory record.

## Role Boundaries

- Admin converts fuzzy direction into executable issue shape.
- Supervisor verifies evidence, risk, and completion claims.
- Synthesizer keeps strategy, decisions, logs, and next actions coherent.
- Outer Ring agents execute assigned bounded tasks or provide narrow review.
- Outer Ring agents do not assign work to each other unless explicitly instructed.

## Routing Protocol

1. Restate the request as a bounded issue objective.
2. Choose one primary owner.
3. Mention secondary agents only for narrow advice, review, or verification.
4. Require evidence for every completion claim.
5. Move status only when the issue has the right evidence for that status.
6. Attach only the role-relevant skills needed for the task; broad skill fanout creates prompt noise.
7. If duplicate artifacts exist, prefer the agent-authored complete artifact and cite any proxy artifact only as recovery evidence.

## Comment Discipline

Use compact structured comments:

- `OBJECTIVE`
- `OWNER`
- `SCOPE`
- `SDD_STAGE`
- `EVIDENCE NEEDED`
- `HANDOFF_SUMMARY`
- `SCOPED_EVIDENCE`
- `NEXT ACTION`
- `RISK`

For SDD-tracked issues, `SDD_STAGE` marks comment-level milestones from `workbench-sdd`. SDD stages are not issue statuses; keep status changes coarse and use structured comments for Raw Requirement, Product Design, Technical Design, Task List, and Execution And Verification gates.

Conductor notes must list exact evidence IDs, not vague directions like "read the issue". Agents should use handoff summaries when available and avoid re-reading full issue history. The phrase "read the issue" in a conductor note is a process smell unless paired with exact comment or run IDs.

If an agent run reaches evidence-ready state but does not publish a stage artifact, post a compact proxy artifact from `issue run-messages` evidence, label it as proxy/recovery evidence, and let Supervisor choose the primary artifact when the agent-authored version appears.

Do not post long generic strategy essays inside execution issues. Put durable strategy updates in the local workbench repo.

## Safety Rules

- Do not modify Multica daemon, Desktop UI, or core runtime unless explicitly requested.
- Do not store secrets, OAuth material, tokens, or private credentials in comments or repo files.
- Prefer issue creation over silent automation for scheduled work.
- Preserve existing agents, runtimes, and stable routes.
- Preserve `Workbench Max` unless an issue explicitly assigns changes to it.
