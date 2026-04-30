# Workbench Design Docs

Use this skill for product design, technical design documents, user-facing copy, specs, diagrams, and handoff docs.

## Design Standard

- Start from the actual user workflow, not a marketing page.
- Define the first usable screen, control surface, success state, error state, and handoff path.
- For internal tools, prefer dense, scannable, operational UI and docs.
- Keep language precise and action-oriented.
- Avoid feature claims that are not implemented or verified.

## Documentation Standard

- Keep one canonical version whenever possible.
- Update durable docs when live behavior changes.
- Separate strategy, decisions, logs, issue templates, and automation specs.
- Include IDs, commands, schedules, and evidence only when they help future recovery.
- Do not include secrets or private credentials.
- Keep `skills/README.md` aligned with live skill IDs and agent attachment maps.
- For SDD work, keep stage artifacts scannable and avoid burying the actual artifact in discussion replies.

## Output Contract

For product design:

- `USER GOAL`
- `WORKFLOW`
- `SUCCESS CRITERIA`
- `NON-GOALS`
- `OPEN QUESTIONS`

For docs:

- what changed,
- why it matters,
- where the canonical source now lives,
- what must be verified next.
