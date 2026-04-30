# Curator Review Issue Template

## Curator Target

- Scope:
- Trigger:
- Recent relevant change:

## Safety

- Read-only first.
- No deletion.
- No live skill sync unless explicitly approved.
- No attachment changes unless explicitly approved.
- Preserve pinned/canonical skills.

## Required Reads

- `docs/skill-curator.md`
- `skills/README.md`
- relevant `skills/*.md`
- relevant `agents/**/*.md`
- `SYNTHESIS.md`
- `DECISIONS.md`

## Optional Live Verification

Run only when the issue asks for live evidence:

```bash
multica skill list --output json
multica agent skills list <agent-id> --output json
```

## Output Format

1. `CATALOG_STATE`
2. `OVERLAPS`
3. `DRIFT`
4. `TOKEN_RISK`
5. `PATCH_PLAN`
6. `LIVE_SYNC_NEEDED`
7. `RESIDUAL_RISK`
8. `PASS` / `FLAG` / `BLOCK`
