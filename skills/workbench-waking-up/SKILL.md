---
name: workbench-waking-up
description: Use when an operator asks what changed recently, what was left hanging, what can move now, "gm", "where are we", or when a session-derived update needs to become visible to the whole Workbench. Recall recent memory, verify live repo/issue/automation state, surface drift first, and produce a short evidence-labeled action menu.
---

# Workbench Waking-Up

`workbench-waking-up` is the context-restore protocol for the Multica Ultimate
Workbench.

It pairs with closeout and synthesis work: close the loop with durable evidence,
then wake the system by re-reading memory leads and live state before choosing
what to do next.

Core line:

```text
Restore context. Verify reality. Pick the next move.
```

## When To Use

Use this skill when the operator says or implies:

- `gm`, `maxxedhere`, `where are we`, `what can move now`;
- "最近干了什么", "我们能干什么", "有没有落下没续的";
- "看看最近的记忆", "没聊的时间里更新了什么";
- a direct-chat discovery should become visible to the wider Workbench;
- a session handoff, cron run, Multica issue, repo branch, or runner state may be stale.

Default to the current Workbench repo and project when the target is obvious.
Ask only when there are multiple plausible workspaces and the tool calls would
be materially different.

## Output Contract

Return this shape unless the caller asks for a different format:

```text
GM, operator.

TOPLINE
- state judgment:
- confidence: high | medium | low
- main quest:
- biggest drift:

WHAT CHANGED WHILE YOU WERE AWAY
WE'RE SO BACK
- confirmed landed / verified items
LET HIM COOK
- active runs, agents, cron jobs, or dogfoods
IT'S SO OVER
- blockers, failed jobs, or evidence gaps
DO NOT COOK
- parked, unapproved, dangerous, or explicitly deferred paths

REALITY CHECK
- repo/git:
- automation/cron:
- issues / PRs:
- knowledge/vault:
- runners/skills:

OPEN LOOPS
P0 — must resolve before new work
- ...
P1 — high leverage next
- ...
P2 — useful but not blocking
- ...
PARKED — intentionally not now
- ...

DROPPED THREADS / NOT YET RESUMED
- ...

ACTION MENU
1. ...
2. ...
3. ...

RECEIPTS
- commands, issue IDs, commit IDs, session recalls, and uncertainty labels
```

Use the GM labels lightly. They are shorthand for state, not a substitute for
proof.

## Evidence Labels

Every material claim should be traceable to one of these labels:

- `LIVE_VERIFIED` — checked against current repo, issue, cron, CI, runner, or
  browser state.
- `CONFIRMED` — backed by a durable source file, decision, issue comment, or
  committed artifact.
- `MEMORY_ONLY` — recalled from session memory but not yet live-verified.
- `FLAGGED` — evidence exists but is inconsistent, partial, or blocked.
- `STALE` — prior claim is contradicted by current state or has aged out.

Memory is a lead, not truth. Say `memory suggests` until live readback confirms
it.

## Wake Procedure

### Fast Wake

Use for short orientation prompts.

1. Recall recent sessions or the latest closeout summary.
2. Check current repo root, branch, `git status --short --branch`, and recent
   commits.
3. Check active cron/jobs and obvious Multica issue state if available.
4. Return the top drift and no more than three next actions.

### Standard Wake

Default mode.

1. Search memory for current project, recent open-loop terms, and known runner
   names.
2. Verify repo state: branch, ahead/behind, dirty files, untracked evidence,
   recent commits, and remote freshness.
3. Verify live Workbench surfaces: Multica issue status/runs/comments, cron jobs,
   autopilots, Research Vault or Sanity context if relevant.
4. Verify runner health only when it changes the recommendation: Hermes, Codex,
   `ult-evo`, Capy, MCP, browser/deploy, or remote cell.
5. Collapse findings into P0/P1/P2/PARKED and a short action menu.

### Deep Wake

Use for a full operating review or multi-repo reset. Add targeted issue run
messages, GitHub PR/CI/deploy readbacks, Capy/browser evidence, Research Vault
queries, and sanitized screenshots or artifacts when needed.

## Drift-First Rule

Report drift before proposing new work. P0 drift includes:

- branch ahead/behind or dirty baseline;
- untracked artifacts that might be evidence or noise;
- cron/autopilot fired but downstream delivery failed;
- issue state disagrees with run state;
- `done`, `merged`, `deployed`, or `pushed` claim lacks live readback;
- Research Vault, Sanity, or runner state contradicts the claimed source;
- operator decision is still blocking a parent lane.

Do not bury drift under a motivational recap.

## Session-To-Workbench Bridge

When a direct chat produces a reusable behavior, packaging direction, or policy
change, make it Workbench-visible instead of leaving it hidden in model memory.
Pick the smallest durable surface:

| Durable surface | Use when |
| --- | --- |
| `skills/workbench-*/SKILL.md` | the behavior should be reusable by agents |
| `AGENTS.md` | every agent needs a routing or safety rule |
| `SYNTHESIS.md` | the operating model or strategy changed |
| `DECISIONS.md` | the rationale must survive disagreement |
| `skills/README.md` | the installable skill map changed |
| issue template or autopilot spec | future tasks need a reusable entry point |
| sanitized Multica issue/comment | live operators need immediate coordination |

Do not store secrets, raw transcripts, private screenshots, request payloads, or
live-only credentials. Store sanitized summaries and pointers only.

## Priority Rules

- **P0**: sync drift, failed automation, blocked operator decision, empty or
  contradictory run output, missing proof for claimed completion.
- **P1**: high-leverage review, dogfood gate, bounded issue update, or single
  synthesis step that unblocks a parent lane.
- **P2**: useful cleanup, future packaging, optional product/design slices.
- **PARKED**: explicitly deferred or unapproved routes. Do not revive them
  without new evidence and operator approval.

## Closeout Checklist

Before sending a wake report or bridge patch:

- [ ] Memory leads checked or explicitly unavailable.
- [ ] Live repo/issue/automation state checked when relevant.
- [ ] Drift appears before new ideas.
- [ ] Claims are evidence-labeled.
- [ ] Action menu is capped at three to five moves.
- [ ] Parked decisions remain parked.
- [ ] Public docs contain no secrets, raw transcripts, live-only IDs, or private
      payloads.
