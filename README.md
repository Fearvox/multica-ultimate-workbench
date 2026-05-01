# Multica Ultimate Workbench

> A durable operating memory layer for coordinating Codex, Claude Code, and Hermes agents on top of Multica.

[![Status](https://img.shields.io/badge/status-operational-2f855a?style=flat-square)](WORKBENCH_LOG.md)
[![Multica](https://img.shields.io/badge/Multica-0.2.22-111827?style=flat-square)](https://github.com/Fearvox/multica-ultimate-workbench)
[![Two Ring](https://img.shields.io/badge/system-two--ring-2563eb?style=flat-square)](#two-ring-system)
[![SDD](https://img.shields.io/badge/workflow-SDD-7c3aed?style=flat-square)](#sdd-workflow)
[![Goal Mode](https://img.shields.io/badge/workflow-goal_mode-0f766e?style=flat-square)](#goal-mode)
[![Codex](https://img.shields.io/badge/runtime-Codex-111827?style=flat-square)](agents/AGENT_ROSTER.md)
[![Claude Code](https://img.shields.io/badge/runtime-Claude_Code-d97706?style=flat-square)](agents/AGENT_ROSTER.md)
[![Hermes](https://img.shields.io/badge/runtime-Hermes-0f766e?style=flat-square)](agents/AGENT_ROSTER.md)
[![Flight Recorder](https://img.shields.io/badge/observability-flight_recorder-0369a1?style=flat-square)](docs/flight-recorder.md)
[![Curator](https://img.shields.io/badge/maintenance-skill_curator-9333ea?style=flat-square)](docs/skill-curator.md)
[![Docs](https://img.shields.io/badge/docs-bilingual-475569?style=flat-square)](#documentation-map)

**Jump to:** [Overview](#overview) · [Architecture](#architecture) · [Two-Ring System](#two-ring-system) · [SDD](#sdd-workflow) · [Goal Mode](#goal-mode) · [Runtime Model](#agent-runtime-model) · [Commands](#commands) · [Docs](#documentation-map) · [中文总览](#中文总览)

## Overview

Multica Ultimate Workbench is the durable operating memory for a multi-agent workbench built on top of Multica. Multica remains the live collaboration layer for agents, issues, comments, direct chat, runtimes, skills, and autopilots. This repository preserves the operating model around that layer — roles, decisions, templates, safety rules, verification scripts, and review discipline — in Git, where it can be versioned, diffed, and audited independently of the live workspace.

## Why It Exists

Agent collaboration gains power from structure. Direct chat is good for fuzzy thought; real execution needs owners, evidence, review gates, and memory that survives the session. This repo provides those rails without modifying Multica's daemon, Desktop UI, or core runtime. It is the workbench's long-term memory — the part that persists when chat scrolls away.

## Architecture

The workbench separates live execution from durable operating memory:

| Layer | Owns | Source |
| --- | --- | --- |
| Multica | Live agents, issues, comments, runtimes, skills, autopilots | Multica workspace |
| This repo | Strategy, roles, templates, review rules, logs, helper scripts | Git |
| Human operator | Scope, approval, taste, final judgment | You |

## Two-Ring System

The system uses two rings instead of a flat swarm to keep agent coordination manageable.

| Ring | Role | Job |
| --- | --- | --- |
| Inner Ring | Admin, Supervisor, Synthesizer | Turn fuzzy work into issues, review evidence, keep memory coherent. |
| Outer Ring | Developer, Researcher, Architect, Docs, QA, Ops, Curator | Execute bounded specialist work without taking over routing. |

See [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) for the full role map and ring assignments.

## SDD Workflow

Non-trivial work follows Specification-Driven Development:

```text
raw requirement → product design → technical design → task list → execution/review
```

Each stage is recorded as a structured issue comment. Issue status stays coarse-grained; the detailed workflow lives in comments and review labels.

## Goal Mode

Goal Mode is the workbench wrapper for `/goal` tasks: the assigned owner locks the objective, keeps it alive across turns and reruns, and does not claim completion until the relevant build, test, smoke, docs/report, git-status, and evidence gates are addressed.

It is not a permission override. Destructive actions, credentials, public/private boundary changes, and live runtime mutations still require the normal approval and Supervisor review path.

See [skills/workbench-goal-mode.md](skills/workbench-goal-mode.md).

## Agent + Runtime Model

Codex, Claude Code, and Hermes are assigned by role, not treated as interchangeable text boxes:

| Runtime family | Typical use |
| --- | --- |
| Codex | Implementation, review, QA, ops checks, risk control. |
| Claude Code | Architecture, documentation, planning, admin synthesis. |
| Hermes | Research, memory synthesis, broader context digestion. |

## Workspace Skills

Workspace skills are the shared grammar of the workbench. They make high-frequency behavior explicit — SDD, conductor routing, research, implementation, review, docs release, browser proofshot QA, token/context discipline, and memory synthesis.

See [skills/README.md](skills/README.md) for the live skill map and attachment design.

## Multica 0.2.22 Platform

Multica 0.2.22 provides the platform surfaces the workbench builds on: project-bound repos, Quick Capture intake, fresh reruns, Mermaid rendering, per-agent model config, and safer custom env handling. The workbench uses these as routing and evidence rails — they extend what the workbench can do, but do not replace SDD or Supervisor review.

```mermaid
flowchart LR
  A["Quick Capture / raw request"] --> B["Project-bound repo"]
  B --> C["SDD handoff"]
  C --> D["Owner execution"]
  D --> E["Evidence artifact"]
  E --> F["Supervisor verdict"]
```

See [docs/multica-021-workflow.md](docs/multica-021-workflow.md) for the platform capability map.

## Flight Recorder

The flight recorder produces a compact issue-level digest — metadata, comments, runs, verdict markers, checkout evidence, and run-message counts — as a `RUN_DIGEST`. It is not full telemetry and does not persist raw payloads by default.

```bash
./scripts/collect-flight-recorder.sh <issue-id>
```

See [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) and [docs/flight-recorder.md](docs/flight-recorder.md).

## Capy VM Lane

A controlled VM/Computer execution path for GUI, browser, sandbox, and screenshot-backed tasks. It does not replace Multica routing or Supervisor review; it gives assigned agents a disposable execution cell when shell-only work is insufficient.

```bash
./scripts/vm-smoke.sh
```

See [docs/capy-vm-lane.md](docs/capy-vm-lane.md).

## Skill Curator

The maintenance protocol for keeping workbench skills useful over time. It reviews stale skills, overlapping instructions, role-binding drift, token/context risk, and recoverable archive candidates. Version 1 is review-only — it proposes changes through issues instead of silently deleting or rewriting skills.

See [docs/skill-curator.md](docs/skill-curator.md) and [issue-templates/curator-review.md](issue-templates/curator-review.md).

## Autopilots

Autopilots create issues for recurring checks — daily health, auto-review sweeps, dependency review, stale-memory checks, skill-curator checks, benchmark-artifact checks. They are scheduled entry points into the review pipeline; they do not silently execute high-risk work.

See [autopilots/daily-health.md](autopilots/daily-health.md) and [autopilots/auto-review-sweeper.md](autopilots/auto-review-sweeper.md).

## Commands

Read-only helpers (safe to run anytime):

```bash
./scripts/list-workbench-state.sh
./scripts/collect-flight-recorder.sh <issue-id>
```

Source regeneration:

```bash
./scripts/generate-create-commands.sh
```

Human approval required before running:

```bash
./scripts/create-pilot-agent.sh
./scripts/create-agent-roster.sh
```

## Documentation Map

| Need | File |
| --- | --- |
| Agent operating manual | [AGENTS.md](AGENTS.md) |
| Current strategy and architecture | [SYNTHESIS.md](SYNTHESIS.md) |
| Decision log | [DECISIONS.md](DECISIONS.md) |
| Historical rollout log | [WORKBENCH_LOG.md](WORKBENCH_LOG.md) |
| Flight recorder contract | [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) |
| Goal-persistence contract | [skills/workbench-goal-mode.md](skills/workbench-goal-mode.md) |
| VM execution lane | [docs/capy-vm-lane.md](docs/capy-vm-lane.md) |
| Platform workflow (0.2.22) | [docs/multica-021-workflow.md](docs/multica-021-workflow.md) |
| Skill curator protocol | [docs/skill-curator.md](docs/skill-curator.md) |
| Workspace skill map | [skills/README.md](skills/README.md) |
| Agent roster | [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) |
| Remote agent cell (NYC) | [agents/remote/nyc-remote-agents.md](agents/remote/nyc-remote-agents.md) |
| Issue templates | [issue-templates/](issue-templates/) |
| Autopilots | [autopilots/](autopilots/) |

## Safety Boundaries

The workbench is intentionally conservative:

- It does **not** replace Multica.
- It does **not** modify Multica daemon, Desktop UI, or core runtime.
- It does **not** store secrets, credential material, raw request payloads, or raw run transcripts.
- No agent may claim done without evidence.
- Outer Ring agents do not assign work to each other.
- Autopilots create issues; they do not silently execute high-risk work.

---

## 中文总览

Multica Ultimate Workbench 是建立在 Multica 之上的多 agent 工作台持久记忆层。Multica 负责实时协作（agents、issues、comments、direct chat、runtimes、skills、autopilots），本仓库负责沉淀协作方式（角色、决策、模板、安全边界、验证脚本和 review 纪律），以 Git 版本化管理，独立于 live workspace。

### 核心概念

| 概念 | 说明 | 详见 |
| --- | --- | --- |
| 双环系统 | Inner Ring（Admin/Supervisor/Synthesizer）负责任务拆解与审核；Outer Ring 执行边界清楚的专项任务 | [AGENT_ROSTER](agents/AGENT_ROSTER.md) |
| SDD 流程 | 原始需求 → 产品设计 → 技术设计 → 任务列表 → 执行/复核，每阶段作为 issue comment 留痕 | [SYNTHESIS](SYNTHESIS.md) |
| Goal Mode | `/goal` 任务的目标保活协议：锁定目标、持续推进、按 build/test/smoke/docs/report/git-status/evidence gate 收尾 | [workbench-goal-mode](skills/workbench-goal-mode.md) |
| Runtime 分工 | Codex（实现/审查）、Claude Code（架构/文档/规划）、Hermes（研究/记忆整理） | [AGENT_ROSTER](agents/AGENT_ROSTER.md) |
| Workspace Skills | 共享语法，固化 SDD、routing、review、proofshot QA、token discipline、memory synthesis 等高频行为 | [skills/README](skills/README.md) |
| Flight Recorder | Issue 级轻量摘要，输出 RUN_DIGEST，不做完整 telemetry | [flight-recorder](docs/flight-recorder.md) |
| Capy VM Lane | 受控 VM 执行通道，处理 GUI/浏览器/沙盒任务 | [capy-vm-lane](docs/capy-vm-lane.md) |
| Skill Curator | Skill 维护协议，v1 只 review 不静默修改 | [skill-curator](docs/skill-curator.md) |
| Autopilots | 定期创建检查 issue，不静默执行高风险操作 | [autopilots/](autopilots/) |

### 安全边界

- 不替代 Multica，不修改其 daemon、Desktop UI 或 core runtime。
- 不存储 secrets、credential、raw payloads 或 raw run transcripts。
- 没有证据不能 claim done。
- Outer Ring agents 不互相派活。
- Autopilots 只创建 issue，不静默执行高风险任务。

### 当前状态

工作台已具备：经过验证的双环 roster、高频 workspace skill pack、source-first prompt compression、daily health autopilot、automatic review sweeper、通过 live QA/Supervisor review 的 flight recorder、skill curator protocol、受控 VM lane、Multica 0.2.22 project-bound repo anchor、在线 NYC remote execution cell。

当前事实看 [SYNTHESIS.md](SYNTHESIS.md)，历史流水账看 [WORKBENCH_LOG.md](WORKBENCH_LOG.md)。
