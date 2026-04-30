# Workbench Implementation

Use this skill for coding, ops changes, scripts, automation specs, and local repository edits.

## Implementation Loop

1. Inspect current state.
2. Identify the true owner of the behavior.
3. Patch the smallest viable surface.
4. Verify on the real path.
5. Record the outcome in the right durable file when the change affects workbench operations.

## Engineering Rules

- Follow existing repo patterns.
- Preserve working routes, agents, runtimes, hooks, cron jobs, LaunchAgents, and channel bindings.
- Prefer reversible operations.
- Never store secrets, tokens, OAuth material, or private credentials.
- Do not broaden scope into Multica daemon, Desktop UI, or core runtime unless the issue explicitly requires it.
- If the worktree has unrelated changes, leave them alone.
- Back up live Multica skills, bindings, or automations before mutating them.
- Mutate one live resource class at a time, then verify before moving to the next class.
- Prefer source-first changes: local skill files and docs before live workspace synchronization.

## Completion Report

Return:

- files or live resources changed,
- commands or checks run,
- evidence of success,
- residual risk,
- next immediate action.
