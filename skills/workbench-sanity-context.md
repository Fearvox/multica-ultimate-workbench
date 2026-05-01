---
name: workbench-sanity-context
description: Use when designing, reviewing, or updating Sanity as the shared context registry for workbench agents and CLIs.
---

# Workbench Sanity Context

Use this skill when a task touches Sanity schemas, Sanity Studio, Sanity MCP, or
the cross-CLI context registry.

## Required Checks

1. Confirm the target Sanity project and dataset from local Studio config or
   explicit task context.
2. Confirm the schema type being created or changed.
3. Confirm the data is sanitized before it enters Sanity.
4. Confirm no secrets, OAuth material, raw payloads, screenshots, or full
   transcripts are being copied.
5. Run the Studio build or schema validation available in the project.

## Default Schema Names

- `agentProfile`
- `runtimeSurface`
- `skillContract`
- `evidenceEvent`
- `decisionRecord`
- `handoff`
- `capyProcessCheck`

## Report Contract

```text
SANITY_CONTEXT_REPORT
project:
dataset:
schema_types:
data_policy:
files_changed:
validation:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

`PASS` requires schema/build validation and a clean data policy. `FLAG` is
correct when MCP/OAuth or live dataset writes still need separate approval.
`BLOCK` is correct when the target project is unknown or the requested data is
unsafe to store.

