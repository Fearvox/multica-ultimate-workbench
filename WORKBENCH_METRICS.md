# Workbench Metrics

This file defines the lightweight metrics contract for the Multica Ultimate Workbench.

The goal is not full observability. The goal is a compact flight recorder that lets the conductor, reviewer, and human distinguish normal agent work from runaway context, missing evidence, or broken routing.

## Flight Recorder

Canonical collector:

```bash
scripts/collect-flight-recorder.sh <issue-id>
```

Optional persistent summary artifacts:

```bash
scripts/collect-flight-recorder.sh <issue-id> --artifact-dir artifacts/flight-recorder/<issue-id>
```

Persistent artifacts must be summaries only. Do not store raw issue descriptions, full comment bodies, full run messages, OAuth material, private tokens, or request payloads.

## RUN_DIGEST Fields

Every digest should include:

- issue id, title, status, assignee
- comments checked
- execution runs checked
- PASS/FLAG/BLOCK marker count
- SDD stage marker count
- checkout evidence count
- visible token usage fields, if exposed by the CLI/API
- max comment length
- max run-message count
- governor flags

## Governor Thresholds

Default thresholds:

| Signal | Default | Meaning |
| --- | ---: | --- |
| `FLIGHT_RECORDER_COMMENT_LIMIT` | 50 | Max comments inspected per issue. |
| `FLIGHT_RECORDER_MAX_RUN_MESSAGES_WARN` | 150 | Flag possible over-read / long execution trace. |
| `FLIGHT_RECORDER_MAX_COMMENT_CHARS_WARN` | 8000 | Flag oversized completion or design comment. |

Thresholds are warning rails, not automatic failure rules. Supervisor decides PASS/FLAG/BLOCK from context.

## Required Review Interpretation

Use the digest as evidence, not as the verdict.

- `BLOCK`: missing runs, impossible evidence path, or unsafe state.
- `FLAG`: failed/cancelled runs, missing final evidence, no verdict marker, oversized trace, or token attribution not visible where expected.
- `PASS`: digest is coherent, evidence exists, and residual risks are named.

## Storage Rules

- Default mode writes no persistent files.
- `--artifact-dir` writes only summary JSON plus `run-digest.md`.
- Raw payloads stay in a temp directory and are deleted on exit.
- Artifacts under `artifacts/flight-recorder/` should stay small and may be pruned after their issue is reflected in `WORKBENCH_LOG.md`.

## Current Baseline

After DAS-14, the workbench should treat token/context discipline as part of normal review:

- role prompts are compressed source-first with `.original.md` backups
- high-frequency skills are attached by role, not globally
- agents should start from compact handoffs before broad reads
- tasks needing repo docs should run `multica repo checkout file:///Users/0xvox/multica-ultimate-workbench`
- completion claims need concrete evidence and a review label

## Curator Metrics

The Skill Curator uses review signals rather than automatic mutation in v1:

- `CATALOG_STATE`: active, stale, archived, or pinned recommendation.
- `OVERLAPS`: repeated instructions across skills or prompts.
- `DRIFT`: mismatch between local source, live skill map, and role prompts.
- `TOKEN_RISK`: normal, elevated, or blocked context impact.
- `PATCH_PLAN`: exact local patch proposal, or `none`.
- `LIVE_SYNC_NEEDED`: yes/no, with explicit targets if yes.

Curator reports are maintenance evidence. They are not permission to delete files, detach live skills, or rewrite live Multica records.
