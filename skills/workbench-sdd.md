# Workbench SDD

Use this skill when a task needs to move from a fuzzy request into executable work.

This is the default workbench planning protocol unless the issue explicitly says the task is a quick fix, emergency repair, or direct verification run.

## Pipeline

Move work through these stages:

1. Raw Requirement
   - Capture the user's literal request.
   - Separate confirmed facts from assumptions.
   - Name the owner, expected output, and known constraints.
2. Product Design
   - Define the user-facing behavior, success criteria, non-goals, and edge cases.
   - Keep the scope narrow unless the user asks for expansion.
3. Technical Design
   - Identify the runtime owner, data path, files, commands, integrations, and risk surface.
   - Prefer existing stable routes over new infrastructure.
4. Task List
   - Convert the design into bounded tasks with owner, evidence, and verification criteria.
   - Keep tasks executable by one agent unless the issue explicitly asks for parallel work.
5. Execution And Verification
   - Execute only the assigned slice.
   - Verify on the real path.
   - Report evidence before claiming done.

## Stage Gate Rules

- Do not jump from an ambiguous raw request directly to implementation.
- Do not expand blast radius just because more agents or tokens are available.
- If a stage is already answered by issue text or prior comments, cite that evidence and move forward.
- If the task is blocked by a missing decision, state the smallest decision needed.
- If the task is low-risk and obvious, compress the stages into a short SDD card instead of creating ceremony.
- If the user says "go", "continue", or an equivalent approval after a reviewed stage, record that as the gate approval context before proceeding.
- When a stage has both proxy and agent-authored artifacts, use the complete agent-authored artifact as primary and keep the proxy comment as trace evidence.

## Comment Structure

Each SDD stage is a structured issue comment, not an issue status. Use this header for every stage artifact:

```text
SDD_STAGE: [Raw Requirement / Product Design / Technical Design / Task List / Execution And Verification]
OWNER: [one agent or human owner]
STATUS: READY_FOR_REVIEW / APPROVED / BLOCKED
REVIEWER: Workbench Supervisor or designated reviewer
EVIDENCE: [files, commands, issue/comment IDs, or artifacts checked]
HANDOFF_SUMMARY: [five lines or fewer: what the next agent needs without rereading full history]
SCOPED_EVIDENCE: [exact comment IDs, run IDs, commit hashes, files, or artifact paths to inspect]
ANTI_OVER_READ: [sources to skip unless needed, such as full issue lists or full comment history]
```

Put the stage-specific artifact after the header. Keep discussion replies separate from stage artifacts so the comment history remains scannable.

Every SDD stage comment must include `HANDOFF_SUMMARY`. Every SDD review comment must include `VERDICT_SUMMARY`. The next agent should be able to start from the handoff summary alone and deep-read only the listed `SCOPED_EVIDENCE`.

## Stage Gate Mechanics

- Supervisor review happens between stages with `VERDICT: PASS / FLAG / BLOCK`.
- `PASS` allows the next stage to start.
- `FLAG` means the current stage needs a targeted correction before handoff.
- `BLOCK` means the stage cannot proceed until the smallest blocking decision or missing input is resolved.
- Issue statuses stay coarse: `todo` before work starts, `in_progress` while any SDD stage is active, `in_review` after execution is ready for final review, and `done` only after accepted evidence.

## Bypass Rules

- Workbench Admin may use `SDD_BYPASS: quick-fix` for low-risk, obvious changes where a full SDD sequence would add noise.
- Workbench Admin may use `SDD_BYPASS: emergency` for time-critical repair work.
- Bypass is not allowed for high-risk, ambiguous, multi-system, or public/private boundary changes.
- A bypassed issue still needs one clear owner, explicit scope, verification evidence, and Supervisor review before closure.

## Execution Handoff

- The Task List stage names the execution owner, exact files/resources, non-goals, approval gates, and verification commands.
- Execution owners implement only their assigned slice and do not create follow-on work unless explicitly requested.
- T8 or smoke-test work remains separate when the task list says it depends on a committed repo batch.
- Completion reports include changed files, verification output, residual risks, commit hash or artifact link, work directory, and branch.
- Live skill or agent-binding changes must have a backup and post-change verification before final PASS.
- If a run reaches evidence-ready state but does not post a stage artifact, the conductor may post a proxy artifact using run-message evidence and mark it as proxy/recovery evidence.

## Output Contract

For planning or routing, return:

- `SDD_STAGE`: current stage.
- `CONFIRMED`: facts and constraints.
- `ASSUMPTIONS`: assumptions that still matter.
- `NEXT_TASKS`: owner-scoped tasks.
- `VERIFICATION`: evidence required to close.

For execution, return:

- what changed,
- what was verified,
- what remains risky or blocked.
