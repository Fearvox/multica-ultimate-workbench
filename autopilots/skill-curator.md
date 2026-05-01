# Skill Curator Autopilot

Mode: create issue
Cadence: weekly or manually triggered after skill/prompt changes
Preferred assignee: Memory Curator

Purpose: Review local and live workbench skills for drift, duplication, stale attachments, token bloat, and recoverable archive candidates.

Safety: Read-only by default. No deletion, live skill sync, live attachment changes, or archive moves without explicit human approval and Supervisor review.

Required evidence:

- Local skill catalog: inspect `skills/README.md`.
- Local skill source: inspect `skills/*.md` by targeted reads, not broad dumps.
- Agent prompt relationship: inspect only relevant `agents/**/*.md` files.
- Strategy context: inspect `SYNTHESIS.md` and `DECISIONS.md`.
- Live state: use `multica skill list --output json` and `multica agent skills list <agent-id> --output json` only when the issue asks for live verification.
- Curator protocol: follow `docs/skill-curator.md`.

Output format:

1. `CATALOG_STATE`
2. `OVERLAPS`
3. `DRIFT`
4. `TOKEN_RISK`
5. `PATCH_PLAN`
6. `LIVE_SYNC_NEEDED`
7. `RESIDUAL_RISK`
8. Verdict: `PASS`, `FLAG`, or `BLOCK`

Default interpretation:

- `PASS`: catalog is coherent or has a safe patch plan.
- `FLAG`: stale/overlap/drift exists but can wait for a bounded issue.
- `BLOCK`: live/source mismatch or unsafe mutation risk makes current skill use unreliable.
