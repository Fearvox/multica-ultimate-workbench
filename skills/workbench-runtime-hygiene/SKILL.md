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

- **Tier A**: caches and temp artifacts that can be regenerated, including
  completed-run `*/codex-home/.tmp` plugin sync caches. Move to Trash or prune
  with the named guard only after the exact batch is approved.
- **Tier B**: sessions, worktrees, Multica workspaces, OpenClaw workspaces,
  Colima/Lima disks, local models. Propose only until retention is confirmed.
- **Tier C**: repos, iCloud, chat apps, Photos, credentials, Sanity datasets,
  daemon config, production state. Do not mutate from this skill.

Never hard-delete and never empty Trash.

Exception: `scripts/multica-codex-cache-janitor.sh --apply` may prune only
completed-run `*/codex-home/.tmp` directories after dry-run review. Active runs,
missing `.gc_meta.json`, or missing `completed_at` are not eligible.

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

## Project Artifact Tool

`dev-purge` can scan generated project bloat (`node_modules`, `.next`, `.venv`,
`Pods`, `.turbo`, coverage, and framework caches). It is useful when disk is
full, but it is a hard-delete tool and must stay behind a dry-run gate:

```bash
npx dev-purge --dry-run --json
npx dev-purge --dry-run --older-than 6m --json
npx dev-purge --older-than 6m
```

Rules:

- First run must be dry-run, preferably JSON.
- Default to `--older-than 6m` for forgotten projects.
- Use a named scan root when possible.
- Interactive `y/n` cleanup is acceptable after reviewing the dry-run.
- Block `dev-purge -a` unless the operator approves exact root, filters, and
  dry-run summary in the same session.
- Never run against active worktrees, preserved repos, VM mounts, iCloud,
  Photos, credential folders, or production deploy directories.
- Reports must say this is an approved hard-delete exception; do not imply it
  moved files to Trash.

## Session Closeout Gate

A conversation/session can close only if:

1. the issue is `done` or latest review is `PASS`;
2. no active run remains;
3. Sanity/handoff/evidence summary exists or is explicitly not applicable;
4. closing will not destroy the only copy of required evidence;
5. the report names what was checked.

Unknown state is `FLAG`, not permission to close.

## Memory Pressure

Memory exhaustion is a common cause of browser renderer crashes, agent OOM
kills, and swap thrash on workbench machines. Check memory before disk when the
symptom is "cannot open new connection", renderer crash, or agent stall.

### RSS vs Real Footprint (macOS critical)

`ps aux -r` shows RSS, not the real macOS process footprint. RSS can exclude
compressed pages, wired memory, and shared regions. Activity Monitor's Memory
column is closer to `phys_footprint` from Mach `task_info`, so it can show a
process at 9GB while `ps` appears to show only a few MB.

Use RSS only to find candidates. Confirm real pressure with system-level and
footprint-oriented checks:

```bash
memory_pressure 2>/dev/null
vm_stat | head -10
sysctl vm.swapusage

# Closest CLI signal to Activity Monitor. Output format varies by macOS version.
sudo footprint -a 2>/dev/null | sed -n '1,80p'

# RSS candidate list only, not final proof.
ps -eo pid,rss,%mem,comm | sort -k2 -rn | head -15
```

### Port Leak Detection

Port leaks can look like memory issues because new tabs, sockets, or local
connections fail before RAM is visibly exhausted. Normal app processes should
usually stay far below 1000 ports; >5000 is a Workbench `FLAG`.

```bash
# File descriptor/socket proxy. `lsof` is not exact Mach-port truth, but a huge
# count is still a useful leak signal.
lsof -p <PID> 2>/dev/null | wc -l

# Mach port count when `lsmp` exists on the host.
command -v lsmp >/dev/null && sudo lsmp -p <PID> 2>/dev/null | grep -c "^0x"

# Top file descriptor consumers for the current user. Avoid empty-pattern pgrep.
ps -axo pid=,user=,comm= | awk -v u="$(whoami)" '$2 == u {print $1}' | while read -r pid; do
  count=$(lsof -p "$pid" 2>/dev/null | wc -l | tr -d ' ')
  [ "${count:-0}" -gt 2000 ] && echo "HIGH FD/PORT PROXY: PID $pid - $count open fds/sockets"
done
```

### Workbench Agent Memory Budget

| Agent | Typical RSS | True Footprint | Notes |
| --- | --- | --- | --- |
| Claude Code session | 400-600MB | 600-900MB | grows with conversation length |
| Hermes agent | 300-500MB | 400-700MB | Python/gateway worker |
| Superconductor daemon | 250-400MB | 350-600MB | Electron plus MCP servers |
| Codex Desktop | 300-500MB | 500-800MB | per workspace |
| Vibe Island | 600-900MB | 1-7GB | Electron plus ports; known leak candidate |
| Brave, per 10 tabs | 800MB-1.5GB | 1-2GB | renderer-per-tab model |
| index-tts server | 2-500MB | 0.5-10GB | model loading spikes; idle RSS misleading |

Thresholds:

- Free RAM <15% total: `FLAG`; suspend idle sandboxes and defer non-critical
  agent spawn.
- Free RAM <8% total: `BLOCK`; do not start new agents.
- Swap >2GB: `FLAG`; pressure is real, not just macOS cache behavior.
- Any agent >5000 ports: `FLAG`; restart or isolate the process.
- Any agent true footprint >4GB for more than 1h: `FLAG`; investigate leak.

## Suggested Checks

```bash
memory_pressure 2>/dev/null || vm_stat | head -10
ps -eo pid,rss,%mem,comm | sort -k2 -rn | head -15
df -h /System/Volumes/Data
sysctl vm.swapusage
command -v mo && mo clean --dry-run
npx dev-purge --dry-run --older-than 6m --json
scripts/multica-codex-cache-janitor.sh
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
memory_state:
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
