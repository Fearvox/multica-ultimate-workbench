# Algorithm Advisory Gate Lane

The Algorithm Advisory Gate Lane adds an advisory-only algorithm review stage
between Technical Design and Task List in the workbench SDD workflow.

It does not replace SDD, Supervisor review, Goal Mode, L2 Pressure, Runtime
Hygiene, or the Capy VM Lane. It turns algorithm and data-structure pressure
into explicit Task List requirements before implementation begins.

## Role In The Workbench

| Surface | Owns | Boundary |
| --- | --- | --- |
| Technical Design | runtime, data path, integration, risk, verification design | must provide enough scoped evidence for algorithm review |
| Algorithm Advisory Gate | correctness, complexity, data-structure, and verification advice | advisory-only; no direct repo patching |
| Task List | executable tasks and verification commands | must carry forward advisory injections |
| Supervisor | PASS / FLAG / BLOCK review | source of final acceptance |

## SDD Placement

```text
Raw Requirement
-> Product Design
-> Technical Design
-> Algorithm Advisory Gate
-> Task List
-> Execution And Verification
```

## Runtime Shape

- runtime family: Claude Code in a VM or remote disposable cell;
- model intent: GPT-5.5 xhigh using the exact model id accepted by Multica;
- role: advisory-only algorithm consultant;
- skill source: the user's `data-algo` skill;
- config isolation: per-lease temporary `HOME` and temporary Claude config;
- repo access: read-only; implementation writes must route to a separate
  non-advisor owner and issue;
- output: `ALGO_ADVISORY_REPORT`.

If the exact GPT-5.5 xhigh model configuration is not accepted by live
Multica readback, report `FLAG` and do not silently downgrade.

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

## Hybrid Gate

- Correctness risks are hard gates and return `BLOCK`.
- Performance, complexity, data-structure, cache, queue, graph, search, and
  streaming concerns return `FLAG` unless they also create correctness risk.
- `FLAG` may proceed only when `task_list_injections` and
  `verification_injections` are carried into Task List.
- `PASS` may proceed while preserving useful test suggestions.
- `BLOCK` requires concrete evidence from the Technical Design or scoped code.

## VM Isolation Smoke

```text
ALGO_ADVISORY_SMOKE_REPORT
execution_target:
vm_lease:
temp_home:
temp_config:
repo_mount:
skill_mount:
commands:
settings_readback:
global_config_touched: yes/no/unknown
raw_artifacts_kept_out_of_git:
teardown:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

## Safety Rules

- No direct code patching by the algorithm advisor in v1.
- No global Claude Code settings mutation.
- No `.capy/settings.json` mutation.
- No Multica daemon, Desktop UI, Sanity dataset, credential, or Workbench Max mutation.
- No raw logs, screenshots, transcripts, tokens, OAuth material, cookies, or private runtime IDs in Git.
