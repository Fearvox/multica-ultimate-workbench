# Windburn Cognitive Cache Direction

Date: 2026-05-03

This is the public-safe direction record for Windburn's memory-native agent
substrate. It records the original design intent without raw transcripts,
private runtime IDs, secrets, screenshots, or live workspace payloads.

## One-Line Thesis

Windburn should not start as a new base model. It should start as a
memory-native agent substrate that turns human-agent interaction, tool
feedback, failures, repo state, and Research Vault evidence into durable
future-self cognition.

## Core Claim

Frontier models are increasingly optimized to complete a task under a reward
proxy. Windburn should optimize a different loop:

```text
observe reality -> update belief -> choose action -> verify delta -> preserve learning
```

The important gap is not more context alone. The gap is a durable layer that
models Belief, Perception, and Continuity as first-class runtime objects.

## Problem Frame

Current LLM agents often fail in interactive or long-running work because they:

- describe the screen but do not preserve a stable world model;
- try an action, fail, and repeat the same action under a new wording;
- optimize for benchmark or verifier approval instead of real task completion;
- treat memory as retrieval text rather than an ability-changing substrate;
- collapse source truth, hypotheses, failures, and user taste into one prompt.

This mirrors the failure loop:

```text
describe frame -> guess rule -> execute -> fail -> explain in language
```

The missing step is:

```text
fail -> update world model -> change future policy
```

## Cognitive Cache Object

This is not literally the transformer KV cache. It is a cognitive cache above
the model-serving layer.

```text
working cache      current session focus and task stack
episodic cache     what happened, in order
perception cache   grounded observations from tools and humans
belief cache       current hypotheses with evidence and confidence
failure cache      actions attempted, observed deltas, avoid/retry rules
procedural cache   reusable skills, repo routes, tool patterns
source cache       Research Vault, repo docs, issue state, source-of-truth files
```

The transformer KV cache answers: "what tokens have I already attended to?"

The Windburn cognitive cache answers: "what reality have I already learned?"

## Minimum Architecture

```mermaid
flowchart TD
  A["Session / Human / Agent"] --> B["Perception Intake"]
  C["Tools: browser, terminal, repo, Computer Use"] --> B
  D["Research Vault / repo docs"] --> B
  B --> E["Observation Packets"]
  E --> F["Belief Registry"]
  E --> G["Failure Ledger"]
  F --> H["Memory Router"]
  G --> H
  D --> H
  H --> I["Prompt / Context Pack"]
  H --> J["Action Policy Hints"]
  I --> K["Model Runtime"]
  J --> K
  K --> L["Action"]
  L --> M["Verification / State Delta"]
  M --> E
  M --> N[".learning Durable Docs"]
```

## Data Model Sketch

```ts
type Perception = {
  id: string;
  source: "human" | "screenshot" | "dom" | "terminal" | "repo" | "rv" | "api";
  observation: string;
  rawRef?: string;
  timestamp: string;
  confidence: number;
  privacy: "public-safe" | "local-only" | "secret-adjacent";
};

type Belief = {
  id: string;
  claim: string;
  evidence: string[];
  counterEvidence: string[];
  confidence: number;
  explorationMomentum: "low" | "medium" | "high";
  validScope: string;
  decayPolicy: "session" | "project" | "until-contradicted" | "expires";
  trustState: "parking" | "hypothesis" | "verified" | "trusted";
  lastUpdated: string;
};

type FailureMemory = {
  id: string;
  stateBefore: string;
  actionTried: string;
  observedDelta: string;
  inferredReason: string;
  avoidUntil?: string;
  retryCondition?: string;
};

type ContinuityState = {
  project: string;
  episodeId: string;
  currentGoal: string;
  openThreads: string[];
  activeBeliefs: string[];
  unresolvedFailures: string[];
  learnedSkills: string[];
  nextSelfPrompt: string;
};
```

## Trust, Decay, And Cognitive Diversity

Windburn must separate belief trust from exploration energy.

```text
confidence            how reliable the belief is
explorationMomentum   whether the route is still worth trying
```

An agent may increase `explorationMomentum` when a route is cheap, high-upside,
or worth probing. It may not directly increase `confidence`. This prevents early
creative energy from becoming trusted memory before reality has checked it.

### Decay Rules

```text
time_decay:
  system-clock only
  agent reads it but cannot reset it
  old beliefs remain old even if an agent keeps citing them

evidence_decay:
  triggered by independent contradiction search
  counter-evidence is collected by system tools or a separate challenger role
  new material counter-evidence can downgrade trust faster than time decay

confidence_promotion:
  agent can propose promotion
  system does not raise confidence until external verification passes
  challenger failure to find a material counterexample is supporting evidence,
  not sufficient proof by itself
```

Time decay is the floor: a belief loses freshness regardless of agent behavior.
Evidence decay is the ceiling: new counter-evidence can collapse trust sooner.

### Challenger Role

A single model should not both hold a belief and be responsible for falsifying
it. Windburn should use cognitive diversity as a trust boundary.

The challenger role is not the judge. Its job is to expand the falsification
space:

```text
- find worlds where the belief fails;
- generate counterfactuals and edge cases;
- name hidden assumptions;
- propose cheaper or less assumption-heavy routes;
- search for stale-source or changed-environment risk.
```

A creative, model-diverse challenger such as Grok/xAI can be valuable here
because its inductive bias is different from a careful executor/reviewer model.
That diversity is useful only if authority stays separated:

```text
executor / belief holder: propose, act, verify deltas, lower confidence
challenger: attack assumptions and generate counter-evidence
external verifier: confirm evidence and approve confidence increase
system clock: apply irreversible time decay
```

This keeps reward hacking harder: a belief holder cannot keep itself fresh,
cannot promote itself to trusted, and cannot define the full search space for
its own falsification.

## Hybrid Markdown Runtime

Senter is useful as external prior art for a markdown-native agent substrate:
agents, skills, hooks, state, and selection live in an editable vault, with a
two-stage selection path that shortlists by embedding and then asks a model to
choose the most relevant context. Windburn should borrow the substrate pattern,
not the trust model.

The hybrid route is:

```text
Senter-style substrate:
  markdown vault
  agents / skills / hooks / state
  progressive disclosure
  embedding shortlist -> model selection

Windburn trust layer:
  typed Perception / Belief / Failure / Continuity objects
  immutable time decay
  external-verifier-only confidence increase
  privacy and source-truth separation
  model-diverse challenger loop
```

The selector is a router, not an authority. It may decide which skills,
memories, or parked ideas enter context for the current goal, but it cannot
promote trust, reset decay, approve source truth, or bypass privacy gates.

### Specs-First Goal Loop

Hybrid work should begin as a spec loop before implementation:

```text
fuzzy thought
  -> SPEC_PACKET
  -> GOAL_LOCK
  -> DECISION_PACKET
  -> bounded child issues
  -> observation / review
  -> .learning pending deltas
  -> external verification
  -> trusted memory promotion or parking
```

`/goal` keeps the objective alive across turns, but it does not grant permission
to mutate live runtimes, agents, secrets, Research Vault, or public truth. The
first pass must define the vault shape, router contract, trust boundaries,
runtime owners, fixtures, and operator-call conditions before any code is
assigned.

### Spare Runtime Pool

Unused VM or remote agent runtimes can create throughput only when they remain
execution cells rather than becoming a hidden scheduler. Windburn should treat
them as a bounded runtime pool:

```text
Remote Codex Builder: schema, CLI, fixtures, repo-backed implementation
Remote Hermes Researcher: long-context synthesis and prior-art pressure
Remote VM Runner: browser, sandbox, or GUI proof with VM lease and teardown
Remote Ops Mechanic: runtime preflight, hygiene, and repo-anchor repair
```

Rules:

- one owner, issue, repo anchor, and TTL per runtime lease;
- GitHub repo resource first; laptop `file://` paths are invalid remotely
  unless explicitly mounted;
- remote runtimes may read compiled context packs, but cannot promote
  `.learning` trust or write source truth directly;
- VM/browser artifacts stay temp or private by default, with only sanitized
  summaries committed;
- idle capacity may run challenger, verifier, fixture, or synthesis tasks, but
  cannot mutate live Multica runtimes or autopilots without explicit approval.

## Durable File Shape

Initial implementation should be markdown-first:

```text
.learning/
  sessions/YYYY-MM-DD-episode.md
  beliefs/<slug>.md
  failures/<slug>.md
  skills/<slug>.md
  source-truth/<slug>.md
  rv-parking/<slug>.md
```

Markdown is not the final database. It is the first durable, reviewable,
git-diffable source of truth. A later index can compile it into SQLite,
LanceDB, graph tables, or a custom memory store.

## Runtime Loop

```text
OBSERVE
  collect user intent, tool state, repo state, screenshots, logs, RV evidence

ABSTRACT
  convert raw evidence into typed Perception objects

HYPOTHESIZE
  update Belief objects; attach evidence and counterevidence

ACT
  choose the next action with failure memory and source truth visible

VERIFY
  compare expected delta vs observed delta

LEARN
  update beliefs, failures, and skills

PARK
  distill speculative ideas separately from source truth
```

## Research Vault Role

Research Vault is not just background reading. It is a thinking-time source of
semantic pressure.

Trigger Research Vault lookup when a task touches:

- memory systems;
- world models;
- post-training or reinforcement learning;
- benchmark design;
- self-evolution;
- known product or repo failure modes;
- remote workhorse or HarnessMax evolution;
- model architecture or inference-layer design.

Research Vault entries should become citations and pressure checks, not raw
prompt paste.

## Relationship To Workbench

Existing Workbench Self-Awareness answers:

```text
what runtime am I, what tools exist, what repo is authoritative, what route is safe?
```

Windburn Cognitive Cache should answer:

```text
what have I learned from prior reality feedback, and how should it change this run?
```

Existing Workbench L2 Pressure answers:

```text
what prior Research Vault evidence changes route or risk?
```

Windburn adds:

```text
how does that evidence become future-self behavior?
```

## MVP Scope

Build only a local prototype first.

Required pieces:

1. `.learning` directory contract and templates.
2. CLI command to start or append an episode.
3. Structured extraction from a session summary into perceptions, beliefs,
   failures, skills, and parking ideas.
4. Memory router that builds a compact context pack for the next run.
5. Verification harness with two tasks: repeated-action failure avoidance and
   Research-Vault-grounded architecture decision routing.
6. Public-safe redaction rules.

Non-goals:

- no base-model training;
- no live daemon mutation;
- no secret capture;
- no automatic Research Vault writes;
- no broad transcript persistence;
- no replacing Workbench, Superconductor, SGLang, MLX, or Codex.

## Training Path

Do not start with pretraining.

```text
Phase 0: external memory runtime
Phase 1: retrieval/router learning from traces
Phase 2: SFT/LoRA on high-quality trajectories
Phase 3: RL with real verifier/environment feedback
Phase 4: memory-native model architecture, only after the substrate proves value
```

## Compute Ladder

```text
local prototype:
  Mac + MLX + small models + embeddings

inference lab:
  1-2x L40S/A100/H100 with SGLang or vLLM

SFT/LoRA:
  4-8x A100/H100, 10M-1B curated trajectory tokens

RL/post-training:
  8-64x H100/H200, 100M-10B rollout tokens depending verifier cost

base pretrain:
  100B+ tokens, defer until the memory-native architecture has won smaller tests
```

## Acceptance Criteria

The MVP passes only if:

- a future run can retrieve a prior failed action and avoid repeating it;
- a future run can cite which belief changed because of which observation;
- `.learning` separates source truth from hypothesis from parking;
- Research Vault grounding affects routing without dumping raw vault entries;
- the memory router produces a bounded context pack under a token budget;
- verification can show behavior changed between run N and run N+1.

## Trust Promotion Rule

New memory is not trusted just because an agent wrote it.

Default states:

- `parking`: speculative, never source truth;
- `hypothesis`: usable only with confidence and evidence labels;
- `verified`: can influence the next run after direct proof;
- `trusted`: can become shared future-self context after Supervisor review or
  an equivalent reviewed evidence gate.

The highest-risk mistake is letting a plausible belief become future policy
without proof.

## Open Design Questions

1. Should `.learning` be project-level, agent-private, or both?
2. Should cache compilation happen at session close, session start, or both?
3. What is the smallest control surface needed to inspect active beliefs and
   failure memories?
4. Which runtimes may write `.learning`, and which are read-only?
5. Should Workbench Supervisor review `.learning` deltas before they become
   trusted future-self context?
