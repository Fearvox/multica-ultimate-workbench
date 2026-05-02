---
name: workbench-runtime-hygiene
description: Disk, swap, VM, agent workspace, and stale session hygiene for Multica workbench runtimes.
---

# Workbench Runtime Hygiene

Use this skill for runtime cleanup, disk/swap pressure, VM residue, stale
conversation/session closeout, Codex/Multica/OpenClaw worktree growth, and
Sanity-backed closeout checks.

Runtime hygiene is operations work. It protects throughput without destroying
evidence.

## Required First Move

Start with `SELF_AWARENESS_BOOTSTRAP` and name:

- runtime surface: local, remote, VM, or human desktop;
- source of truth: Multica issue/run, repo, Sanity record, or local command;
- cleanup authority: read-only, proposed, approved Trash batch, or blocked;
- operator-call conditions.

## Cleanup Tiers

- **Tier A**: caches and temp artifacts that can be regenerated. Move to Trash
  only after the exact batch is approved.
- **Tier B**: sessions, worktrees, Multica workspaces, OpenClaw workspaces,
  Colima/Lima disks, local models. Propose only until retention is confirmed.
- **Tier C**: repos, iCloud, chat apps, Photos, credentials, Sanity datasets,
  daemon config, production state. Do not mutate from this skill.

Never hard-delete and never empty Trash.

## Preferred A-Tier Tool

If `mo` is installed on the target machine, prefer it for A-tier cleanup:

```bash
mo clean --dry-run
mo clean
df -h /System/Volumes/Data
sysctl vm.swapusage
```

Treat `mo clean` as good evidence when it stays within cache/log/temp cleanup
and reports categories plus freed/free space. Do not run `mo purge`, Docker
prune, app uninstall, LaunchAgent removal, Colima/Lima cleanup, or project
artifact cleanup without a separate explicit approval.

## Session Closeout Gate

A conversation/session can close only if:

1. the issue is `done` or latest review is `PASS`;
2. no active run remains;
3. Sanity/handoff/evidence summary exists or is explicitly not applicable;
4. closing will not destroy the only copy of required evidence;
5. the report names what was checked.

Unknown state is `FLAG`, not permission to close.

## Suggested Checks

```bash
df -h /System/Volumes/Data
sysctl vm.swapusage
command -v mo && mo clean --dry-run
multica --profile desktop-api.multica.ai daemon status
multica --profile desktop-api.multica.ai issue list --status in_progress --limit 100 --output json
multica --profile desktop-api.multica.ai issue list --status in_review --limit 100 --output json
du -xsh ~/.codex ~/.cache ~/.openclaw ~/.colima ~/Library/Caches 2>/dev/null
```

Use exact profile/workspace evidence when available, but do not paste private
IDs into public docs.

## Report

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

## Verdicts

- `PASS`: pressure is under threshold or approved cleanup/closeout completed
  with readback.
- `FLAG`: useful candidates exist, but approval, Sanity sync, or active-run
  proof is missing.
- `BLOCK`: destructive action, credential action, dataset write, daemon
  mutation, or unknown source-of-truth risk requires the operator.
