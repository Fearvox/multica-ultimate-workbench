# README + AGENTS Documentation Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the workbench docs into a polished bilingual public README plus a separate agent-facing operations manual, without losing the original badge wall, flat visual style, detailed navigation, or internal workflow requirements.

**Architecture:** `README.md` becomes the public entry surface: flat badge wall, bilingual paired sections, product-level explanation, and jump links into deeper docs. `AGENTS.md` becomes the internal agent operating entrypoint: read order, workflow rules, evidence expectations, and links to the detailed logs/specs. Existing evidence files remain the source of truth; the refresh links to them instead of copying long history into the homepage.

**Tech Stack:** Markdown, Shields.io flat-square badges, existing repository docs, `writing-vault` technical-doc/evidence-binding principles, shell-based validation.

---

## File Structure

- Modify: `/Users/0xvox/multica-ultimate-workbench/README.md`
  - Public GitHub homepage.
  - Bilingual paired sections, not "Chinese first then English later."
  - No internal run IDs, long UUID tables, or流水账.
- Create: `/Users/0xvox/multica-ultimate-workbench/AGENTS.md`
  - Internal agent manual and automatic discovery entrypoint.
  - Includes read order, work rules, SDD protocol, review protocol, flight-recorder use, and safety boundaries.
- Reference only: existing deeper docs
  - `/Users/0xvox/multica-ultimate-workbench/SYNTHESIS.md`
  - `/Users/0xvox/multica-ultimate-workbench/DECISIONS.md`
  - `/Users/0xvox/multica-ultimate-workbench/WORKBENCH_LOG.md`
  - `/Users/0xvox/multica-ultimate-workbench/WORKBENCH_METRICS.md`
  - `/Users/0xvox/multica-ultimate-workbench/skills/README.md`
  - `/Users/0xvox/multica-ultimate-workbench/agents/AGENT_ROSTER.md`

## Non-Negotiable Requirements

- README must keep the original visual ask:
  - flat style
  - badge wall
  - detailed structure
  - jump links
  - bilingual copy
  - high-level feature explanation
- README must not be ordered as "中文在前，英文在后" or the reverse as two detached halves.
- Use paired bilingual sections:
  - heading format: `## What It Is / 它是什么`
  - short English block + short Chinese block in the same section
  - both languages feel first-class
- Internal流水账 belongs in `AGENTS.md` and linked evidence docs, not in README.
- Public README must not reveal new internal IDs, tokens, secrets, OAuth material, or raw run payloads.

## Task 1: Rewrite README as public bilingual homepage

**Files:**
- Modify: `/Users/0xvox/multica-ultimate-workbench/README.md`

- [ ] **Step 1: Replace the current README with a flat public homepage**

Use this exact structure:

```markdown
# Multica Ultimate Workbench

> A bilingual operating system for coordinating Codex, Claude Code, and Hermes inside Multica.
>
> 一个用于在 Multica 中协调 Codex、Claude Code 与 Hermes 的双语工作台操作系统。

[badge wall]

**Language / 语言:** [Overview](#overview--总览) · [Architecture](#architecture--架构) · [Commands](#commands--常用命令) · [Docs](#documentation-map--文档地图)

## Overview / 总览
## Why It Exists / 为什么存在
## Architecture / 架构
## Two-Ring System / 双环系统
## SDD Workflow / 规范驱动开发流程
## Agent + Runtime Model / Agent 与 Runtime 模型
## Workspace Skills / Workspace Skills
## Flight Recorder / Flight Recorder
## Autopilots / 自动巡检
## Commands / 常用命令
## Safety Boundaries / 安全边界
## Documentation Map / 文档地图
## Current Status / 当前状态
```

- [ ] **Step 2: Add badge wall**

Use flat-square Shields badges only. Include stable, non-secret labels:

```markdown
![Status](https://img.shields.io/badge/status-operational-2f855a?style=flat-square)
![Multica](https://img.shields.io/badge/Multica-workbench-111827?style=flat-square)
![Two Ring](https://img.shields.io/badge/system-two--ring-2563eb?style=flat-square)
![SDD](https://img.shields.io/badge/workflow-SDD-7c3aed?style=flat-square)
![Codex](https://img.shields.io/badge/runtime-Codex-111827?style=flat-square)
![Claude Code](https://img.shields.io/badge/runtime-Claude_Code-d97706?style=flat-square)
![Hermes](https://img.shields.io/badge/runtime-Hermes-0f766e?style=flat-square)
![Flight Recorder](https://img.shields.io/badge/observability-flight_recorder-0369a1?style=flat-square)
![Docs](https://img.shields.io/badge/docs-bilingual-475569?style=flat-square)
```

- [ ] **Step 3: Write paired bilingual copy**

Rules:

- Each section gets English and Chinese in the same section.
- English should read like a public technical README.
- Chinese should be natural and concise, not a literal translation.
- Claims must point to deeper repo docs when they need proof.
- Avoid hype words unless anchored by concrete system behavior.

Required content anchors:

- Explain that this repo is the durable operating memory, not a Multica replacement.
- Explain the split between direct chat, issues, mentions, runtimes, skills, and autopilots.
- Explain the Inner Ring / Outer Ring model.
- Explain SDD as `raw requirement -> product design -> technical design -> task list -> execution/review`.
- Explain that Codex / Claude Code / Hermes are coordinated by role, not randomly spawned.
- Explain workspace skills as shared operating grammar.
- Explain Flight Recorder as compact `RUN_DIGEST`, not full telemetry.
- Include commands:

```bash
./scripts/list-workbench-state.sh
./scripts/collect-flight-recorder.sh <issue-id>
./scripts/generate-create-commands.sh
```

- Clearly mark:

```text
Human approval is required before create-pilot-agent.sh or create-agent-roster.sh.
```

- [ ] **Step 4: Add Documentation Map**

Use a compact table with these links:

```markdown
| Need | File |
| --- | --- |
| Agent operating manual | [AGENTS.md](AGENTS.md) |
| Current strategy and architecture | [SYNTHESIS.md](SYNTHESIS.md) |
| Decision log | [DECISIONS.md](DECISIONS.md) |
| Historical rollout log | [WORKBENCH_LOG.md](WORKBENCH_LOG.md) |
| Flight recorder contract | [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) |
| Workspace skill map | [skills/README.md](skills/README.md) |
| Agent roster | [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) |
```

- [ ] **Step 5: Self-check README scope**

Verify README does not contain:

- live workspace ID
- runtime UUIDs
- agent UUID tables
- run IDs
- comment IDs
- private token patterns
- long historical entries from `WORKBENCH_LOG.md`

## Task 2: Create AGENTS.md as internal agent manual

**Files:**
- Create: `/Users/0xvox/multica-ultimate-workbench/AGENTS.md`

- [ ] **Step 1: Add purpose and read order**

Create `AGENTS.md` with this top-level structure:

```markdown
# AGENTS.md

Guidance for agents working in this repository.

## Read Order
## Repository Role
## Operating Rules
## Workbench Workflow
## SDD Protocol
## Review Protocol
## Flight Recorder Protocol
## File Map
## Safety Boundaries
## Validation Commands
```

Read order must be:

1. `README.md`
2. `SYNTHESIS.md`
3. `DECISIONS.md`
4. `WORKBENCH_METRICS.md`
5. `skills/README.md`
6. `agents/AGENT_ROSTER.md`
7. `WORKBENCH_LOG.md` only when historical evidence is needed

- [ ] **Step 2: Add operating rules**

Include these exact rules in plain language:

- Do not modify Multica daemon, Desktop UI, or core runtime unless explicitly asked.
- Do not store secrets, OAuth material, private tokens, raw request payloads, or raw run transcripts.
- Do not claim completion without evidence.
- Run `multica repo checkout file:///Users/0xvox/multica-ultimate-workbench` before making claims about repo-local files from a Multica runtime.
- Use `scripts/collect-flight-recorder.sh <issue-id>` for review summaries when relevant.
- Autopilots create issues; they do not silently perform high-risk work.
- Outer Ring agents do not assign work to each other.
- Preserve `Workbench Max` unless the human explicitly asks to modify it.

- [ ] **Step 3: Add protocol summaries**

Add concise, agent-usable summaries:

- Two-Ring:
  - Inner Ring: Admin, Supervisor, Synthesizer.
  - Outer Ring: bounded specialist execution/research/review/docs/ops.
- SDD:
  - `Raw Requirement`
  - `Product Design`
  - `Technical Design`
  - `Task List`
  - `Execution And Verification`
- Review:
  - End with exact `PASS`, `FLAG`, or `BLOCK`.
  - Use `What was verified / Evidence or proposed evidence / Residual risk / Next action` when requested.
- Flight Recorder:
  - Default stdout only.
  - Optional artifact mode writes summaries only.
  - Token fields may be absent from Multica CLI run JSON; treat that as an INFO residual risk, not proof of no usage.

- [ ] **Step 4: Add file map**

Include a compact file map. Do not copy long contents from child docs.

## Task 3: Validate docs

**Files:**
- Validate: `/Users/0xvox/multica-ultimate-workbench/README.md`
- Validate: `/Users/0xvox/multica-ultimate-workbench/AGENTS.md`

- [ ] **Step 1: Check git diff**

Run:

```bash
git diff -- README.md AGENTS.md
```

Expected:

- README has polished public homepage shape.
- AGENTS.md exists and contains internal operating rules.
- No unrelated files changed.

- [ ] **Step 2: Check links exist**

Run:

```bash
for path in AGENTS.md SYNTHESIS.md DECISIONS.md WORKBENCH_LOG.md WORKBENCH_METRICS.md skills/README.md agents/AGENT_ROSTER.md; do
  test -f "$path" || exit 1
done
echo "link-targets-ok"
```

Expected:

```text
link-targets-ok
```

- [ ] **Step 3: Scan for sensitive patterns**

Run:

```bash
(rg -n -i 'sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Authorization:[[:space:]]*Bearer|api[_-]?key|oauth|private token' README.md AGENTS.md || true)
```

Expected:

- No real secret values.
- Generic safety phrases like `private token` are acceptable only in safety rules.

- [ ] **Step 4: Check public README does not expose internal IDs**

Run:

```bash
(rg -n '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|run `|comment `' README.md || true)
```

Expected:

- No output.

- [ ] **Step 5: Commit and push**

Run:

```bash
git status --short
git add README.md AGENTS.md
git commit -m "docs: refresh bilingual readme and agent guide"
git push origin main
```

Expected:

- Commit succeeds.
- Push succeeds.
- `git status --short --branch` shows `main...origin/main` clean.

## Self-Review Checklist

- Spec coverage:
  - Badge wall preserved.
  - Flat README style preserved.
  - Detailed jump navigation preserved.
  - Bilingual requirement preserved.
  - README no longer uses "中文在前英文在后" detached ordering.
  - Internal流水账 moved to agent-facing doc surface.
- Placeholder scan:
  - No `TBD`, `TODO`, `fill in later`, or vague "add appropriate..." instructions.
- Scope:
  - Docs only.
  - No Multica live state mutation.
  - No new assets.
  - No README-zh duplication.
