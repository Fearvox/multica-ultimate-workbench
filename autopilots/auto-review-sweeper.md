# Auto Review Sweeper Autopilot

Mode: create issue
Cadence: every 30 minutes
Preferred assignee: Workbench Supervisor

Purpose: Automatically pick up issues that have reached `in_review` so completed agent work does not require a human to manually reassign every task for review.

Safety: Review and status-transition only. No file edits, agent/runtime/skill/autopilot changes, broad raw payload dumps, or persistent artifacts unless the target issue explicitly asks for them.

Live autopilot:

- ID: `3908843d-69e5-487c-85e3-56775882c4fb`
- Trigger ID: `c39b4e43-d344-4512-ab6e-dcf7ea8c9542`
- Cron: `*/30 * * * *`
- Timezone: `America/New_York`
- Execution mode: `create_issue`
- Issue title template: `DAS Auto Review Sweep - {{date}}`
- Priority: `high`

Target selection:

- Select issues with status `in_review`.
- Exclude the current sweep controller issue.
- Exclude issues whose title contains `Auto Review Sweep` unless reviewing a previous failed sweep explicitly matters.
- Prefer issues whose latest non-member agent comment or completed run is newer than the latest Supervisor/QA review comment.
- Review at most three target issues per sweep, oldest `updated_at` first.
- If no targets exist, post `NO_TARGETS` on the sweep issue and set the sweep issue to `done`.

Required target evidence:

- `multica issue get <target-issue-id> --output json`
- `multica issue comment list <target-issue-id> --output json`
- `multica issue runs <target-issue-id> --output json`
- Prefer the target issue's `Ultimate Workbench` project GitHub repo resource before repo-local evidence claims.
- Use `multica repo checkout file:///Users/0xvox/multica-ultimate-workbench` only on laptop-local runtimes; mark it invalid on remote runtimes such as `hermes-nyc1-multica`.
- `scripts/collect-flight-recorder.sh <target-issue-id>` only when compact run evidence is needed.

Target review block:

```text
AUTO_REVIEW
TARGET: <identifier>
VERDICT: PASS | FLAG | BLOCK
VERDICT_SUMMARY: three lines or fewer
EVIDENCE: concrete issue/comment/run IDs, commands, or file paths checked
STATUS_ACTION: done | kept in_review | blocked | no_change
NEXT_ACTION: exact next owner/action, or none
```

Status transitions:

- `PASS`: if the issue goal is satisfied and no required follow-up remains, set the target issue to `done`.
- `FLAG`: leave the target issue in `in_review` and name the bounded next action.
- `BLOCK`: set the target issue to `blocked` and explain the blocking evidence.
- `PENDING`: if the run is still active or evidence has not arrived, leave the issue unchanged and note why in the sweep summary.

Sweep summary block:

```text
REVIEW_SWEEP_SUMMARY
TARGETS_SCANNED:
TARGETS_REVIEWED:
PASSED_TO_DONE:
FLAGGED_LEFT_IN_REVIEW:
BLOCKED:
PENDING:
RESIDUAL_RISK:
```

Default interpretation:

- This is the automatic review gate, not an automatic implementer.
- It can close work only through a Supervisor `PASS`.
- It should not silently assign new implementation work unless the target issue explicitly asks for routing.
- It should keep the sweep controller issue concise and set it to `done` unless the sweep itself hit a tooling failure.
