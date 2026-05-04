# Workbench Skill Curator

The Workbench Skill Curator is a maintenance protocol for keeping local and live workbench skills useful, compact, and recoverable.

It is inspired by the Hermes Curator model: usage-aware maintenance, `active -> stale -> archived` lifecycle, pinned skills, recoverable archival, and per-run reports. The workbench version is intentionally conservative. It does not auto-delete skills or mutate live Multica skill bindings without an issue, evidence, and review.

Reference: [Hermes Agent Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator).

## Why It Exists

Skills are powerful because they make repeated behavior explicit. They also decay.

Common failure modes:

- near-duplicate skills accumulate;
- old skills keep being attached because nobody wants to remove them;
- role prompts and skill files drift apart;
- a useful hand-authored skill gets overwritten by a maintenance pass;
- agents waste context loading skills that do not matter for the current role.

The curator turns this into a reviewable maintenance loop instead of a silent cleanup job.

## Scope

In scope:

- local workbench skill source under `skills/`;
- local role prompts under `agents/`;
- workspace skill attachment maps recorded in `skills/README.md`;
- autopilot and issue-template wording that affects skill use;
- reports that summarize stale, overlapping, or risky skill state.

Out of scope:

- Multica daemon, Desktop UI, or core runtime changes;
- automatic deletion of local files;
- automatic live skill edits without a review issue;
- changes to preserved agents such as `Workbench Max` unless the human explicitly asks.

## Lifecycle

| State | Meaning | Allowed action |
| --- | --- | --- |
| `active` | Used by a current role or workflow. | Keep, patch, or pin. |
| `stale` | Not recently used, duplicated, or superseded. | Propose patch, merge, detach, or archive. |
| `archived` | Removed from active source/binding path but kept recoverable. | Restore if a concrete task needs it. |
| `pinned` | Must not be auto-transitioned or rewritten by agents. | Human-approved edits only. |

The first workbench implementation should treat this table as review vocabulary, not as an automated filesystem state machine.

## Staleness Indicators

Use objective indicators before calling a skill stale. One weak signal is not enough.

Candidate stale signals:

- no current agent binding in `skills/README.md`;
- no issue, decision, or synthesis reference in the last 30 days of `WORKBENCH_LOG.md` or `DECISIONS.md`;
- duplicated purpose with another active skill;
- superseded by a newer skill or autopilot protocol;
- repeated token/context complaints with little role-specific value.

Default rule:

- `0-1` signals: keep active.
- `2` signals: mark `FLAG` and propose a small patch or binding review.
- `3+` signals: propose stale classification, but do not delete, detach, or archive without explicit human approval and Supervisor review.

Pinned items, safety protocols, review protocols, and `Workbench Max` related records cannot be auto-transitioned even if they match stale signals.

## Curator Inputs

A curator pass may inspect:

- `skills/README.md` for the intended skill catalog and attachment map;
- `skills/*.md` for local source;
- `agents/**/*.md` for role prompts and preserved original backups;
- `SYNTHESIS.md`, `DECISIONS.md`, and recent `WORKBENCH_LOG.md` entries for current strategy;
- live `multica skill list` and `multica agent skills list` output only when the issue explicitly requests live verification.

Start from indexes and summaries. Do not dump full live payloads into durable docs.
If the curator recommends a public skill-map, install-instruction, or
Hermes-facing role change, route the Claude-authored patch through
`skills/workbench-hermes-docs-sync/SKILL.md` before live sync.

## Review Output

Every curator issue should produce:

- `CATALOG_STATE`: active/stale/archive/pin recommendations.
- `OVERLAPS`: skills or prompts that repeat the same operating rule.
- `DRIFT`: differences between local source, live skill map, and agent prompts.
- `TOKEN_RISK`: skills or bindings that inflate context without role value.
- `PATCH_PLAN`: exact local files to change, or `none`.
- `LIVE_SYNC_NEEDED`: yes/no, with target skills or agents if yes.
- `RESIDUAL_RISK`: what remains uncertain.

End with `PASS`, `FLAG`, or `BLOCK`.

## Pinning Rules

Pinned means "do not silently rewrite."

Use pinned treatment for:

- hand-authored canonical skills;
- safety and review protocols;
- role prompts that are currently live-synced;
- preserved companion agents such as `Workbench Max`.

If a pinned item looks wrong, the curator should recommend a human-approved patch issue rather than editing it directly.

## Archival Rules

Archival must be recoverable.

For source files, prefer one of:

- leave active file untouched and mark stale in the curator report;
- move only after explicit human approval;
- preserve original content in a named backup or archive path;
- record the reason in `WORKBENCH_LOG.md`.

For live Multica skills, do not delete during the first curator iteration. Propose detach/archive actions as issue comments and require Supervisor review.

## Suggested Cadence

- Run manually after large skill-pack changes.
- Run weekly through an autopilot-created issue if the workspace is active.
- Run after prompt compression or live skill sync.
- Skip if the workbench has been idle and no skill/prompt files changed.

## First Implementation Boundary

Version 1 is a review protocol, not an autonomous janitor.

It may:

- create a curator issue;
- inspect local source and live skill maps;
- write a report;
- propose patches;
- verify that no raw payloads or secrets are stored.

It must not:

- delete skills automatically;
- rewrite live skills automatically;
- detach skills from agents without explicit approval;
- mutate Multica core runtime.
