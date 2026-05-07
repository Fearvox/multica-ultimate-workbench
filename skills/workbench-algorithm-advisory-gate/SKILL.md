---
name: workbench-algorithm-advisory-gate
description: Advisory-only algorithm and data-structure review gate between Technical Design and Task List.
---

# Workbench Algorithm Advisory Gate

Use this skill when an issue declares `SDD_STAGE: Algorithm Advisory Gate`,
asks for algorithm review before Task List, or assigns the Remote Algorithm
Advisor.

## Required Source Reads

1. The latest `SDD_STAGE: Technical Design` block.
2. `docs/algorithm-advisory-gate-lane.md`.
3. The scoped files named by `code_scope` or `SCOPED_EVIDENCE`.
4. The mounted `data-algo` skill entrypoint.

Do not read unrelated issue history or broad repo trees unless the Technical
Design names that evidence.

## Runtime Boundary

- Advisory-only. Do not edit repo files.
- Do not mutate global Claude Code settings, `.capy/settings.json`, Multica
  runtime config, Sanity datasets, credentials, or Workbench Max.
- Use per-lease temporary `HOME` and temporary Claude config when running in a
  VM or disposable cell.
- If the exact GPT-5.5 xhigh model setup is unavailable, return `FLAG` with the
  observed model readback.

## Required Report

```text
ALGO_ADVISORY_REPORT
target_issue:
source_stage: Technical Design
runtime:
model:
isolation:
skill_sources:
code_scope:
correctness_verdict: PASS | BLOCK
complexity_verdict: PASS | FLAG | BLOCK
data_structure_notes:
algorithmic_risks:
task_list_injections:
verification_injections:
settings_readback:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

## Verdicts

- `PASS`: no correctness blocker and complexity risk is acceptable.
- `FLAG`: Task List may proceed only if advisory injections become explicit
  tasks, checks, or residual risks.
- `BLOCK`: Technical Design must be revised before Task List because the
  advisor found a concrete correctness, data-loss, privacy, concurrency, or
  semantic risk.
