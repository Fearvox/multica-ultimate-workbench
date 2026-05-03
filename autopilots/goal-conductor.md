# Goal Conductor Autopilot

Status: **design contract** — not yet deployed as a live autopilot.

## Purpose

Persistent goal conductor that turns operator shorthand into decision packets,
dispatches bounded issues, monitors their state, harvests evidence, archives
noise, and continues until the objective is met or a real blocker appears.

This is the autopilot-side realization of Goal Mode v2
(`skills/workbench-goal-mode-v2/SKILL.md`). It replaces the "create endless
periodic controller issues" pattern with a durable control loop: one conductor
issue per goal that persists across observation cycles.

## Mode

`create_issue` — the conductor creates at most one follow-up routing issue per
observation cycle, and only when new evidence requires a re-route.

## Trigger Cadence

- **Active window**: every 15 minutes while any dispatched child issue is
  `in_progress` or `in_review`.
- **Quiet window**: every 60 minutes when all dispatched issues are `done`,
  `cancelled`, or `blocked`.
- **Dormant**: paused when the conductor issue itself is `blocked` or
  `OPERATOR_NEEDED`.

## Agent Assignment

- **Owner**: Workbench Admin (design + dispatch)
- **Reviewer**: Workbench Supervisor (evidence verification)
- **Memory**: Workbench Synthesizer (harvest evidence into SYNTHESIS.md,
  DECISIONS.md)
- **Archive**: Memory Curator (archive completed issues, cancel noise)

## Controller Contract

### On Each Trigger

1. Read the conductor issue and latest decision packet.
2. Run `multica issue list --status in_progress --assignee <dispatched-agents>`
   to check active child state.
3. Run `multica issue list --status in_review --limit 10` to check review-ready
   children.
4. If any child moved to `done`: harvest evidence into the conductor issue
   comment.
5. If any child is stale `in_review` (>48h no activity): post one nudge to the
   child issue.
6. If all children are `done` or `cancelled`: evaluate closeout gates.
   - PASS → post GOAL_MODE_V2_CLOSEOUT, set conductor to `in_review`.
   - FLAG → post revised decision packet, re-dispatch.
   - BLOCK → classify blocker, post OPERATOR_NEEDED or enter cooldown.
7. If new external evidence appeared: produce a revised decision packet, but
   only if the cooldown has elapsed.

### What This Autopilot Does NOT Do

- Create issues without a decision packet.
- Re-run blocked lanes (DAS-696, DAS-693, or operator-declared frozen lanes).
- Mutate runtime, daemon, Desktop, secrets, OAuth, or live autopilot config.
- Touch Workbench Max.
- Create more than one new issue per trigger cycle.
- Exceed `max_active` concurrent issues per goal.

## Dedupe Key Convention

`goal/<goal-id-shorthand>/<route-hash>`

Example: `goal/route-stuck-branch/d4f8a1c`

Before creating any issue, check if an issue with the same dedupe key already
exists and is active (not `done` or `cancelled`).

## Noise Prevention

- Cancelled noise issues immediately (status `cancelled`, not `blocked`).
- Archive `done` issues after evidence is harvested — do not re-read or re-route.
- Self-cancel: if this conductor issue is the only remaining active issue and
  all dispatched work is terminal, post final verdict and stop triggering.
- Cooldown violation: if a trigger fires before cooldown elapses, skip the cycle
  and log a one-line skip note.

## Deployment Gate

This contract must NOT be deployed as a live autopilot until:
1. The `workbench-goal-mode-v2` skill is reviewed and live-synced.
2. The `goal-mode-v2` issue template is reviewed.
3. Operator approval is obtained (separate issue with rollback plan).
4. A dogfood pass completes on a non-critical goal.

## Related

- Skill: `skills/workbench-goal-mode-v2/SKILL.md`
- Issue template: `issue-templates/goal-mode-v2.md`
- Prior art: `autopilots/remote-harnessmax-evolve-sweeper.md` (controller pattern),
  `autopilots/auto-review-sweeper.md` (review cycle pattern)
- Evidence: DAS-768 Goal Mode v2 design
