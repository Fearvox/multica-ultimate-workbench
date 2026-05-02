# Runtime Hygiene Sweep Issue Template

## Goal

Reduce runtime instability from disk/swap pressure, stale conversations, VM
residue, and completed-session clutter without losing evidence or mutating live
systems unsafely.

## Context

- Repo: `Fearvox/multica-ultimate-workbench`
- Design doc: `docs/runtime-hygiene-lane.md`
- Autopilot: `autopilots/runtime-hygiene-sweeper.md`
- Skill: `skills/workbench-runtime-hygiene/SKILL.md`
- Related lanes: Auto Review Sweeper, Sanity VM Maintenance, Capy VM Lane

## Scope

- Read-only first.
- Classify cleanup candidates into Tier A, B, or C.
- Close or route session closeout only after issue/run/Sanity/handoff proof.
- Move approved Tier A cleanup batches to Trash, never hard-delete.
- Leave Tier B/C items as proposals unless explicitly approved in this issue.

## Required Checks

1. Post `SELF_AWARENESS_BOOTSTRAP`.
2. Read current disk and swap state.
3. Read current daemon status and active task count.
4. Compare active task count with visible conversation/session pressure when
   available.
5. Inspect `in_progress`, `in_review`, and recent `done` issue counts.
6. For session close candidates, verify issue verdict, active runs, and Sanity
   or handoff state.
7. For cleanup candidates, list path, size, tier, and rollback.
8. If cleanup is approved, move only the named batch to Trash and rerun disk and
   swap readback.

If `mo` is installed, prefer:

```bash
mo clean --dry-run
mo clean
df -h /System/Volumes/Data
sysctl vm.swapusage
```

`mo clean` output is acceptable A-tier evidence when it reports safe cache/log
classes and final free-space readback. Keep `mo purge`, Docker prune, app
uninstall, LaunchAgent cleanup, Colima/Lima pruning, and project-artifact
cleanup as separate explicit approvals.

## Optional Approved Cleanup Block

Cleanup is allowed only when this block is present and scoped:

```yaml
APPROVED_RUNTIME_CLEANUP_BATCH:
  tier: A
  owner: Ops Mechanic
  paths:
    - "<exact path>"
  destination: "${HOME}/.Trash/workbench-runtime-hygiene-<timestamp>/"
  hard_delete: false
  rollback: "move paths back from Trash batch before emptying Trash"
```

## Output Format

```text
RUNTIME_HYGIENE_REPORT
runtime_surface:
disk_state:
swap_state:
active_task_count:
conversation_count:
issue_backlog:
sanity_sync_state:
tier_a_candidates:
tier_b_candidates:
session_close_candidates:
actions_taken:
trash_batch:
raw_artifacts_kept_out_of_git:
validation:
residual_risk:
next_action:
VERDICT: PASS | FLAG | BLOCK
```

## Safety

- Do not hard-delete.
- Do not empty Trash.
- Do not close a conversation whose only evidence has not been summarized.
- Do not stop, restart, or reconfigure a daemon unless explicitly approved.
- Do not mutate Sanity datasets unless a separate Sanity issue approves it.
- Do not paste secrets, live IDs, raw transcripts, raw screenshots, cookies,
  OAuth material, or private payloads into Git or public comments.
