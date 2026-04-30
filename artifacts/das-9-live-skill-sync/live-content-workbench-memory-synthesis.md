# Workbench Memory Synthesis

Use this skill for durable memory, session summaries, decision logs, issue closeout synthesis, and handoffs.

## Memory Rules

- Prefer short canonical updates over duplicate drafts.
- Keep the next session resumable from files, not hidden model memory.
- Record decisions separately from logs.
- Keep strategy in synthesis documents and execution evidence in logs or issue comments.
- Preserve IDs that matter for recovery: issue IDs, run IDs, comment IDs, agent IDs, autopilot IDs, commit IDs.
- When a run stalls and a conductor proxy posts evidence, record both the proxy ID and the later agent-authored artifact ID if it appears.
- Record live resource IDs only after post-sync verification confirms them.

## Synthesis Method

1. Collect the latest verified state.
2. Remove stale next actions that are already complete.
3. Add only durable facts and decisions.
4. Keep uncertainty explicit.
5. Name the next immediate action.

## Output Contract

Return:

- `CURRENT STATE`
- `DECISIONS`
- `EVIDENCE`
- `RISKS`
- `NEXT ACTION`

Do not rewrite history. Append or revise only the minimum needed to keep the operating memory accurate.
