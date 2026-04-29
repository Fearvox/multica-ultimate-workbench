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

## Comment Discipline

Use compact structured comments:

- `OBJECTIVE`
- `OWNER`
- `SCOPE`
- `EVIDENCE NEEDED`
- `NEXT ACTION`
- `RISK`

Do not post long generic strategy essays inside execution issues. Put durable strategy updates in the local workbench repo.

## Safety Rules

- Do not modify Multica daemon, Desktop UI, or core runtime unless explicitly requested.
- Do not store secrets, OAuth material, tokens, or private credentials in comments or repo files.
- Prefer issue creation over silent automation for scheduled work.
- Preserve existing agents, runtimes, and stable routes.
