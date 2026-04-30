# Multica Ultimate Workbench

> A bilingual operating system for coordinating Codex, Claude Code, and Hermes inside Multica.
>
> 一个用于在 Multica 中协调 Codex、Claude Code 与 Hermes 的双语工作台操作系统。

![Status](https://img.shields.io/badge/status-operational-2f855a?style=flat-square)
![Multica](https://img.shields.io/badge/Multica-workbench-111827?style=flat-square)
![Two Ring](https://img.shields.io/badge/system-two--ring-2563eb?style=flat-square)
![SDD](https://img.shields.io/badge/workflow-SDD-7c3aed?style=flat-square)
![Codex](https://img.shields.io/badge/runtime-Codex-111827?style=flat-square)
![Claude Code](https://img.shields.io/badge/runtime-Claude_Code-d97706?style=flat-square)
![Hermes](https://img.shields.io/badge/runtime-Hermes-0f766e?style=flat-square)
![Flight Recorder](https://img.shields.io/badge/observability-flight_recorder-0369a1?style=flat-square)
![Curator](https://img.shields.io/badge/maintenance-skill_curator-9333ea?style=flat-square)
![Docs](https://img.shields.io/badge/docs-bilingual-475569?style=flat-square)

**Jump / 跳转:** [Overview](#overview--总览) · [Architecture](#architecture--架构) · [SDD](#sdd-workflow--规范驱动开发流程) · [Commands](#commands--常用命令) · [Docs](#documentation-map--文档地图)

## Overview / 总览

Multica Ultimate Workbench is the durable operating memory for a multi-agent workbench built on top of Multica. Multica remains the live collaboration layer for agents, issues, comments, direct chat, runtimes, skills, and autopilots. This repository preserves the operating model around that layer: roles, decisions, templates, safety rules, verification scripts, and review discipline.

Multica Ultimate Workbench 是建立在 Multica 之上的多 agent 工作台记忆层。Multica 继续负责实时协作：agents、issues、comments、direct chat、runtimes、skills、autopilots。这个仓库负责沉淀那套协作方式：角色、决策、模板、安全边界、验证脚本和 review 纪律。

## Why It Exists / 为什么存在

Agent collaboration gets powerful only when the work has shape. Direct chat is good for fuzzy thought, but real work needs owners, evidence, review gates, and memory that survives the session. This repo gives the workbench those rails without modifying Multica's daemon, Desktop UI, or core runtime.

Agent 协作真正有用，不是因为 agent 多，而是因为工作有形状。Direct chat 适合模糊思考；真正执行需要 owner、证据、review gate，以及能跨 session 保留下来的记忆。这个仓库给工作台加上这些轨道，但不改 Multica 的 daemon、Desktop UI 或 core runtime。

## Architecture / 架构

The workbench separates live execution from durable operating memory:

| Layer | Owns | Source |
| --- | --- | --- |
| Multica | Live agents, issues, comments, runtimes, skills, autopilots | Multica workspace |
| This repo | Strategy, roles, templates, review rules, logs, helper scripts | Git |
| Human operator | Scope, approval, taste, final judgment | You |

工作台把实时执行和持久记忆拆开：

| 层 | 负责什么 | 来源 |
| --- | --- | --- |
| Multica | live agents、issues、comments、runtimes、skills、autopilots | Multica workspace |
| 本仓库 | 策略、角色、模板、review 规则、日志、辅助脚本 | Git |
| Human operator | 范围、审批、审美、最终判断 | 你 |

## Two-Ring System / 双环系统

The system uses two rings instead of a flat swarm.

| Ring | Role | Job |
| --- | --- | --- |
| Inner Ring | Admin, Supervisor, Synthesizer | Turn fuzzy work into issues, review evidence, keep memory coherent. |
| Outer Ring | Developer, Researcher, Architect, Docs, QA, Ops, Curator | Execute bounded specialist work without taking over routing. |

双环系统避免 agent swarm 变成一锅粥。

| 环 | 角色 | 任务 |
| --- | --- | --- |
| Inner Ring | Admin、Supervisor、Synthesizer | 把模糊需求变成 issue，审核证据，维护系统记忆。 |
| Outer Ring | Developer、Researcher、Architect、Docs、QA、Ops、Curator | 执行边界清楚的专项任务，不接管调度权。 |

## SDD Workflow / 规范驱动开发流程

Non-trivial work follows a Specification-Driven Development path:

```text
raw requirement -> product design -> technical design -> task list -> execution/review
```

Each stage is recorded as a structured issue comment. Status stays simple; the detailed workflow lives in the comments and review labels.

复杂工作走 SDD，也就是规范驱动开发：

```text
原始需求 -> 产品设计 -> 技术设计 -> 任务列表 -> 执行/复核
```

每个阶段作为结构化 issue comment 留痕。Issue status 保持粗粒度；真正的阶段信息放在 comment 和 review label 里。

## Agent + Runtime Model / Agent 与 Runtime 模型

Codex, Claude Code, and Hermes are not treated as interchangeable text boxes. They are assigned by role:

| Runtime family | Typical use |
| --- | --- |
| Codex | Implementation, review, QA, ops checks, risk control. |
| Claude Code | Architecture, documentation, planning, admin synthesis. |
| Hermes | Research, memory synthesis, broader context digestion. |

Codex、Claude Code 和 Hermes 不是随机替换的模型入口，而是按角色分工：

| Runtime family | 典型用途 |
| --- | --- |
| Codex | 实现、review、QA、ops 检查、风险控制。 |
| Claude Code | 架构、文档、规划、admin synthesis。 |
| Hermes | 研究、记忆整理、长上下文消化。 |

See [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) for the role map.

## Workspace Skills / Workspace Skills

Workspace skills are the shared grammar of the workbench. They keep high-frequency behavior explicit: SDD, conductor routing, research, implementation, review, docs release, browser proofshot QA, token/context discipline, and memory synthesis.

Workspace skills 是工作台的共享语法。它们把高频行为固定下来：SDD、conductor routing、research、implementation、review、docs release、browser proofshot QA、token/context discipline、memory synthesis。

See [skills/README.md](skills/README.md) for the live skill map and attachment design.

## Flight Recorder / Flight Recorder

The flight recorder is a compact issue-level digest. It checks issue metadata, comments, runs, verdict markers, checkout evidence, and run-message counts, then prints a `RUN_DIGEST`. It is not full telemetry, and it does not persist raw issue/comment/run-message payloads by default.

Flight Recorder 是 issue 级别的轻量摘要。它检查 issue metadata、comments、runs、verdict markers、checkout evidence 和 run-message counts，然后输出 `RUN_DIGEST`。它不是完整 telemetry，默认也不会持久化 raw issue/comment/run-message payloads。

```bash
./scripts/collect-flight-recorder.sh <issue-id>
```

See [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) and [docs/flight-recorder.md](docs/flight-recorder.md).

## Skill Curator / 技能策展

The Skill Curator is the maintenance protocol for keeping workbench skills useful over time. It reviews stale skills, overlapping instructions, role-binding drift, token/context risk, and recoverable archive candidates. Version 1 is review-only: it proposes changes through issues instead of silently deleting or rewriting skills.

Skill Curator 是工作台的 skill 维护协议。它检查 stale skills、重复规则、role-binding drift、token/context risk，以及可恢复 archive 候选项。v1 只做 review：通过 issue 提出修改建议，不静默删除或重写 skill。

See [docs/skill-curator.md](docs/skill-curator.md) and [issue-templates/curator-review.md](issue-templates/curator-review.md).

## Autopilots / 自动巡检

Autopilots create issues for recurring checks. They do not silently perform high-risk work. Daily health, auto-review sweeps, dependency review, stale-memory checks, skill-curator checks, and benchmark-artifact checks are treated as scheduled prompts for reviewed execution.

Autopilots 用来定期创建检查 issue，而不是偷偷执行高风险操作。Daily health、auto-review sweeps、dependency review、stale-memory checks、skill-curator checks、benchmark-artifact checks 都是进入 review 流程的入口。

See [autopilots/daily-health.md](autopilots/daily-health.md) for the health-check pattern and [autopilots/auto-review-sweeper.md](autopilots/auto-review-sweeper.md) for the automatic `in_review` review gate.

## Commands / 常用命令

Read-only helpers:

```bash
./scripts/list-workbench-state.sh
./scripts/collect-flight-recorder.sh <issue-id>
```

Source regeneration helper:

```bash
./scripts/generate-create-commands.sh
```

Human approval is required before running:

```bash
./scripts/create-pilot-agent.sh
./scripts/create-agent-roster.sh
```

常用命令分两类：只读检查可以直接跑；会创建 agent/roster 的脚本必须先有人类确认。

## Safety Boundaries / 安全边界

The workbench is intentionally conservative:

- It does not replace Multica.
- It does not modify Multica daemon, Desktop UI, or core runtime in version 1.
- It does not store secrets, credential material, raw request payloads, or raw run transcripts.
- No agent may claim done without evidence.
- Outer Ring agents do not assign work to each other.
- Autopilots create issues; they do not silently execute high-risk work.

工作台故意保持保守：

- 不替代 Multica。
- v1 不修改 Multica daemon、Desktop UI 或 core runtime。
- 不存 secrets、credential material、raw request payloads 或 raw run transcripts。
- 没有证据，agent 不能 claim done。
- Outer Ring agents 不互相派活。
- Autopilots 只创建 issue，不静默执行高风险任务。

## Documentation Map / 文档地图

| Need / 需求 | File |
| --- | --- |
| Agent operating manual / Agent 操作手册 | [AGENTS.md](AGENTS.md) |
| Current strategy and architecture / 当前策略与架构 | [SYNTHESIS.md](SYNTHESIS.md) |
| Decision log / 决策记录 | [DECISIONS.md](DECISIONS.md) |
| Historical rollout log / 历史流水账 | [WORKBENCH_LOG.md](WORKBENCH_LOG.md) |
| Flight recorder contract / Flight Recorder 契约 | [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) |
| Skill curator protocol / Skill Curator 协议 | [docs/skill-curator.md](docs/skill-curator.md) |
| Workspace skill map / Skill 映射 | [skills/README.md](skills/README.md) |
| Agent roster / Agent 名册 | [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) |
| Issue templates / Issue 模板 | [issue-templates/](issue-templates/) |
| Autopilots / 自动巡检 | [autopilots/](autopilots/) |

## Current Status / 当前状态

The workbench has a verified two-ring roster, a high-frequency workspace skill pack, source-first prompt compression, daily health autopilot scaffolding, an automatic review sweeper, a flight recorder that has passed live QA/Supervisor review, and a source-level skill curator protocol. Current operational truth lives in [SYNTHESIS.md](SYNTHESIS.md); historical details live in [WORKBENCH_LOG.md](WORKBENCH_LOG.md).

当前工作台已经具备经过验证的双环 roster、高频 workspace skill pack、source-first prompt compression、daily health autopilot scaffold、automatic review sweeper、通过 live QA/Supervisor review 的 flight recorder，以及 source-level skill curator protocol。当前事实看 [SYNTHESIS.md](SYNTHESIS.md)，历史过程看 [WORKBENCH_LOG.md](WORKBENCH_LOG.md)。
