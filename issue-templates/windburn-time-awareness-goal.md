# Windburn Time-Awareness Goal Issue

Use this template for the first fast Windburn cognitive-cache landing: making
belief age visible and impossible for an agent to refresh by repeated citation.
This is a specs-first `/goal` route for local docs/templates/fixtures. It is not
permission to mutate live runtimes or memory stores.

## Required Header

```text
/goal
GOAL_MODE: yes
STANDARD_PATH: yes
```

Upgrade to `HEAVY_PATH: yes` and `SELF_AWARENESS_REQUIRED: yes` if the issue
touches live agents, runtime bindings, daemon/Desktop/core, Research Vault,
remote VMs, shared memory storage, or production services.

## RAW_REQUIREMENT

```text
Ship the first Windburn cognitive-cache slice: time-awareness for beliefs.
Every belief must carry immutable age metadata, retrieval must not refresh
decay, and context packs must label stale beliefs as hypotheses or history.
```

## SCOPED_EVIDENCE

- Direction doc: `docs/windburn-cognitive-cache-direction.md`
- Dispatch contract: `docs/windburn-cognitive-cache-dispatch.md`
- Goal Mode: `skills/workbench-goal-mode/SKILL.md`
- Hybrid parent template: `issue-templates/windburn-senter-hybrid-goal.md`

## GOAL_LOCK

```text
GOAL_LOCK:
objective: make Windburn beliefs time-aware before any challenger or verifier loop
owner:
non_goals: no live runtime mutation; no Research Vault writes; no remote VM work;
  no confidence promotion engine; no model training
closeout_gates: spec patch, templates or fixtures if code exists, validation
  commands, git status, commit/push or explicit handoff
operator_call_conditions: missing repo access; live runtime mutation request;
  secret-bearing config; destructive cleanup; external verifier policy conflict
```

## SPEC_PACKET

```text
SPEC_PACKET
objective:
belief_time_fields:
  created_at:
  observed_at:
  last_verified_at:
  last_accessed_at:
  age_bucket:
  staleness_reason:
write_contract:
read_time_labels:
context_pack_wording:
fixtures:
operator_call_conditions:
verdict: READY_TO_IMPLEMENT | NEEDS_DESIGN | OPERATOR_NEEDED
```

Required decisions:

- Which commands or writers may set `created_at` and `observed_at`.
- Which external verifier evidence may set or refresh `last_verified_at`.
- Whether `age_bucket` is stored, computed, or both.
- How retrieval updates `last_accessed_at` without touching freshness.
- How stale and expired beliefs are represented in prompt/context packs.

## NON_NEGOTIABLES

- Agent reads may update only `last_accessed_at`.
- Agent writes may lower confidence, attach counter-evidence, or request
  verification, but cannot refresh `last_verified_at`.
- Time decay is driven by system clock, not by agent confidence or recitation.
- Stale beliefs are usable as hypotheses or history, not trusted source truth.
- Confidence can rise only after external verifier evidence.
- Do not store secrets, OAuth material, raw transcripts, private screenshots,
  raw request payloads, direct IPs, or live runtime IDs.

## SUCCESS_METRIC

- Belief schema or template includes `created_at`, `observed_at`,
  `last_verified_at`, `last_accessed_at`, `age_bucket`, and
  `staleness_reason`.
- Retrieval semantics explicitly say access does not refresh decay.
- Context-pack wording labels stale/expired beliefs before model use.
- Verification fixtures or proposed fixture cases cover:
  - repeated agent citation does not reset age;
  - `last_accessed_at` changes without changing `last_verified_at`;
  - stale belief remains stale until external verifier evidence appears;
  - confidence cannot rise from agent-side writes alone.
- Closeout includes exact changed files and validation commands.

## OPERATOR_CALL_CONDITIONS

Stop and ask the human before:

- touching live Multica, Superconductor, daemon/Desktop/core, agents,
  autopilots, skills, runtime bindings, or remote VMs;
- writing to Research Vault or running vault maintenance;
- accessing secret-bearing config;
- changing public/private defaults for `.learning`;
- creating a confidence promotion path without external verifier evidence.

## Required Closeout

```text
GOAL_LOCK:
WHAT_CHANGED:
VERIFICATION:
DOCS_REPORT:
GIT_STATUS:
RESIDUAL_RISK:
OPERATOR_NEEDED: yes/no
VERDICT: PASS | FLAG | BLOCK
```
