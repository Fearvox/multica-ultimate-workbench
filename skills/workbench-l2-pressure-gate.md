---
name: workbench-l2-pressure-gate
description: Research Vault pressure gate for remote Hermes, VM, HarnessMax, and autonomous evolution sweeps.
---

# Workbench L2 Pressure Gate

Use this skill when an issue asks for HarnessMax, remote evolution, leaderboard
pressure, Research Vault grounding, long-running Hermes synthesis, or autonomous
review sweeps that should improve the workbench over time.

L2 Pressure is the workbench's memory-pressure layer. Before choosing a path, the
owner must pull relevant prior failures, constraints, and proven patterns from
Research Vault or the closest available durable memory source. The result is a
better next action, not a larger prompt.

## Activation

Use this gate when any of these appear in the issue:

- `L2_PRESSURE: yes`
- `RV_PRESSURE: required`
- HarnessMax, remote evolve, remote VM, remote Hermes, leaderboard, or
  constant-evolve language
- a task that could repeat prior mistakes unless durable memory is consulted

## Required Block

Post this before routing or implementation:

```text
RV_PRESSURE_CHECK
objective:
owner:
vault_source:
queries_or_indexes_checked:
relevant_prior_failures:
proven_patterns:
l2_pressure_applied:
not_applied_and_why:
next_best_action:
verdict: PASS | FLAG | BLOCK
```

## Source Order

Use the best available source, in this order:

1. Remote Research Vault MCP endpoint if the issue proves it is available.
2. Project-bound Research Vault repo/resource if attached to the issue.
3. Local Research Vault MCP or filesystem source when the runtime is local.
4. Workbench memory files, `SYNTHESIS.md`, `DECISIONS.md`, and issue evidence
   when Research Vault access is unavailable.

If using a fallback, mark the result `FLAG` unless the task only needs
workbench-local memory.

## Remote Rules

- Remote runtimes must not treat laptop `file://` paths as valid Research Vault
  access.
- Remote Research Vault MCP starts read-only: `vault_status`, `vault_search`,
  `vault_taxonomy`, and `vault_get` only.
- Do not enable write, ingest, delete, or maintenance tools without a separate
  issue, explicit approval, and Supervisor review.
- Store only compact summaries in issue comments. Do not paste raw vault entries,
  secrets, OAuth material, request payloads, screenshots, or private logs.
- If MCP auth, endpoint, or routing fails, create or route to an RV MCP preflight
  issue instead of inventing memory.

## Pressure Rules

1. Convert memory into constraints and next actions.
2. Prefer proven failure modes over generic advice.
3. Reject novelty when a prior pattern already identifies the highest-yield path.
4. Name the route not taken when leaderboard pressure would tempt broad work.
5. Escalate to Supervisor when memory conflicts with the issue objective.

## Closeout

For L2 Pressure tasks, `PASS` requires:

- the required block was posted;
- at least one durable source was checked or a fallback was justified;
- prior failures or proven patterns changed the plan, review, or route; and
- the final report states whether the pressure improved, blocked, or merely
  confirmed the current path.

If no relevant memory exists, report `PASS` only when the search was specific and
bounded. Broad "nothing found" claims are `FLAG`.
