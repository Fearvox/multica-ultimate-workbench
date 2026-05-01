# NYC Remote Agents Evidence

Generated for the 2026-05-01 remote execution-cell setup.

## Contents

- `runtimes-before.json`: live runtime inventory before creating remote agents.
- `skills-before.json`: live skill inventory before remote binding.
- `agents-before.json`: live agent inventory before creating remote agents.
- `agents-after.json`: final sanitized remote agent inventory after clearing unsupported Codex custom args.
- `das-94-codex-smoke.json` and `das-94-comments.json`: NYC Codex Builder smoke issue and comments.
- `das-95-hermes-smoke.json` and `das-95-comments.json`: NYC Hermes Researcher smoke issue and comments.
- `project-resources-after.json`: `Ultimate Workbench` project GitHub repo resource state.
- `workspace-after.json`: workspace repo state showing the remaining laptop-local repo metadata.
- `live-review-qa-skill-update.json`: live `workbench-review-qa` sync evidence.
- `live-auto-review-sweeper-update.json`: live Auto Review Sweeper sync evidence.

## Outcome

- NYC Hermes smoke: `PASS`, moved to `done`.
- NYC Codex smoke: `FLAG`, left in `in_review`.
- Remote Codex custom args: cleared.
- Token, OAuth, custom env, screenshot, and raw credential material: not stored.

## Residual Risk

Workspace repo metadata still includes the laptop-local `file:///Users/0xvox/multica-ultimate-workbench` path. Remote NYC agents must use the `Ultimate Workbench` GitHub repo resource first and treat that laptop path as invalid on `hermes-nyc1-multica`.
