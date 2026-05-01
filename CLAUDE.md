# CLAUDE.md

Claude-compatible operating instructions for this workbench.

The canonical public overview is `README.md`. The canonical internal operating
manual is `AGENTS.md`. This file is a compact bridge for Claude-style agents and
external coding tools that look for `CLAUDE.md`.

## Mission

This repository is the durable operating memory for the Multica Ultimate
Workbench. It coordinates Codex, Claude Code, Hermes, Capy, Sanity, and related
agent surfaces without turning any one UI into the source of truth.

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
2. State the role boundary and source of truth.
3. Make the smallest useful change.
4. Verify on the real path.
5. Report what changed, what was verified, residual risk, and next action.

For non-trivial work, use the workbench SDD pipeline:

```text
Raw Requirement -> Product Design -> Technical Design -> Task List -> Execution And Verification
```

For `/goal` or `GOAL_MODE: yes`, preserve the objective until build, test,
smoke, docs/report, git status, and evidence gates are addressed, unless a real
external blocker appears.

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
