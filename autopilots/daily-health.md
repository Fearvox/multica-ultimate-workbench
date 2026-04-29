# Daily Health Autopilot

Mode: create issue
Cadence: daily at 09:00 America/New_York
Preferred assignee: Workbench Admin

Purpose: Create a daily health issue that asks for new failures, recurring risks, stable systems, and the highest-priority next action.

Safety: Read-only. No cleanup, config changes, or message publishing.

Live autopilot:

- ID: `4817fd24-d0e7-4629-a220-0d36bda40b28`
- Trigger ID: `72d4c082-9f6b-4bb6-ac70-2a0498f62967`
- Cron: `0 9 * * *`
- Timezone: `America/New_York`
- Execution mode: `create_issue`
- Issue title template: `DAS Health Check - {{date}}`

Required evidence separation:

- Issues: list all issues and blocked issues.
- Configured agents: run `multica agent list --output json`; report exact count and names.
- Human members: run `multica workspace members 5470ee5d-0791-4713-beb4-fd6a187d6523 --output json`; report separately from agents.
- Autopilots: run `multica autopilot list --output json`; report active/paused state and last run.
- Risk evidence: cancelled/failed runs must include exact issue/run IDs and whether the direct owner/review/QA path still completed.
