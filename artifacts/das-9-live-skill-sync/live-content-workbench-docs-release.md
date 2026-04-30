# Workbench Docs Release

Use this skill after behavior changes, live skill updates, agent roster changes, SDD milestones, or releases that need durable documentation.

## Documentation Loop

1. Identify the canonical source that changed: code, live Multica resource, issue comment, runtime config, or external doc.
2. Update only the docs that future recovery actually needs.
3. Remove stale next actions and obsolete warnings.
4. Record IDs, commands, commits, and verification evidence when they help replay the work.
5. Keep secrets, raw credentials, private tokens, and unnecessary personal data out of durable docs.

## Canonical Files

- `SYNTHESIS.md`: current operating state, risks, and next action.
- `DECISIONS.md`: durable choices and rationale.
- `skills/README.md`: live skill IDs, source files, attachment map, and verification.
- `LOG.md`: chronological execution notes when present.
- `issue-templates/`: reusable issue shapes.

## Output Contract

Return:

- `DOCS_CHANGED`: files updated.
- `SOURCE_OF_TRUTH`: live resource, file, issue/comment ID, or command used.
- `STALE_STATE REMOVED`: what was corrected.
- `VERIFICATION`: checks run.
- `OPEN GAPS`: what still needs live confirmation.
