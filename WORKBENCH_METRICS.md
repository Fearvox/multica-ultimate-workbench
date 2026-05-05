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
scripts/collect-flight-recorder.sh <issue-id> --artifact-dir "${TMPDIR:-/tmp}/workbench-flight-recorder/<issue-id>"
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
- visible token, credit, tool-call, and message-count fields, if exposed by the CLI/API
- active run count
- active runs that already contain verdict markers
- duplicate comment body counts
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
- `FLAG`: failed/cancelled runs, active run drift after review handoff, duplicate result comments, missing final evidence, no verdict marker, oversized trace, or token/credit attribution not visible where expected.
- `PASS`: digest is coherent, evidence exists, and residual risks are named.

## Fresh Rerun Interpretation

After Multica 0.2.21, use fresh reruns as a context hygiene tool:

- `PASS`: a rerun starts from the latest compact handoff, cites the prior stale run, and produces coherent evidence.
- `FLAG`: a rerun fixes execution but leaves repo/branch/auth provenance unclear.
- `BLOCK`: repeated reruns inherit the same stale state, wrong repo, missing checkout, or missing evidence publishing.

## Storage Rules

- Default mode writes no persistent files.
- `--artifact-dir` writes only summary JSON plus `run-digest.md`.
- Raw payloads stay in a temp directory and are deleted on exit.
- Artifacts under temp-only flight-recorder directories should stay small and may be pruned after their issue is reflected in `WORKBENCH_LOG.md`.

## Current Baseline

After DAS-14, the workbench should treat token/context discipline as part of normal review:

- role prompts are compressed source-first with `.original.md` backups
- high-frequency skills are attached by role, not globally
- agents should start from compact handoffs before broad reads
- tasks needing repo docs should resolve the `Ultimate Workbench` project-bound GitHub repo resource first; `multica repo checkout file://<LOCAL_WORKBENCH_REPO>` is local-only fallback evidence and must include branch/commit verification
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
