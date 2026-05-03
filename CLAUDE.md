# CLAUDE.md

Claude-compatible operating instructions for this workbench.

The canonical public overview is `README.md`. The canonical internal operating
manual is `AGENTS.md`. This file is a compact bridge for Claude-style agents and
external coding tools that look for `CLAUDE.md`.

## Mission

This repository is the durable operating memory for the Multica Ultimate
Workbench. It coordinates Codex, Claude Code, Hermes, Capy, Sanity, and related
agent surfaces without turning any one UI into the source of truth.

## Codex App Supervisor Session

If a Codex Desktop chat is designated as the Multica supervisor session, treat
this repo as the logical working root even when the terminal starts elsewhere.
Use explicit `workdir` or `git -C <LOCAL_WORKBENCH_REPO>` before making repo
claims or edits. Do not write workbench handoffs into the accidental startup
repo. Browser, Discord, Superconductor, and Capy UI state are supporting
signals; repo, GitHub, CI, Multica issue evidence, and review verdicts remain
the source of truth.

## Read Order

Read only as deep as the task requires:

1. `AGENTS.md`
2. `README.md`
3. `SYNTHESIS.md`
4. `DECISIONS.md`
5. Relevant files under `docs/`, `skills/`, `issue-templates/`, and `.capy/`

For Capy work, read `.capy/CAPTAIN.md`, `.capy/BUILD.md`, `.capy/REVIEW.md`,
and `.capy/settings.json` after `AGENTS.md`.

## Hard Boundaries

- Do not store or paste secrets, OAuth material, tokens, cookies, raw request
  payloads, raw transcripts, private screenshots, or private browser traces.
- Do not mutate Multica daemon, Desktop UI, Capy project settings, Sanity
  dataset, GitHub repo settings, or runtime credentials unless the task
  explicitly asks for that action.
- Do not treat Capy UI, chat memory, or Sanity memory as authoritative over
  Git, GitHub, CI, repo files, or review comments.
- Do not claim completion without concrete evidence: commands, files, commits,
  PRs, checks, screenshots, or explicit review verdicts.

## Default Work Loop

1. Inspect the current repo and task state.
2. Choose the Friction Tier: Fast, Standard, or Heavy.
3. State the role boundary and source of truth when the tier requires it.
4. Make the smallest useful change.
5. Verify on the real path.
6. Report what changed, what was verified, residual risk, and next action.

Fast Path covers low-risk reading, summaries, copy, ACKs, empty scaffolds, and
no-code/no-secret/no-runtime work. Skip heavy preflights unless repo/runtime
ownership is ambiguous and close with Done / Changed / Verified / Next one
action.

Standard Path covers ordinary patches, demos, tests, PR prep, and visual fixes.
Use an issue anchor or explicit local task, set evidence expectations before
execution, and verify only the touched path.

Heavy Path covers runtime, agents/autopilots, deploy, payment, OAuth, secrets,
branch/merge, public proof, daemon/Desktop/core, and remote VM work. Require
Self-Awareness, Goal Lock when the objective spans turns, full evidence before
PASS, Temporal Pincer for PASS/done/ready-to-merge, and human approval for
sensitive mutation.

Use the full SDD pipeline when the selected tier calls for it:

```text
Raw Requirement -> Product Design -> Technical Design -> Task List -> Execution And Verification
```

For `/goal` or `GOAL_MODE: yes`, preserve the objective until build, test,
smoke, docs/report, git status, and evidence gates are addressed, unless a real
external blocker appears. For `GOAL_MODE_V2: yes`, use the two-layer autonomous
conductor (`skills/workbench-goal-mode-v2/SKILL.md`): design layer produces
decision packets, dispatch layer routes to bounded issues with dedupe/cooldown/
archive controls.

## Sanity Context

Sanity is the shared sanitized context registry. Use it for structured lookup,
not as an unreviewed memory override.

Allowed: sanitized roles, statuses, summaries, public repo paths, public PR
numbers, commit subjects, verdict labels, command names, exit status, and
pointers to private evidence.

Forbidden: secrets, OAuth material, API keys, cookies, raw logs, raw payloads,
full transcripts, private screenshots, and live private IDs.

## Capy Git Dialogue

Capy should use commits, PR descriptions, review comments, and repo diffs as the
durable conversation lane. Browser-visible Capy status is helpful supporting
evidence, but mergeability and completion still come from GitHub, CI, and the
repository.

When in doubt, return a `FLAG` verdict with the exact missing evidence instead
of expanding scope or guessing.
