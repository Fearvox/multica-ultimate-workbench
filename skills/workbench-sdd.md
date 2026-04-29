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
