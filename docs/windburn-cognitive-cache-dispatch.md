# Windburn Cognitive Cache Dispatch Contract

Date: 2026-05-03

This is the public-safe dispatch contract for building the Windburn
Belief/Perception/Continuity cache. It is a direction and work contract, not
proof that any implementation has already passed review.

For the underlying direction, read
[windburn-cognitive-cache-direction.md](windburn-cognitive-cache-direction.md).

## Suggested Issue

```text
Build Windburn cognitive-cache MVP for .learning future-self memory
```

Suggested project:

```text
Ultimate Workbench
```

Suggested status:

```text
triage or in_progress
```

## Issue Body

```text
/goal
GOAL_MODE: yes
GOAL_MODE_V2: yes
HEAVY_PATH: yes
SELF_AWARENESS_REQUIRED: yes
L2_PRESSURE: yes

RAW_REQUIREMENT
Build the first local MVP for Windburn's Belief/Perception/Continuity
cognitive cache: a durable .learning substrate that turns session/tool/RV
feedback into future-self context without training a base model yet.

HANDOFF_SUMMARY
The goal is not to train Windburn yet. The goal is to create the minimum
memory-native substrate that can preserve perceptions, beliefs, failures,
skills, source truth, and parking ideas across sessions, then route compact
context into a future agent run.

SCOPED_EVIDENCE
- Direction doc: docs/windburn-cognitive-cache-direction.md
- Dispatch contract: docs/windburn-cognitive-cache-dispatch.md
- Workbench lanes: Self-Awareness, L2 Pressure, Goal Mode v2, remote RV MCP
- Advisory claim: behavior-changing memory matters more than retrieval-only
  benchmark performance

ANTI_OVER_READ
Do not read full issue history, full agent roster, raw transcripts, or unrelated
repo branches. Read only the named Workbench lane docs and the Windburn
cognitive-cache direction docs unless implementation proves a specific
dependency.

NON_NEGOTIABLES
- Do not touch Workbench Max.
- Do not mutate Multica daemon, Desktop UI, live runtimes, agents, or autopilots.
- Do not store secrets, OAuth material, raw transcripts, private screenshots,
  or raw request payloads.
- Do not write to Research Vault unless a separate explicit approval appears.
- Do not begin model training, GPU rental, SGLang cluster setup, or MLX
  training in this issue.
- Do not turn speculative beliefs into source truth.
- Do not compile secret-adjacent memory into context packs by default.

SUCCESS_METRIC
A local prototype exists that can:
1. create and append .learning episode files;
2. store typed perceptions, beliefs, failures, skills, source truth, and parking
   ideas;
3. compile a bounded future-self context pack;
4. exclude secret-adjacent files from default context compilation;
5. run at least two local verification fixtures:
   - repeated-action failure avoidance;
   - Research-Vault-grounded architecture decision routing;
6. produce a compact RUN_DIGEST with PASS / FLAG / BLOCK.

OPERATOR_CALL_CONDITIONS
Stop and ask the human before:
- any remote runtime mutation;
- any secret-bearing config access;
- any Research Vault write or maintenance run;
- any model fine-tuning/training;
- any destructive cleanup;
- a schema decision that would make .learning private-only or public-committable
  by default.
```

## Required Self-Awareness Bootstrap

Post this before implementation:

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

## Required RV Pressure Check

Post this before technical design:

```text
RV_PRESSURE_CHECK
objective: build .learning cognitive-cache MVP for Windburn future-self memory
vault_source:
queries_or_indexes_checked:
relevant_prior_failures:
proven_patterns:
l2_pressure_applied:
not_applied_and_why:
next_best_action:
verdict: PASS | FLAG | BLOCK
```

## Implementation Slices

### Slice A: Schema And Templates

- Define `.learning` directory contract.
- Add markdown templates for episode, belief, failure, skill, source-truth, and
  parking files.
- Add redaction and public-safety rules.
- Add trust states: parking, hypothesis, verified, trusted.

### Slice B: CLI Prototype

- Add a local command or script to start and append an episode.
- Add a compile command that emits a future-self context pack.
- Keep the implementation local-first and repo-scoped.
- Ensure the compile command enforces a deterministic budget approximation.

### Slice C: Router Prototype

- Read a bounded set of `.learning` files.
- Select relevant beliefs, failures, skills, source truth, and parking by goal
  keywords and recency.
- Keep output source-labeled.
- Exclude secret-adjacent files unless an explicit approved flag is used.

### Slice D: Verification Fixtures

- Fixture 1: repeated action failure should be avoided on run N+1.
- Fixture 2: memory/RV architecture task should include RV pressure and avoid
  unsupported training escalation.
- Fixture 3: secret-adjacent memory is excluded from default compilation.
- Fixture 4: source-truth entries surface in a separate section.
- Fixture 5: context output is bounded by the requested budget.

### Slice E: Workbench Closeout

- Produce `RUN_DIGEST`.
- Include changed paths, commands, verification result, residual risk, and next
  repair action.
- Do not mark PASS if a privacy/trust/budget contract is missing.

## Required Closeout

```text
GOAL_MODE_V2_CLOSEOUT
goal_id:
objective:
state_machine_path:
decision_packets_produced:
issues_dispatched:
evidence_harvested:
noise_cancelled:
operator_calls:
residual_risk:
archive_actions_taken:
verdict: PASS | FLAG | BLOCK
```

## Superconductor Review Prompt

Use this review prompt before accepting implementation work:

```text
Review this Windburn cognitive-cache MVP dispatch as a control-plane design.

Focus on:
1. whether .learning should be project-level, agent-level, or both;
2. whether cache compilation belongs at session start, session close, or both;
3. what minimal UI/control surface is needed to inspect active beliefs/failures;
4. whether Workbench Supervisor should approve trusted memory deltas;
5. whether this should remain local-first before remote workhorse execution.

Return:
- PASS / FLAG / BLOCK
- the one schema choice most likely to hurt us later
- the smallest implementation slice worth dispatching first
- any safety rule missing from the issue body
```

## Current Design Answers

1. `.learning` should be both project-level and agent-private. Project-level
   memory should contain only reviewed, public-safe or explicitly shareable
   source truth, failures, skills, and promoted beliefs. Agent-private memory
   should hold local-only episodes, user taste, unreviewed hypotheses, and
   secret-adjacent notes.
2. Cache compilation belongs at both session start and session close. Start
   compiles trusted context for action. Close writes proposed deltas as
   untrusted or pending memory. Promotion from pending to trusted requires
   verification or review.
3. The smallest control surface is a CLI status or inspect view showing active
   beliefs and failures with privacy, trust tier, confidence, last evidence,
   and pending promotions.
4. Workbench Supervisor should approve trusted memory deltas for source truth,
   cross-agent skills, high-confidence project beliefs, and failure rules that
   change future policy. It should not review every local episode note.
5. Keep this local-first before remote workhorse execution. Remote agents may
   read a compiled pack, but should not write or promote `.learning` until the
   trust and privacy gates are proven.

## First Repair Bias

If a prototype already exists, review the compiler and fixtures first. The
highest-risk missing gates are:

- default exclusion of `secret-adjacent` memory;
- separate inclusion of `source-truth`;
- real budget enforcement;
- a trust-promotion state machine.
