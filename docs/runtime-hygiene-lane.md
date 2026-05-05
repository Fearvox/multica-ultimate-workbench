# Runtime Hygiene Lane

The Runtime Hygiene Lane keeps the workbench stable while high-throughput
agents, VM runs, Codex sessions, and Sanity sync loops are active. It is the
cleanup and closeout pressure layer for local and remote runtimes.

It does not replace Multica, Auto Review Sweeper, Sanity VM Maintenance, or the
Capy VM Lane. It checks whether runtime assets can be safely reduced after the
normal evidence gates have already done their job.

## Role In The Workbench

| Surface | Owns | Boundary |
| --- | --- | --- |
| Auto Review Sweeper | `in_review` issue verdicts | closes issues only through Supervisor `PASS` |
| Sanity VM Maintenance | Sanity context freshness | no hidden dataset writes |
| Capy VM Lane | bounded GUI/browser/sandbox execution | lease, artifacts, teardown |
| Runtime Hygiene Lane | disk/swap/cache/session pressure | proposes or performs approved cleanup only |

The lane exists because "done work" can still leave costly runtime residue:
open conversations, old agent worktrees, VM disks, temp artifacts, model caches,
and stale local sessions. Those residues should be reviewed with the same
evidence discipline as feature work.

## Cleanup Tiers

| Tier | Examples | Authority |
| --- | --- | --- |
| A | package/browser/updater caches, `uv` cache, temp VM artifacts, completed-run `*/codex-home/.tmp` plugin sync caches, old approved workbench temp folders, empty temp dirs | may be moved to Trash or pruned by a named guard only when the issue or human explicitly approves the named batch |
| B | Codex sessions, Codex worktrees, Multica workspaces, OpenClaw workspaces, Colima/Lima disks, local model files | propose only until owner confirms retention value and rollback |
| C | repos, iCloud, chat apps, Photos, Sanity datasets, credentials, live daemon config, production deploy state | do not mutate from this lane |

Tier A is still not hard-delete. The default action is a named Trash batch such
as `${HOME}/.Trash/workbench-runtime-hygiene-<timestamp>/`, followed by a disk
and swap readback.

Exception: `scripts/multica-codex-cache-janitor.sh --apply` may prune only
completed-run `*/codex-home/.tmp` directories after its dry-run output is
reviewed. These directories are regenerated plugin sync caches, not run
evidence. Active runs, missing `.gc_meta.json`, or missing `completed_at` stay
out of scope.

## Preferred A-Tier Cleaner

When available on the target machine, use `mo clean` as the preferred A-tier
cleanup surface because it already uses protected patterns, skips risky classes
by default, and prints a compact summary of categories, item counts, freed
space, and remaining free space.

Use this shape:

```bash
mo clean --dry-run
mo clean
df -h /System/Volumes/Data
sysctl vm.swapusage
```

Interpretation rules:

- `mo clean` can satisfy Tier A cleanup evidence when its output shows safe
  cache/log/temp classes and no destructive project/repo action.
- `mo purge`, Docker prune, LaunchAgent removal, app uninstall, Colima/Lima
  disk pruning, and project-artifact cleanup stay review-only until a separate
  issue names exact paths and rollback.
- If `mo clean` skips a category because an app is running, keep the skip as
  residual risk instead of forcing the app closed.
- Do not store full cleaner logs in Git when they contain local paths; summarize
  categories and freed space.

## Project Artifact Cleaner Candidate

`dev-purge` is a useful project-artifact scanner for generated dependency,
build, cache, and test-output directories such as `node_modules`, `.next`,
`.venv`, `Pods`, `.turbo`, coverage output, and framework caches.

Treat it as a guarded exception, not the default cleaner:

```bash
npx dev-purge --dry-run --json
npx dev-purge --dry-run --older-than 6m --json
npx dev-purge --older-than 6m
```

Rules:

- Prefer `npx dev-purge` for evaluation before any global install.
- First run must be `--dry-run`, preferably with `--json` for reviewable
  summaries.
- Use a named scan root when possible; avoid broad home-directory scans during
  active work.
- Default to `--older-than 6m` for dependency/build cleanup across forgotten
  projects.
- Interactive mode is acceptable after dry-run review because it asks `y/n` per
  project.
- `dev-purge -a` is blocked unless the operator explicitly approves the exact
  root, filters, and dry-run summary in the same session.
- Do not run it against active worktrees, preserved repos, live VM mounts,
  iCloud folders, Photos, credentials, or production deploy directories.
- Because `dev-purge` deletes selected directories rather than moving them to
  Trash, reports must say that this is an approved hard-delete exception.

Evidence should summarize category counts, reclaimable bytes, and filters used.
Do not commit full path inventories when they reveal local private project
names.

## Memory And Port Pressure

On macOS, `ps aux -r` is not enough for memory diagnosis. It reports RSS, while
Activity Monitor's Memory column is closer to Mach `phys_footprint`, including
compressed and wired memory. A process can therefore look small in `ps` while it
is a real multi-GB footprint in Activity Monitor.

Use `ps` rankings only as candidate discovery. Confirm pressure with:

```bash
memory_pressure 2>/dev/null
vm_stat | head -10
sysctl vm.swapusage
sudo footprint -a 2>/dev/null | sed -n '1,80p'
```

Port leaks are a separate pressure class. They can cause new tabs, sockets, or
local connections to fail even when RAM looks acceptable. Use file descriptor
counts as a cheap proxy, and `lsmp` when available for Mach-port counts:

```bash
lsof -p <PID> 2>/dev/null | wc -l
command -v lsmp >/dev/null && sudo lsmp -p <PID> 2>/dev/null | grep -c "^0x"
```

Thresholds:

- Any workbench agent above 5000 ports: `FLAG`.
- Any workbench agent true footprint above 4GB for more than 1h: `FLAG`.
- Swap above 2GB: `FLAG`.
- Free RAM below 8%: `BLOCK` for new agent launches.

## Session Closeout Rule

The lane may mark a session or conversation as a close candidate only when all
of these are true:

1. The associated issue is `done`, or the latest review block is `PASS`.
2. Any required `SANITY_CONTEXT_REPORT`, `handoff`, or `evidenceEvent` summary
   exists or is explicitly not applicable.
3. No active run is still attached to the issue or runtime.
4. The closeout summary names the source of truth checked: issue, run, repo,
   Sanity record, or Supervisor verdict.
5. Closing the conversation does not destroy the only copy of required evidence.

If any field is unknown, the session stays open and the report says `FLAG`.

## Pressure Signals

Use this lane when any of these appear:

- Data volume free space below the configured floor;
- swap pressure, repeated swapfile growth, or watchdog reboot evidence;
- Multica UI conversation count materially above active task count;
- stale `in_progress` work with no active run and no recent evidence;
- Codex or agent worktree growth from many completed tasks;
- VM or container disks growing without a live lease;
- Sanity sync windows where completed work can be compacted into sanitized
  records and closed.

Default floors:

- `disk_free_floor_gib: 80`
- `disk_capacity_flag_percent: 85`
- `swap_used_flag_percent: 70`
- `conversation_warning_count: 25`
- `conversation_block_count: 50`

## Evidence Commands

Use the smallest live checks first:

```bash
df -h /System/Volumes/Data
sysctl vm.swapusage
memory_pressure 2>/dev/null || vm_stat | head -10
command -v mo && mo clean --dry-run
npx dev-purge --dry-run --older-than 6m --json
scripts/multica-codex-cache-janitor.sh
multica --profile desktop-api.multica.ai daemon status
multica --profile desktop-api.multica.ai issue list --status in_progress --limit 100 --output json
multica --profile desktop-api.multica.ai issue list --status in_review --limit 100 --output json
du -xsh ~/.codex ~/.cache ~/.openclaw ~/.colima ~/Library/Caches 2>/dev/null
```

Do not paste workspace IDs, runtime IDs, token values, raw transcripts, or raw
browser screenshots into public Git. Summarize counts and verdicts instead.

## Required Report

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

- No hard delete.
- No repo cleanup.
- No daemon stop/restart unless the issue explicitly scopes it.
- No session close without evidence handoff or explicit not-applicable reason.
- No Sanity dataset writes unless a separate Sanity issue approves the write.
- No mutation of preserved `Workbench Max`.
- Remote cleanup must treat laptop paths as invalid and use remote-local
  evidence only.
- Recurring cache cleanup jobs require a separate approval; this lane may run
  the Codex cache janitor manually but must not install launchd jobs silently.
