# Algorithm Advisory Gate Design

## Goal

Add a VM-backed Claude Code algorithm advisor to the workbench SDD loop. The
advisor uses GPT-5.5 xhigh and the user's `data-algo` skill as an
advisory-only review gate between Technical Design and Task List.

The lane should improve algorithm choice, correctness review, complexity
discipline, and verification quality without granting another agent direct
implementation authority or letting Claude Code settings bleed across runtime
instances.

## Placement In SDD

The new stage sits after Technical Design and before Task List:

```text
Raw Requirement
-> Product Design
-> Technical Design
-> Algorithm Advisory Gate
-> Task List
-> Execution And Verification
```

Technical Design remains responsible for runtime owner, data path, integration
points, files to modify, risk surface, and verification approach. Algorithm
Advisory Gate reads that stage, inspects only the named code scope, and returns
task-list injections instead of modifying code.

## Runtime Shape

The execution cell is a VM Claude Code instance with these boundaries:

- runtime family: Claude Code in a VM or remote disposable cell;
- model intent: GPT-5.5 xhigh, using the exact Multica-supported model id after
  live readback;
- role: advisory-only algorithm consultant;
- skill source: the user's `data-algo` skill, mounted or installed for the
  isolated instance;
- config isolation: per-lease temporary `HOME` and temporary Claude config;
- repo access: read-only for advisory smoke and design review unless a separate
  implementation issue grants write authority;
- output: one structured advisory report posted back into the SDD issue.

The instance must not read from or write to the operator's global Claude Code
configuration, global `settings.json`, `.capy/settings.json`, live Multica
daemon config, secrets, Sanity datasets, or preserved workbench agents.

## Advisory Report

The gate emits one compact block:

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

`settings_readback` is a sanitized summary only. It may include whether a temp
`HOME` existed, whether the global config path was untouched, and which
`data-algo` skill path was mounted. It must not include tokens, full env dumps,
private runtime IDs, cookies, OAuth material, private screenshots, or raw
transcripts.

## Hybrid Gate Rules

The gate uses a hybrid policy:

- Correctness risk is a hard gate. If the advisor finds a concrete semantic,
  privacy, concurrency, ingestion, ranking, or data-loss risk, it returns
  `correctness_verdict: BLOCK` and the issue must return to Technical Design.
- Performance and complexity risk is usually a soft gate. If the design is
  usable but has input-size, Big-O, data-structure, cache, search, graph, queue,
  or streaming concerns, it returns `complexity_verdict: FLAG`.
- A `FLAG` may proceed to Task List only when `task_list_injections` and
  `verification_injections` are carried forward as explicit tasks, checks, or
  residual risks.
- A `PASS` allows normal Task List generation while preserving any useful test
  suggestions from the report.
- A `BLOCK` must be evidence-backed and cannot be based only on taste,
  preference, or speculative elegance.

## Source Layer

The source-controlled work should add or update:

- `docs/algorithm-advisory-gate-lane.md`
- `skills/workbench-algorithm-advisory-gate/SKILL.md`
- `issue-templates/algorithm-advisory-gate.md`
- `issue-templates/sdd-workflow.md`
- `agents/AGENT_ROSTER.md`
- `agents/remote/nyc-remote-agents.md`
- navigation references in README, AGENTS, CLAUDE, SYNTHESIS, DECISIONS, and
  `skills/README.md` when appropriate.

The source layer defines the contract. It must not assume live Multica agent
configuration has already changed.

## Live Multica Layer

After source docs exist, create or update the live advisory-only skill and agent
binding in Multica. Live changes require readback:

- exact agent name and role;
- exact skill name attached;
- exact model id accepted by Multica;
- evidence that the agent is advisory-only;
- issue or comment where the SDD gate is invoked.

If GPT-5.5 xhigh is not accepted as an exact live model id, report `FLAG` and
wait for an explicit substitute instead of silently downgrading.

## VM Smoke Layer

The first smoke test proves isolation, not algorithmic performance:

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

The smoke should run with a temporary `HOME`, a temporary Claude config, a
read-only target repo where possible, and the `data-algo` skill mounted from an
explicit path. It should not optimize real code, publish private logs, or write
durable artifacts other than a sanitized summary.

## Non-Goals

- No direct code patching by the algorithm advisor in v1.
- No global Claude Code settings mutation.
- No hidden Multica runtime, daemon, Desktop UI, Sanity dataset, or preserved
  Workbench Max mutation.
- No secret values, OAuth material, raw VM logs, screenshots, or transcripts in
  Git.
- No replacement of Supervisor review, SDD, Goal Mode, L2 Pressure, Runtime
  Hygiene, or Capy VM Lane.

## Verification

The implementation plan should require:

- docs and skill link targets exist;
- `git diff --check` passes;
- secret scan on changed public docs finds no real token values;
- Multica live readback proves the advisory skill and agent binding;
- VM smoke proves temp `HOME` and temp config were used;
- SDD template includes the Algorithm Advisory Gate stage;
- a sample report can be carried into Task List without direct code mutation.
