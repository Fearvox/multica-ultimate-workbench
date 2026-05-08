# Closeout Audit Sweeper

Mode: scheduled or event-driven audit
Trigger source: Linear issue closeout comments, GitHub PR closeouts, and
Workbench supervisor comments that request `Ready for Merge`, `Done`, or
`Blocked`.

Purpose: enforce the four-field closeout rule without relying on a human
anti-LGTM pass after every adapter write.

## Required Execution Order

1. Read the newest status-changing closeout comment.
2. Extract the exact five fields: `CHANGED`, `VERIFIED`, `REMAINING`,
   `PRS / LINKS`, and `VERDICT`.
3. Resolve the requested lifecycle status from the target issue or PR.
4. Resolve PR/commit/comment references and label each as `contains`,
   `dogfood-platform`, `discovered-via`, or `cross-issue-side-effect`.
5. Verify `contains` references are merged or head-on-main before
   accepting a final `Done` closeout.
6. If one verdict affects multiple issues, verify relevant `REMAINING` lines
   exist on every affected issue description or issue comment.
7. Run the strict local parser contract:

```bash
node scripts/workbench-closeout-validator.mjs \
  --comment-file <closeout.md> \
  --target-status <status> \
  --references-json <references.json> \
  --affected-issues-json <affected-issues.json>
```

8. Emit `WORKBENCH_CLOSEOUT_AUDIT`.

## Failure Behavior

- Do not rewrite `VERDICT`.
- Do not convert `FLAG` to `PASS`.
- Do not silently move a `FLAG` or `BLOCK` closeout to `Done`.
- If the validator returns `BLOCK`, create a `FLAG` follow-up issue with the
  validator report and notify Supervisor.
- If the validator returns `FLAG`, create or update the matching audit
  follow-up and keep the exact missing proof visible.
- If the target platform already moved status before audit, the sweeper records
  the mismatch instead of hiding it.

## Required Output

```text
WORKBENCH_CLOSEOUT_AUDIT
target:
target_status:
comment_source:
fields_present:
closeout_verdict:
validator_verdict:
reference_checks:
remaining_sync:
follow_up_action:
privacy_check:
VERDICT: PASS | FLAG | BLOCK
```

## Public Safety

Store only sanitized issue IDs, PR numbers, commit SHAs, check summaries,
reference types, and validator verdicts. Do not store raw private transcripts,
OAuth material, request payloads, cookies, screenshots, or local-only paths.
