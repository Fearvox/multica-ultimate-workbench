# Runtime Orchestration Stack

Status: v0 contract

This document turns recent Hermes, OpenCode, and Pi research into a small
Workbench operating contract. It is not a live runtime mutation plan. It tells
agents how to route work, observe work, and preserve evidence without inventing
a giant unified agent OS.

## Summary

Use a three-layer stack:

| Layer | Runtime family | Best role | Workbench meaning |
| --- | --- | --- | --- |
| Memory and queue | Hermes | Profiles, memory, skills, cron, gateway, Kanban | Standing worker layer for durable recall, scheduled review, docs-sync, and queue-backed handoffs. |
| Execution | OpenCode | Terminal code work, repo search, local edits, subagents, GitHub automation | Primary execution brain for bounded repo work and implementation loops. |
| Observation | Pi | TUI, JSON/RPC event stream, dashboard, interactive shell | Cockpit layer for human-visible steering, event capture, pairing, and intervention. |

Do not collapse these into one "best agent". The win is separation:

```text
Hermes remembers and schedules.
OpenCode edits and executes.
Pi shows, streams, and lets the operator take over.
```

## Evidence Scorecard

When adopting runtime patterns, prefer sources in this order:

| Source class | Authority | Reproducibility | Use |
| --- | ---: | ---: | --- |
| Official docs and repos | 5 | 4-5 | Adoption rules and supported capability claims. |
| GitHub issues, pull requests, and releases | 3-4 | 4 | Sharp edges, current bugs, release timing, and implementation signals. |
| Practitioner demos and X threads | 1-3 | 1-4 | Inspiration only unless they show concrete commands, code, or reproducible sessions. |

Local fit is judged against Workbench and Windburn principles:

- observe state;
- update belief;
- choose a bounded action;
- verify the delta;
- preserve learning in a future-readable surface;
- preserve `PASS` / `FLAG` / `BLOCK` semantics across adapters.

## Capability Matrix

| Runtime | PASS use | FLAG use | BLOCK use |
| --- | --- | --- | --- |
| Hermes | Long-running memory worker, scheduled docs-sync, profile-specific watcher, Kanban-backed handoff. | Unattended live execution when provider state or progress visibility is uncertain. | Treating memory as source-of-truth without fresh repo/issue evidence. |
| OpenCode | Local execution brain: search, edit, test, review, focused subagent fanout, repo-aware terminal work. | GitHub `/oc` or hosted automation when secrets, permissions, or workflow scope are not yet proven. | Making unmerged nested-subagent behavior a hard dependency for core Workbench closure. |
| Pi | Human-visible observer, JSON/RPC event stream, TUI pairing, dashboard for local supervision. | Tunnels, mobile access, or remote dashboards before access and secret boundaries are reviewed. | Public or unauthenticated operator control plane with secret-bearing session state. |

## Routing Rules

### Hermes

Use Hermes when the task needs identity over time:

- scheduled recall;
- durable queue state;
- memory curation;
- docs-sync review;
- gateway messaging;
- long-running research that must post bounded cycle reports.

Prefer Hermes Kanban for durable cross-agent work. Prefer direct delegation only
for short fork-join subtasks where all context can be fully specified.

Required closeout shape:

```text
HERMES_WORKER_REPORT
profile_or_queue:
task_boundary:
memory_or_skill_used:
evidence_checked:
state_change:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

### OpenCode

Use OpenCode when the task needs local code execution:

- codebase search;
- implementation;
- local tests;
- read-only planning;
- repo-bound review;
- small subagent fanout with explicit ownership.

OpenCode is not the long-term memory layer. If an OpenCode run discovers durable
knowledge, route that knowledge to a reviewed doc, issue comment, Research Vault
pressure packet, or Sanity context record instead of relying on the session.

Required closeout shape:

```text
OPENCODE_EXECUTION_REPORT
repo_anchor:
branch:
files_touched:
commands_run:
permission_boundary:
handoff_or_pr:
VERDICT: PASS | FLAG | BLOCK
```

### Pi

Use Pi when the operator needs to see or steer a live process:

- TUI pairing;
- JSON/RPC event capture;
- session tree observation;
- dispatch and monitor for long-running CLIs;
- dashboard view for local supervision.

Pi is an observation and steering layer, not the default autonomous worker. A Pi
surface that exposes tunnel access, provider auth, raw transcripts, or operator
control needs Heavy Path and explicit operator approval.

Required closeout shape:

```text
PI_OBSERVER_REPORT
session_surface:
event_stream:
operator_controls_exposed:
secrets_boundary:
timeout_or_kill_policy:
handoff:
VERDICT: PASS | FLAG | BLOCK
```

## Workbench Integration Pattern

The stable v0 pattern is a thin bridge, not a monolith:

```text
Multica issue
-> Self-Awareness Bootstrap
-> runtime role selected
-> Hermes / OpenCode / Pi route
-> evidence event or report
-> Supervisor verdict
-> durable learning surface
```

Use the smallest runtime that makes the work observable and reviewable:

- If the work is a one-shot repo patch, use OpenCode.
- If the work is a recurring or memory-sensitive lane, use Hermes.
- If the work is hard to supervise because it streams, blocks, or runs for a
  long time, add Pi as the observer.
- If the work needs Research Vault pressure, run the RV MCP Remote Preflight
  before claiming remote memory grounding.

## Sharp Edges

- Hermes memory is curated pressure, not a truth database.
- Hermes profile/provider state can differ by runtime. Read live state before
  assigning failure or success.
- OpenCode permission rules are part of the contract. Destructive commands and
  external directories should be `ask` or `deny` unless the issue explicitly
  grants them.
- OpenCode nested subagent and session-tree behavior is still an evolving
  surface. Use it opportunistically, not as a closure dependency.
- Pi dashboard and tunnels can become a public control plane. Treat them as
  Heavy Path until access boundaries are proven.
- Pi event streams are useful evidence, but raw transcripts and private session
  payloads stay out of repo docs.

## Adoption Verdicts

| Workflow | Verdict | Reason |
| --- | --- | --- |
| Hermes profile per Workbench role | PASS | Clear identity, isolated memory, and durable scheduling. |
| Hermes Kanban for durable queue | PASS | Better for audit, retry, and human comments than fragile one-shot delegation. |
| Hermes as sole coding agent | FLAG | Useful, but not the fastest or clearest local edit loop. |
| OpenCode local terminal execution | PASS | Strong fit for repo-bound work, tests, and implementation. |
| OpenCode GitHub automation | FLAG | Useful only after workflow permissions and secrets boundary are proven. |
| OpenCode nested subagent hierarchy as core dependency | FLAG | Promising but still evolving upstream. |
| Pi JSON/RPC observer bridge | PASS | Excellent event stream for cockpit and replay. |
| Pi dashboard local supervisor | PASS | Useful control room when kept local and secret-safe. |
| Pi dashboard over tunnel | FLAG | Needs explicit access and public-surface review. |
| Pi interactive shell dispatch/monitor | PASS/FLAG | PASS with worktree, timeout, and cleanup policy; FLAG without them. |

## Public-Surface Boundary

Runtime reports may include:

- runtime family names;
- role labels;
- command names without private args;
- verdicts;
- repo-relative paths;
- count-level event summaries;
- links to public official docs or repos.

Runtime reports must not include:

- raw host/IP values;
- private local absolute paths;
- credential paths;
- SSH or tmux targets;
- provider tokens or OAuth payloads;
- raw transcripts;
- private screenshots;
- tunnel URLs unless explicitly approved for the current issue.

## First Durable Next Step

Before wiring any new live runtime route, create or use an issue from
`issue-templates/runtime-stack-preflight.md`. The preflight proves the runtime
role, source authority, permission boundary, observer story, and closeout shape
before any implementation or provider change.
