---
id: parking-hermes-kanban-pr-train-20260504
type: contribution_train
target_repo: NousResearch/hermes-agent
target_url: https://github.com/NousResearch/hermes-agent
created_at_utc: 2026-05-04T04:10:00Z
updated_at_utc: 2026-05-04T05:13:45Z
status: in_progress
related_local_signal: docs/hermes-kanban-parity-signal.md
---

# Hermes Kanban PR Train

## Goal

Move Workbench/Superconductor Kanban learnings into `NousResearch/hermes-agent`
through small, evidence-backed PRs that are easy for humans and agents to
review.

This is a contribution train, not a takeover. Community interest from Discord is
a routing signal only. PR acceptance must stand on repo evidence, tests, and
maintainer-readable scope.

## Live Evidence Checked

- Target repo: `NousResearch/hermes-agent`
- Default branch: `main`
- Current upstream has first-class Kanban surfaces:
  - `hermes_cli/kanban.py`
  - `hermes_cli/kanban_db.py`
  - `tools/kanban_tools.py`
  - `plugins/kanban/dashboard/plugin_api.py`
  - `tests/hermes_cli/test_kanban_cli.py`
  - `tests/hermes_cli/test_kanban_db.py`
  - `tests/tools/test_kanban_tools.py`
  - `tests/plugins/test_kanban_dashboard_plugin.py`
  - `website/docs/user-guide/features/kanban.md`
  - `website/docs/user-guide/features/kanban-tutorial.md`
- PR template requires:
  - clear problem and approach
  - related issue or rationale
  - type of change
  - changed file paths
  - test steps
  - proof that the PR contains only related changes
- PR #19507 was closed and superseded by #19508 because the original branch
  carried unrelated TUI files. This is the proof point for our rule:
  one PR equals one reviewable slice.
- PR #19512 is open: docs-only handoff evidence convention.
- PR #19522 is open: test-only metadata round-trip fixture through
  `kanban_complete` and `kanban_show`. It is refreshed onto latest `main` and
  locally validated with `scripts/run_tests.sh tests/tools/test_kanban_tools.py
  -q` (`32 passed, 4 warnings`).
- PR #19536 is open as an independent web sidecar: shadcn-compatible
  `@loading-ui/ring` primitive plus status/loading usage in the dashboard. It
  is not part of the Kanban evidence train and should not be used to justify
  dashboard/schema follow-ups.

## Truth Boundary

Use in PRs:

- repo file paths
- command output
- test output
- before/after behavior
- links to public GitHub PRs, issues, docs, or release notes
- explicit non-goals

Do not use in PRs:

- private Discord screenshots
- claims like "mods approved this" unless there is a public maintainer comment
- raw chat transcripts
- hidden planning notes
- broad claims that Hermes "needs Workbench"
- chain-of-thought style reasoning

Agent-readable does not mean exposing chain-of-thought. It means stable headings,
machine-scannable fields, concrete file paths, and reproducible evidence.

## Contribution Principle

Hermes already has Kanban. The useful contribution is not "add Kanban." The
useful contribution is to harden:

1. handoff evidence quality
2. worker completion metadata
3. blocked/retry semantics
4. docs that prevent misuse
5. tests that prove agents and humans can read the same task truth

## PR Train

### PR A: Docs-only Evidence Contract

Type: documentation update

Objective: document the shape of a high-quality Kanban worker handoff without
changing runtime behavior.

Candidate files:

- `website/docs/user-guide/features/kanban.md`
- `website/docs/user-guide/features/kanban-tutorial.md`
- optional: `docs/hermes-kanban-v1-spec.pdf` follow-up only if source exists

Evidence:

- `kanban_complete(summary=..., metadata={...})` already accepts structured
  metadata in `tools/kanban_tools.py`
- current docs teach the lifecycle but can make evidence fields more explicit
- Workbench dogfood shows downstream agents fail when handoffs omit changed
  files, verification, blockers, and residual risk

Proposed content:

```text
Recommended completion metadata:
  changed_files: string[]
  verification: string[]
  dependencies: string[]
  blocked_reason: string | null
  retry_notes: string | null
  residual_risk: string[]
```

Non-goals:

- no schema migration
- no dashboard work
- no new tools
- no claim that metadata keys are mandatory

Tests:

- docs build if available
- link check if available
- otherwise `git diff --check` plus exact rendered markdown review

Why first:

Docs-only PR lets maintainers accept or reject the vocabulary before code depends
on it.

### PR B: Handoff Metadata Fixture Tests

Type: tests

Objective: prove that worker completion metadata survives the full Kanban
handoff path and remains readable through `kanban_show`.

Candidate files:

- `tests/tools/test_kanban_tools.py`
- `tests/hermes_cli/test_kanban_db.py`

Evidence:

- `kanban_complete` already forwards `metadata` to `complete_task`
- `kanban_show` already returns runs and metadata
- this PR should only add fixtures/assertions around existing behavior

Non-goals:

- no new metadata schema enforcement
- no dashboard rendering changes
- no migration

Tests:

- focused pytest for the touched Kanban tests
- broader Kanban test subset if cheap

### PR C: Optional Evidence Packet Formatter

Type: small feature

Objective: provide a helper that formats completion metadata into a predictable
human-readable evidence packet while preserving raw JSON for agents.

Candidate files:

- `hermes_cli/kanban.py`
- `hermes_cli/kanban_db.py`
- tests under `tests/hermes_cli/`

Evidence:

- CLI already has plain text and `--json` surfaces
- a formatter can improve human review without changing DB truth

Non-goals:

- no mandatory metadata keys
- no model judgement
- no confidence/trust scoring
- no agent memory mutation

### PR D: Blocked/Retry Semantics Clarification

Type: documentation or tests first; code only if repo evidence shows a gap

Objective: make blocked tasks mean "needs external input or circuit breaker
tripped," not "worker got tired."

Candidate surfaces:

- `website/docs/user-guide/features/kanban.md`
- `tools/kanban_tools.py` error/help strings
- `tests/hermes_cli/test_kanban_core_functionality.py`

Evidence:

- current docs already describe auto-block after repeated spawn failures
- Workbench/Superconductor review loops rely on exact `blocked_reason` to avoid
  repeating the same failed path

Non-goals:

- no dispatcher rewrite
- no status taxonomy expansion

### PR E: Dashboard Evidence Layout

Type: UI/docs, only after A/B/C are accepted or explicitly requested

Objective: make handoff metadata readable in the Kanban dashboard without
turning cards into noisy logs.

Candidate files:

- `plugins/kanban/dashboard/*`
- `tests/plugins/test_kanban_dashboard_plugin.py`

Evidence:

- dashboard already exists
- screenshots in public docs show task drawers and retry history
- metadata should be progressive disclosure: card summary first, drawer detail
  second, raw JSON only behind an expansion

Non-goals:

- no decorative redesign
- no raw transcript display
- no secrets/log dumping

## UI Sidecar PRs

### PR U1: Loading Ring Status Primitive

Type: web UI foundation

Objective: add a small shadcn-compatible loading primitive without widening the
Kanban evidence PRs.

Live PR:

- #19536 `feat(web): add loading-ui ring status primitive`
- URL: https://github.com/NousResearch/hermes-agent/pull/19536

Changed files:

- `web/components.json`
- `web/tsconfig.json`
- `web/src/components/loading-ui/ring.tsx`
- `web/src/App.tsx`
- `web/src/pages/ProfilesPage.tsx`

Verification:

- `cd web && npm ci` passed with 0 vulnerabilities reported
- `cd web && npm run build` passed
- `cd web && npx eslint src/App.tsx src/pages/ProfilesPage.tsx src/components/loading-ui/ring.tsx` passed
- `cd web && npx shadcn@latest add @loading-ui/ring --dry-run --yes` reported the generated component as identical/skipped
- full `cd web && npm run lint` is blocked by existing lint errors in untouched
  files, so PR #19536 reports that limitation explicitly

## PR Body Layout

Use this structure for every PR:

```markdown
## What does this PR do?

One paragraph: problem, narrow change, why this is the right first slice.

## Related Issue

Fixes #...

If no issue exists, say: No issue yet; this is a docs/test-only clarification
for existing Kanban behavior.

## Type of Change

- [x] Documentation update
- [x] Tests

## Changes Made

- `path`: exact change
- `path`: exact change

## Evidence Checked

- Existing surface: `path:function_or_section`
- Prior PR hygiene: #19507 was superseded by #19508 to keep scope clean
- Local command: `...`

## How to Test

1. command
2. command
3. manual doc/readability check if docs-only

## Non-goals

- Not changing runtime scheduling
- Not changing database schema
- Not making metadata mandatory

## Residual Risk

What could still be wrong, and why the PR is still safe to review.
```

## Agent Instructions

Before opening any PR:

1. Pull latest upstream `main`.
2. Search open PRs and issues for the exact slice.
3. Create a branch named for one slice only.
4. Keep the diff under the PR's candidate files.
5. Run focused tests first; run broader tests only if the touched surface needs it.
6. Use the upstream PR template.
7. Mention Discord only as "community interest observed out-of-band" if needed;
   do not use private screenshots as evidence.

Stop conditions:

- upstream already has an active PR for the same slice
- the first slice requires schema/runtime changes before maintainers accept the
  vocabulary
- tests require secrets or private environment
- branch accumulates unrelated files

## Next Action

Wait for maintainer signal on PR #19512 and PR #19522 before opening dashboard
or schema follow-ups. If maintainers accept the vocabulary, the next safe slice
is PR C: a small human-readable evidence packet formatter. If maintainers push
back, adapt the field names in docs/tests before adding any new runtime surface.
