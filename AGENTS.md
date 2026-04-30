# AGENTS.md

Guidance for agents working in this repository.

This file is the internal operating manual. The public overview lives in [README.md](README.md). Do not turn the README into a run log; keep operational evidence in the files listed below.

## Read Order

Read only as deep as the task requires:

1. [README.md](README.md) - public overview and navigation.
2. [SYNTHESIS.md](SYNTHESIS.md) - current strategy, architecture, risks, and live operating model.
3. [DECISIONS.md](DECISIONS.md) - durable decisions and rationale.
4. [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) - flight recorder and token/context review contract.
5. [skills/README.md](skills/README.md) - workspace skill map and attachments.
6. [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) - role and runtime expectations.
7. [WORKBENCH_LOG.md](WORKBENCH_LOG.md) - historical evidence only when needed.

## Repository Role

This repository is the durable operating memory for the Multica Ultimate Workbench. Multica owns live collaboration: agents, issues, comments, direct chat, runtimes, skills, and autopilots. This repo owns the reviewable source of truth around that live layer: role definitions, templates, safety rules, decisions, helper scripts, and synthesis.

Do not treat this repo as the Multica runtime itself.

## Operating Rules

- Do not modify Multica daemon, Desktop UI, or core runtime unless the human explicitly asks.
- Do not store secrets, OAuth material, private tokens, raw request payloads, or raw run transcripts.
- Do not claim completion without evidence.
- Run `multica repo checkout file:///Users/0xvox/multica-ultimate-workbench` before making claims about repo-local files from a Multica runtime.
- Use `scripts/collect-flight-recorder.sh <issue-id>` for review summaries when relevant.
- Autopilots create issues; they do not silently perform high-risk work.
- Outer Ring agents do not assign work to each other.
- Preserve `Workbench Max` unless the human explicitly asks to modify it.
- Prefer compact handoffs before broad history reads.
- Keep public-facing docs clean; put internal run evidence in `WORKBENCH_LOG.md` or linked review comments.

## Workbench Workflow

Use the two-ring model.

| Ring | Roles | Behavior |
| --- | --- | --- |
| Inner Ring | Workbench Admin, Workbench Supervisor, Workbench Synthesizer | Route work, review evidence, preserve memory, and keep the system coherent. |
| Outer Ring | Developer, Researcher, Architect, Docs, QA, Ops, Curator | Execute bounded specialist work. Do not take over orchestration unless assigned. |

Direct chat is for fuzzy thought. Issues are for executable work. Mentions are for narrow review or advice. Autopilots create recurring review issues.

## SDD Protocol

For non-trivial work, use the SDD comment pipeline:

```text
Raw Requirement -> Product Design -> Technical Design -> Task List -> Execution And Verification
```

Rules:

- Keep issue statuses coarse: `todo`, `in_progress`, `in_review`, `done`, `blocked`.
- Put stage detail in structured comments, not custom statuses.
- Start from compact handoffs and exact evidence IDs before reading full history.
- Use [issue-templates/sdd-workflow.md](issue-templates/sdd-workflow.md) when the work needs the full SDD path.
- Quick fixes may bypass full SDD only when the risk is low and the evidence path is still clear.

## Review Protocol

Reviewer output must be evidence-backed.

- End with exact `PASS`, `FLAG`, or `BLOCK` when the issue asks for a review verdict.
- If the task asks for a scaffold, use: `What was verified / Evidence or proposed evidence / Residual risk / Next action`.
- `PASS` means the goal is achieved and residual risk is acceptable.
- `FLAG` means the path is usable but has a concrete risk or missing proof.
- `BLOCK` means the work should not proceed or close.
- Do not accept a done claim that lacks commands, files, IDs, screenshots, logs, or other concrete evidence.

## Flight Recorder Protocol

Use the flight recorder for compact issue review:

```bash
scripts/collect-flight-recorder.sh <issue-id>
```

Default mode prints `RUN_DIGEST` to stdout and writes no persistent files.

Optional artifact mode:

```bash
scripts/collect-flight-recorder.sh <issue-id> --artifact-dir artifacts/flight-recorder/<issue-id>
```

Artifact mode writes summary files only. Do not store raw issue descriptions, full comment bodies, run-message transcripts, screenshots, traces, OAuth material, private tokens, or request payloads.

Token fields may be absent from Multica CLI run JSON. Treat that as an INFO residual risk and use UI/API billing evidence when quota attribution matters.

## File Map

| Need | File |
| --- | --- |
| Public project overview | [README.md](README.md) |
| Current architecture and strategy | [SYNTHESIS.md](SYNTHESIS.md) |
| Durable decisions | [DECISIONS.md](DECISIONS.md) |
| Rollout history | [WORKBENCH_LOG.md](WORKBENCH_LOG.md) |
| Flight recorder contract | [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) |
| Flight recorder usage | [docs/flight-recorder.md](docs/flight-recorder.md) |
| Agent roster | [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) |
| Workspace skills | [skills/README.md](skills/README.md) |
| Issue templates | [issue-templates/](issue-templates/) |
| Autopilot specs | [autopilots/](autopilots/) |
| Helper scripts | [scripts/](scripts/) |

## Safety Boundaries

- No destructive cleanup without explicit human confirmation.
- No hidden live-state mutation during read-only verification.
- No broad refactor when a small doc or script patch solves the task.
- No rewriting working routes, autopilots, or agent bindings casually.
- No copying secrets or raw payloads into durable docs.
- No deleting evidence artifacts unless the task explicitly asks for cleanup and the evidence has a preserved summary.

## Validation Commands

Run these before closing documentation changes:

```bash
git diff -- README.md AGENTS.md
```

```bash
for path in AGENTS.md SYNTHESIS.md DECISIONS.md WORKBENCH_LOG.md WORKBENCH_METRICS.md skills/README.md agents/AGENT_ROSTER.md; do
  test -f "$path" || exit 1
done
echo "link-targets-ok"
```

```bash
(rg -n -i 'sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Authorization:[[:space:]]*Bearer|api[_-]?key|oauth|private token' README.md AGENTS.md || true)
```

```bash
(rg -n '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|run `|comment `' README.md || true)
```

Expected:

- Link targets exist.
- README exposes no internal UUIDs, run IDs, comment IDs, private tokens, or long history.
- AGENTS.md may contain generic safety terms such as `OAuth material` or `private tokens`, but no real secret values.
