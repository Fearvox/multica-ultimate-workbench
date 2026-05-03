# Adapter Boundaries

The VM prototype proves local decision behavior with fixture-backed adapters. It must not mutate Multica Desktop, daemon state, GitHub, live CAPY, native app code, branches, or files outside `prototypes/decision-runtime-vm/`.

## Repo Adapter

Purpose: read repo path, branch, dirty state, diff summary, and local command evidence.

Prototype mode: fixture-backed from `fixtures/route-stuck-branch.context.json`.

Live boundary:

- allowed: `git status --short`, `git branch --show-current`, `git diff --stat`, read-only file refs;
- blocked by default: branch changes, commits, resets, rebases, merges, file edits.

## Multica Adapter

Purpose: read issues, bind or create issue, and send scoped instruction.

Prototype mode: fixture-backed issue anchor `EVENS-007`; dispatch records a local sanitized receipt in process memory only.

Live boundary:

- allowed after confirmation: create/bind issue and send scoped instruction through a separate approved run;
- blocked by default: daemon config mutation, Desktop patching, unconfirmed issue creation, raw transcript persistence.

## GitHub Adapter

Purpose: read PRs, check status, review status, and branch evidence.

Prototype mode: fixture-backed open PR `#37`, failing check, and stale review state.

Live boundary:

- allowed: read PR/check/review state;
- blocked by default: push, merge, review submission, label mutation, branch protection changes.

## CAPY / VM Adapter

Purpose: independent skeptical observation of UI state versus primary truth.

Prototype mode: fixture says UI appears ready while backend evidence is missing, forcing a false-PASS attack.

Live boundary:

- allowed: observe task/thread/PR panels when the issue asks for CAPY/VM observation;
- blocked by default: OAuth, merge, publish, permission, destructive controls, private screenshot persistence.

## Authority Rule

CAPY/VM observation is supporting evidence. Repo, GitHub, Multica issue state, CI/check status, and explicit command/run evidence remain primary truth.
