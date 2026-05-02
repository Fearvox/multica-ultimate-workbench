---
name: workbench-self-awareness-infra
description: Capability discovery and current-state verification for Heavy Path, ambiguous repo/runtime ownership, and runtime-dependent Standard Path work.
---

# Workbench Self-Awareness Infra

Use this skill when the Friction Tier Router selects Heavy Path, when
repo/runtime ownership is ambiguous, or when Standard Path work depends on
current runtime capability.

Self-awareness is the workbench's heavy-risk boot layer. It prevents agents
from confusing memory, old sessions, model assumptions, or job-start events with
current evidence without forcing low-risk Fast Path work through ceremony.

## Activation

Use this layer when any of these apply:

- Friction Tier Router selected `HEAVY_PATH`;
- repo, runtime, branch, issue, or owner is ambiguous;
- `STANDARD_PATH` evidence depends on live runtime capability;
- the issue contains `GOAL_MODE: yes`, `L2_PRESSURE: yes`, `/goal`,
  `HarnessMax`, `remote`, `VM`, `Research Vault`, `MCP`, or autonomous language;
- the task may change a live skill, agent, autopilot, runtime, deploy surface,
  payment/OAuth/secrets boundary, branch/merge state, or public proof surface;
- the agent is starting from a new session, rerun, stale context, or external
  handoff and cannot cheaply verify the current anchor;
- the task asks for the highest-yield route, leaderboard pressure, or full auto
  execution.

Do not use this layer for `FAST_PATH` work unless repo/runtime ownership is
ambiguous.

## Required Block

Post or maintain this block before routing, implementation, or review when the
selected tier requires it:

```text
SELF_AWARENESS_BOOTSTRAP
runtime_identity:
role_boundary:
repo_anchor:
tool_envelope:
mcp_envelope:
memory_sources_checked:
current_state_proof:
risk_envelope:
routing_decision:
success_metric:
operator_call_conditions:
verdict: READY | FLAG | BLOCK
```

## Field Rules

- `runtime_identity`: name the runtime family and execution cell, without
  exposing private IDs, tokens, direct IPs, or raw environment output.
- `role_boundary`: name what this agent owns and what it must not take over.
- `repo_anchor`: name the project-bound repo/resource, branch, and whether any
  local path is authoritative or only fallback evidence.
- `tool_envelope`: list the relevant tools actually available or checked.
- `mcp_envelope`: list the relevant MCP/connectors visible for this run; mark
  unavailable tools as `missing` instead of pretending they exist.
- `memory_sources_checked`: distinguish current repo state from advisory memory.
- `current_state_proof`: include small proof such as `git status`, issue JSON,
  run status, docs read, or command exit status.
- `risk_envelope`: state secrets, destructive actions, public/private boundary,
  runtime mutation, cost, and irreversible release risks.
- `routing_decision`: decide inline execution, Multica parent issue, child
  issues, remote runtime, VM lane, or Supervisor review.
- `success_metric`: state the artifact that counts: merged PR, verified run,
  build/test pass, shipped doc, closed issue, or proven blocker.
- `operator_call_conditions`: list the few cases that justify stopping for the
  human.

## Source Order

Use the newest current source first:

1. Active issue description, latest relevant comments, and current run status.
2. Project-bound GitHub repo or explicitly attached repo resource.
3. Runtime-local `git status`, branch, recent commit, and changed files.
4. Live tool/MCP inventory for the current runtime.
5. Research Vault or workbench memory as advisory pressure, not as truth.
6. Historical docs, logs, and old summaries only when the task needs them.

If memory conflicts with current repo or issue evidence, current evidence wins
and the conflict becomes residual risk.

## Routing Rules

Use the bootstrap to route work instead of becoming the bottleneck.

- If two or more independent tasks exist, create or use Multica child issues.
- If the task is high-pressure remote or HarnessMax work, run L2 Pressure after
  this bootstrap and before implementation.
- If the task needs a disposable browser, GUI, sandbox, or screenshot-backed
  proof, route to the VM lane with a lease.
- If the task needs product or architecture clarification, use SDD before code.
- If the task is already implemented and waiting for evidence, route to
  Supervisor or QA review instead of re-implementing it.
- If the task only needs a small local patch, execute inline and report evidence.

## Readiness Verdicts

`READY` means the agent has enough current evidence, tools, repo anchor, risk
boundary, and success metric to proceed.

`FLAG` means the agent can proceed with a bounded caveat. Examples: fallback
memory source, missing non-critical MCP, repo anchor is usable but not ideal, or
one verification gate must be deferred with rationale.

`BLOCK` means execution must not proceed until a real external blocker is fixed.
Examples: missing credentials, invalid repo anchor for a repo-changing task,
destructive action needs approval, or the required runtime/tool is unavailable.

## Anti-Patterns

- Do not treat "job started" as success.
- Do not treat a scheduled tick as the main execution path when the session can
  run the first slice now.
- Do not paste raw environment dumps, tokens, cookies, request payloads, or full
  logs into durable docs.
- Do not say a tool or MCP exists because it existed in a different runtime.
- Do not use historical memory as proof of current branch, PR, issue, or CI
  state.
- Do not silently widen into runtime, daemon, Desktop UI, or preserved-agent
  mutation.

## Closeout

For tasks that used this layer, final reports should say whether the bootstrap
changed routing or risk posture:

```text
SELF_AWARENESS_CLOSEOUT
bootstrap_verdict:
routing_used:
capability_gap_found:
artifact_or_blocker:
residual_risk:
next_slice_started:
```

The strongest closeout is not a larger summary. It is a shipped artifact, real
verification, merged PR, closed issue, or a precise blocker with the smallest
operator action needed.
