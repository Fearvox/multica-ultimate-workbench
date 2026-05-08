---
name: workbench-capy-git-dialogue-guardrails
description: Source-first, self-loop resistant guardrails for Capy GitHub dialogue responders before any write-capable PR, issue, or review action.
---

# Workbench Capy Git Dialogue Guardrails

Use this skill when implementing, reviewing, or dogfooding the Capy Git
Dialogue Responder, especially for `SYN-31`, GitHub webhook responder work,
Capy-authored PR/comment loops, or any task that could let Capy write back to a
GitHub, Linear, or Slack surface.

This skill is source-layer only. It does not deploy Capy, enable webhooks, write
Linear, post Slack, or mutate live OAuth/runtime state.

## Read First

1. `DECISIONS.md` entry `2026-05-06 - Add Self-Loop Guardrails To The Capy Git Dialogue Responder`
2. `docs/capy-git-dialogue-responder.md`
3. `.capy/CAPTAIN.md`, `.capy/BUILD.md`, and `.capy/REVIEW.md` when checking a repo-local Capy pack
4. `autopilots/capy-linear-slack-sync.md` only when Linear/Slack sync is in scope

## Required Gate

Before any write-capable action, compute this block from source evidence:

```text
CAPY_GIT_DIALOGUE_GUARDRAIL
event_author:
actor_classification:
human_request_present:
last_capy_commit_sha:
last_capy_comment_ids:
mutation_allowed:
circuit_breaker_state:
action_taken:
verdict: PASS | FLAG | BLOCK
```

Use the local dogfood helper for bounded fixture checks:

```bash
node scripts/capy-git-dialogue-guardrail.mjs --format json <event-summary.json>
node scripts/test-capy-git-dialogue-guardrail.mjs
```

## Mutation Rules

- Capy-authored comments, review comments, reviews, closeouts, commits, and
  synchronize events are observation only unless a human explicitly asks Capy to
  continue in that exact thread or after that exact commit.
- The automatic patch budget is one patch attempt per PR per distinct
  human-authored review-finding batch.
- Commit/comment/review churn from Capy itself is `FLAG` plus operator approval,
  not another patch loop.
- Duplicate closeout for the same repo, PR, head SHA, and verdict tuple is a
  no-op.
- Webhook receipt is not proof of repo state; verify PR, check, review, and git
  state from primary evidence.

## Verdicts

- `PASS`: mutation is allowed by a current human request and the patch budget is
  still available, or the action is read-only observation.
- `FLAG`: mutation is refused because the trigger is self-authored, the patch
  budget is exhausted, or Capy churn requires operator approval.
- `BLOCK`: the event summary is malformed or primary source identity cannot be
  established.

## Closeout

```text
CHANGED:
VERIFIED:
REMAINING:
PRS / LINKS:
VERDICT: PASS | FLAG | BLOCK
```

Do not claim live rollout. Source-layer `PASS` only means the guardrail source
and dogfood fixtures passed.
