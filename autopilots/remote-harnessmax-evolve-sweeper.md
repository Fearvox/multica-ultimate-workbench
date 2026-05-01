# Remote HarnessMax Evolve Sweeper Autopilot

Mode: create issue
Cadence: every 10 minutes during an active 24h HarnessMax window; downgrade to
30 minutes after three consecutive `NO_TARGETS` runs.
Preferred assignee: Workbench Admin

Purpose: Keep remote Hermes, remote VM, review, and synthesis work moving toward
the highest-yield path while forcing Research Vault pressure before routing.

Safety: Controller only. It may review, route, and create bounded follow-up
issues. It must not edit files, mutate runtimes, change agent bindings, change
permission profiles, modify preserved agents, or write to Research Vault.

Live autopilot:

- Live ID: private deployment detail
- Trigger ID: private deployment detail
- Cron: `*/10 * * * *`
- Timezone: `America/New_York`
- Execution mode: `create_issue`
- Issue title template: `Remote HarnessMax Evolve Sweep - {{date}}`
- Priority: `high`

Target selection:

- Scan `in_review`, `blocked`, and high-priority `in_progress` issues.
- Prefer titles/descriptions containing `HARNESSMAX`, `UPSTREAM_SYNC`,
  `remote`, `NYC`, `Hermes`, `VM`, `Research Vault`, `RV`, `MCP`, `CCR`, or
  `Goal Mode`.
- Exclude this controller issue and prior sweep controller issues unless a prior
  failed sweep is the target.
- Exclude preserved `Workbench Max` unless the human explicitly assigned it.
- Review at most six targets per sweep.
- Prefer targets with missing `RV_PRESSURE_CHECK`, missing repo-anchor proof,
  missing VM proof, or stale review evidence.

Required evidence:

- `multica issue list --output json --limit 100`
- `multica issue get <target-issue-id> --output json`
- `multica issue comment list <target-issue-id> --output json`
- `multica issue runs <target-issue-id> --output json`
- For repo claims, prefer the issue's project-bound GitHub repo resource.
- On remote runtimes, mark laptop `file://<LOCAL_WORKBENCH_REPO>` and
  `file://<LOCAL_RESEARCH_VAULT>` anchors invalid unless the issue proves they
  are mounted on that host.

Required output block:

```text
REMOTE_EVOLVE_SWEEP
TARGETS_SCANNED:
TARGETS_REVIEWED:
RV_PRESSURE_MISSING:
REPO_ANCHOR_FLAGS:
VM_PROOF_NEEDED:
HERMES_SYNTHESIS_NEEDED:
ROUTES_CREATED:
REVIEWED_TO_DONE:
BLOCKED:
NO_TARGETS:
NEXT_BEST_ACTION:
VERDICT: PASS | FLAG | BLOCK
```

Routing rules:

- Missing Research Vault grounding -> create or route to an L2 Pressure follow-up.
- Missing remote RV MCP access -> create or route to RV MCP Remote Preflight.
- Missing VM/browser proof -> route to NYC VM Runner or Workbench VM Runner.
- Missing synthesis after implementation -> route to Workbench Synthesizer or
  NYC Hermes Researcher.
- Finished work with evidence -> ask or perform Supervisor review using
  `AUTO_REVIEW`.
- Conflicting child evidence -> leave the target in review and route Supervisor.

Default interpretation:

- The sweeper is a pressure-and-routing controller, not an implementer.
- It improves sweep rate by creating the next bounded issue, not by broadening
  the current issue.
- It should set the controller issue to `done` after posting the sweep block
  unless the sweep itself hit a tooling failure.
