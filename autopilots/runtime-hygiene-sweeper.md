# Runtime Hygiene Sweeper Autopilot

Mode: create issue
Cadence: every 10 minutes during active high-throughput windows; downgrade to
hourly after three consecutive `PASS` or `NO_TARGETS` runs.
Preferred assignee: Ops Mechanic

Purpose: Keep local and remote runtime residue from destabilizing the workbench.
The sweeper creates bounded issues for A-tier cleanup, stale session closeout,
VM/workspace residue review, and Sanity-backed closeout checks.

Safety: Controller first. It may inspect, summarize, and route. It must not
hard-delete files, close conversations, stop daemons, mutate Sanity datasets,
delete Multica workspaces, prune repos, or change runtime config unless the
target issue includes explicit approval and a rollback path.

Live autopilot:

- Live ID: private deployment detail
- Trigger ID: private deployment detail
- Cron: `*/10 * * * *` during active pressure windows
- Timezone: `America/New_York`
- Execution mode: `create_issue`
- Issue title template: `Runtime Hygiene Sweep - {{date}}`
- Priority: `urgent` when disk free space is below floor; otherwise `high`

Target selection:

- Scan current daemon status, `in_progress`, `in_review`, and recent `done`
  issues.
- Prefer targets with high disk/swap pressure, stale conversations, completed
  work missing Sanity/handoff proof, old VM leases, or large agent workspaces.
- Exclude preserved `Workbench Max`.
- Exclude the current controller and prior hygiene controllers unless a prior
  sweep failed.
- Review at most eight issue/session targets per sweep.

Required evidence:

- Current disk and swap summary.
- Current daemon status and active task count.
- Current issue counts by status.
- For each session close candidate: issue status, latest PASS/FLAG/BLOCK
  verdict, active run state, and Sanity/handoff state.
- For cleanup candidates: path class, size, tier, authority, and rollback.
- If `mo` exists: `mo clean --dry-run` preview or the latest operator-supplied
  `mo clean` summary, plus `df` and swap readback.
- For remote targets: remote-local disk evidence; laptop paths are invalid.

Required output block:

```text
RUNTIME_HYGIENE_SWEEP
DISK_STATE:
SWAP_STATE:
ACTIVE_TASK_COUNT:
CONVERSATION_COUNT:
ISSUES_SCANNED:
SESSION_CLOSE_CANDIDATES:
SANITY_SYNC_MISSING:
TIER_A_CLEANUP_CANDIDATES:
TIER_B_REVIEW_CANDIDATES:
ROUTES_CREATED:
ACTIONS_PERFORMED:
TRASH_BATCH:
NO_TARGETS:
NEXT_BEST_ACTION:
VERDICT: PASS | FLAG | BLOCK
```

Routing rules:

- Disk free below floor or swap above threshold -> route urgent Ops Mechanic
  issue with Tier A cleanup candidates.
- If `mo clean` is available, prefer it for approved Tier A cleanup and keep
  `mo purge`, Docker prune, app uninstall, LaunchAgent removal, and Colima/Lima
  pruning as explicit follow-up approvals.
- Conversation count above warning threshold -> route session closeout review.
- Completed issue without Sanity/handoff proof -> route Synthesizer or Sanity
  context owner; do not close the session yet.
- VM lease without teardown proof -> route Workbench VM Runner or NYC VM Runner.
- Large Codex/Multica/OpenClaw/Colima residues -> classify as Tier B unless the
  issue explicitly authorizes a named batch.
- Any hard delete, repo removal, dataset write, daemon stop/restart, credential
  action, or production-resource cleanup -> `BLOCK` for human approval.

Default interpretation:

- This sweeper is runtime janitorial pressure, not a new source of truth.
- A smaller live active-task count does not automatically prove old
  conversations can close.
- Sanity sync is a closeout gate only after it stores sanitized summaries, not
  raw transcript copies.
