# Daily Health Autopilot

Mode: create issue
Cadence: daily at 09:00 America/New_York
Preferred assignee: Workbench Admin

Purpose: Create a daily health issue that asks for new failures, recurring risks, stable systems, and the highest-priority next action.

Safety: Read-only. No cleanup, config changes, or message publishing.

Live autopilot:

- Live ID: private deployment detail
- Trigger ID: private deployment detail
- Cron: `0 9 * * *`
- Timezone: `America/New_York`
- Execution mode: `create_issue`
- Issue title template: `DAS Health Check - {{date}}`

Required evidence separation:

- Issues: list all issues and blocked issues.
- Configured agents: run `multica agent list --output json`; report exact count and names.
- Human members: run `multica workspace members <workspace-id> --output json`; report separately from agents.
- Autopilots: run `multica autopilot list --output json`; report active/paused state and last run.
- Risk evidence: cancelled/failed runs must include exact issue/run IDs and whether the direct owner/review/QA path still completed.
- Run finalization: report any issue in `in_review`, `done`, or `blocked` that
  still has active runs, plus any exact duplicate result comments found by the
  flight recorder.
- Flight recorder: for the current health issue, run `scripts/collect-flight-recorder.sh <issue-id>` after inspection and include only the compact `RUN_DIGEST` highlights.

Storage discipline:

- Do not store raw workspace dumps, full run messages, screenshots, traces, or broad logs in this repo by default.
- Use `--artifact-dir "${TMPDIR:-/tmp}/workbench-flight-recorder/<issue-id>"` only when a reviewer needs a durable summary artifact.
