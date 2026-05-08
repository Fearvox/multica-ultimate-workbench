---
name: workbench-closeout-validator
description: Strict parser and validator for Workbench closeout comments, verdict/status discipline, PR reference types, and cross-issue REMAINING sync.
---

# Workbench Closeout Validator

Use this skill when reviewing or automating status-changing closeout comments
for Workbench, Multica, Capy, Conductor, Hermes, Codex, Linear, Slack, or PR
surfaces.

The validator is anti-LGTM infrastructure: it preserves the literal verdict and
stops adapters from turning a `FLAG` closeout into `PASS` or `Done`.

## Required Input Shape

Status-changing closeout must contain these headings in this order:

```text
CHANGED:
VERIFIED:
REMAINING:
PRS / LINKS:
VERDICT: PASS | FLAG | BLOCK
```

`REMAINING:` is mandatory even when `(none)`.

## Local Validator

Use the strict parser, not free-form prose matching:

```bash
node scripts/workbench-closeout-validator.mjs \
  --comment-file <closeout.md> \
  --target-status "Done" \
  --references-json <references.json> \
  --affected-issues-json <affected-issues.json>

node scripts/test-workbench-closeout-validator.mjs
```

Reference records use this public-safe shape:

```json
[
  { "type": "contains", "id": "#24", "state": "merged" },
  { "type": "dogfood-platform", "id": "#25" },
  { "type": "discovered-via", "id": "#26" },
  { "type": "cross-issue-side-effect", "id": "SYN-40" }
]
```

Affected issue records use:

```json
[
  { "id": "SYN-39", "remaining_synced": true },
  { "id": "SYN-40", "remaining_synced": false }
]
```

## Validation Rules

- `Done` requires `VERDICT: PASS`; `FLAG` or `BLOCK` cannot move to Done.
- `Blocked` requires `VERDICT: BLOCK`.
- `Ready for Merge` may carry `PASS` or `FLAG`, but not `BLOCK`.
- `contains` references require merged or head-on-main proof.
- `dogfood-platform`, `discovered-via`, and `cross-issue-side-effect`
  references do not require merge proof by themselves.
- If one closeout affects multiple issues and `REMAINING:` is not `(none)`,
  relevant remaining lines must be synced to every affected issue description
  or comment.

## Failure Handling

Validator failures do not silently rewrite the issue status. They emit
`WORKBENCH_CLOSEOUT_VALIDATION` with:

- `validator_verdict: BLOCK` for malformed fields, verdict/status mismatch, or
  invalid `contains` references;
- `validator_verdict: FLAG` for missing cross-issue sync proof or missing
  reference-state proof;
- `follow_up_required: true` when audit trail work must be spawned.

Live adapters should create a `FLAG` follow-up issue and notify Supervisor
instead of hiding the failure.
