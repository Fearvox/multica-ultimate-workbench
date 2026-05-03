# Codex Workbench Runtime Profile

Workbench Codex runs should be lean by default. Ordinary issue/comment/review
tasks need local shell, Git, and the `multica` CLI. They should not inherit the
full user Codex plugin or marketplace profile.

## Problem

Some Multica per-run `codex-home/config.toml` files inherit the full
`~/.codex/config.toml`. When that config contains `[marketplaces.*]` or
`[plugins.*]` tables, Codex syncs plugin repositories into `codex-home/.tmp`
even when the task never uses those plugins.

That directory is cache residue, not task evidence.

## Default Profile Contract

For normal Workbench Codex agents:

- generate per-run `codex-home/config.toml` from
  [config/multica-workbench-codex-profile.example.toml](../config/multica-workbench-codex-profile.example.toml);
- do not copy the full user `~/.codex/config.toml`;
- omit all `[marketplaces.*]` and `[plugins.*]` tables unless the issue
  explicitly requires a plugin-backed capability;
- keep auth and provider access in the trusted runtime environment, not in repo
  docs or issue comments;
- keep model, context, approval, sandbox, and feature flags explicit.

If the launcher is using `codex exec`, prefer:

```bash
codex exec \
  --ignore-user-config \
  --skip-git-repo-check \
  --ephemeral \
  --config model='"gpt-5.5"' \
  --config model_context_window=1000000 \
  --config model_auto_compact_token_limit=220000 \
  --config model_reasoning_effort='"xhigh"'
```

If the launcher is using `codex app-server`, do not assume
`--ignore-user-config` is available. Generate the lean per-run config instead
and pass only app-server-supported `--config` overrides.

## Explicit Plugin Exception

If a Workbench Codex task really needs a plugin, MCP, app connector, or browser
automation surface:

1. Route through Standard or Heavy Path based on the task risk.
2. Name the exact capability needed.
3. Add only that capability to the per-run profile or runtime config.
4. Verify that the new run does not import unrelated plugin/marketplace tables.

Do not restore the full user profile as a shortcut.

## Cache Guard

Use the janitor in dry-run mode first:

```bash
scripts/multica-codex-cache-janitor.sh
```

Apply only after the dry-run list is reviewed:

```bash
scripts/multica-codex-cache-janitor.sh --apply
```

The script deletes only `*/codex-home/.tmp` for runs whose `.gc_meta.json`
contains `completed_at`. It does not touch `workdir`, `logs`, `output`, Codex
config, auth, or session files.

Do not install or load a launchd job from this repo. Recurring cleanup needs a
separate human approval and runtime-hygiene issue.

## Verification

For a completed run:

```bash
test ! -d "$RUN_DIR/codex-home/.tmp" || du -sh "$RUN_DIR/codex-home/.tmp"
scripts/multica-codex-cache-janitor.sh --root "$MULTICA_WORKSPACES_ROOT"
```

Closeout should report:

```text
CODEX_WORKBENCH_PROFILE_REPORT
runtime_surface:
launcher_mode: exec | app-server | unknown
profile_source:
plugin_tables_present: yes | no | unknown
cache_guard:
verification:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

`PASS` requires a lean profile or `--ignore-user-config` equivalent plus
post-run cache evidence. `FLAG` is correct when the janitor works but the
launcher still lacks a profile hook. `BLOCK` is correct when plugin tables,
secrets, or active-run caches would be deleted or inherited blindly.
