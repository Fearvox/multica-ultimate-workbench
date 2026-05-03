# Windburn Divergence-Gated Trust Promotion Research Packet

Date: 2026-05-03
Status: research packet; not implementation proof
Path: Standard Path unless it mutates live agents, runtimes, Research Vault, or source-truth memory

## Thesis

Windburn v0.2 proves that a local `.learning` substrate can store typed
perceptions, beliefs, failures, source truth, and parking ideas under hard trust
and token-budget rules. The next hard problem is not storage. The next hard
problem is preventing a plausible belief from becoming future policy too early.

The proposed v0.3 research direction is a divergence-gated trust promotion path:
a structurally different challenger expands the hypothesis space before a belief
can move from `verified` to `trusted`.

The challenger can be Grok or another provider, but the role is provider-neutral:
it expands alternatives; it does not judge truth.

## Current Grounding

### Local Workbench evidence

- `docs/windburn-cognitive-cache-direction.md` already defines confidence,
  exploration momentum, immutable time decay, challenger separation, and
  external-verifier-only confidence increase.
- `docs/windburn-cognitive-cache-dispatch.md` already names a challenger slice,
  selector authority boundaries, remote/VM pending-evidence rules, and first
  repair bias around compiler/fixtures.
- `.learning/beliefs/grok-divergence-gate.md` stores the current hypothesis:
  Grok-style divergent reasoning may help defend against premature convergence,
  but only behind materiality review.
- `scripts/test-windburn-verify.mjs` currently passes the local self-consistency
  verifier fixture set.

### Research Vault pressure

Vault status on 2026-05-03: 44 registry entries; relevant categories include
`ai-agents/memory-systems` and `ai-agents/self-evolution`.

Relevant vault entries:

- `20260411-2303-11366-reflexion` - Reflexion shows language feedback stored as
  episodic memory can improve later agent behavior without weight updates. It
  also reports a WebShop failure mode: self-reflection struggles when escaping a
  local minimum requires diverse exploration. This is the strongest direct prior
  for Windburn's failure-memory loop and the strongest argument for adding a
  divergence pass.
- `20260411-competitor-landscape` - agent-memory competitors mostly benchmark
  retrieval quality, while Evensong/Windburn care about memory effect: how
  memory changes behavior. The v0.3 benchmark should therefore measure behavior
  change, not just recall.
- `20260411-2310-08560-memgpt` - MemGPT frames long-term memory as an OS-like
  substrate, but treats memory as mostly neutral. Windburn must treat memory as a
  trust-bearing behavioral input, closer to permissions than storage.
- `20260411-hermes-evensong-synthesis` - memory is framed as belief injection:
  what the agent remembers changes what it believes, and what it believes changes
  what it does.
- `20260411-evensong-first-principles-audit` - the core caution is overclaiming
  causality from weak evidence. Windburn v0.3 should use repeated fixtures,
  alternative hypotheses, and explicit effect measures before claiming a trust
  gate works.

No Research Vault write was performed. This packet is repo-local until a
separate explicit approval authorizes vault storage.

### Web / literature pressure

- Du et al., ICML 2024, "Improving Factuality and Reasoning in Language Models
  through Multiagent Debate": multiple model instances debate over rounds and
  improve factuality/reasoning while reducing hallucinations. This supports the
  value of cross-agent pressure, but it should not be copied as a trust judge.
  Debate converges on an answer; Windburn needs divergence before trust.
- Wang et al., 2022, "Self-Consistency Improves Chain of Thought Reasoning":
  sampling diverse reasoning paths and majority-voting answers improves
  arithmetic and commonsense reasoning. This supports diversity, but majority
  agreement is not enough for memory trust promotion.
- Shinn et al., NeurIPS 2023, "Reflexion": verbal reflection stored in episodic
  memory improves later trials, but WebShop shows reflection can fail when the
  agent needs creative exploration to escape local minima.
- Park et al., UIST 2023, "Generative Agents": memory, reflection, and planning
  improve believable behavior; reflection synthesizes experience into higher
  inferences. This validates the architectural shape but also shows why
  synthesized reflections need trust labels.
- Maharana et al., ACL 2024, LoCoMo: long-term conversational memory benchmarks
  show LLMs still struggle with long-range temporal and causal dynamics even with
  long context or RAG. Windburn should not assume retrieval alone solves belief
  correctness.

## Core Design Claim

Divergence is useful only as a hypothesis-space expansion layer.

Wrong design:

```text
Grok says belief has alternatives -> confidence changes
```

Correct design:

```text
verified belief
  -> divergence challenger emits DivergencePacket
  -> materiality classifier labels alternatives
  -> external verifier resolves material alternatives
  -> Supervisor approves or parks
  -> trusted belief
```

No single model may own the full loop.

## Role Boundaries

| Role | May do | Must not do |
| --- | --- | --- |
| Belief holder / executor | propose belief, act, verify local delta, lower confidence, request promotion | promote itself, reset time decay, ignore counter-evidence |
| Divergence challenger | generate alternatives, hidden premises, untested boundaries, retrigger conditions | raise confidence, lower confidence directly, approve source truth |
| Materiality classifier | label challenger output as material / adjacent / speculative / off_scope | treat novelty as proof |
| External verifier | test material alternatives against repo/tool/web/RV evidence | rely on model agreement alone |
| Supervisor | approve trusted memory delta or park it | approve without evidence path |
| System clock | apply time decay | accept agent recitation as freshness |

## DivergencePacket Contract

```ts
type DivergencePacket = {
  schema_version: 1;
  belief_id: string;
  challenger_model?: string;
  generated_at_utc: string;
  original_claim: string;
  alternatives: AlternativeHypothesis[]; // minimum 2
  hidden_premises: string[];
  untested_boundaries: string[];
  retrigger_conditions: string[];
  confidence_change_allowed: false;
};

type AlternativeHypothesis = {
  claim: string;
  relevance: "direct" | "adjacent" | "speculative" | "off_scope";
  why_it_might_matter: string;
  falsification_test: string;
  discard_condition: string;
  expected_cost: "low" | "medium" | "high";
};
```

Hard rule: a valid DivergencePacket cannot contain a confidence delta, trust
state change, source-truth write, or direct verification verdict.

## Materiality Classifier Contract

Each alternative receives one label:

| Label | Meaning | Action |
| --- | --- | --- |
| material | could change whether the belief should become trusted | BLOCK promotion until resolved |
| adjacent | useful but not required for this promotion | park with revisit trigger |
| speculative | weakly related or evidence-light | park; no trust impact |
| off_scope | not about the original claim | discard with reason |

The classifier must cite the original claim and the specific phrase that makes
the alternative relevant or irrelevant. A vague "interesting" label is invalid.

## Challenge Review Trigger Proposal

The first trigger should be event-driven, not periodic.

```text
trigger:
  belief.trustState == "verified"
  AND promotion_request.requested_state == "trusted"
  AND promotion_request.self_consistency_pass == true
  AND no current challenge_review exists for this promotion request
```

On trigger, `windburn-challenge` should emit a pending `DivergencePacket` and
append no trust mutation. The packet becomes evidence only after a materiality
classifier labels each alternative and an external verifier or Supervisor
resolves material items.

Valid trigger sources:

- explicit Supervisor challenge-review request;
- verified belief promotion request to `trusted`;
- stale high-momentum belief flagged by Rule 9 and selected for renewed
  exploration;
- operator request to stress-test a belief before it affects future policy.

Invalid trigger effects:

- no confidence delta;
- no trustState change;
- no source-truth write;
- no freshness reset;
- no automatic Research Vault write.

## Experiment Design

### Corpus

Start with 20 fixture beliefs across five buckets:

1. tool-route beliefs, e.g. "provider X works for task Y";
2. memory-trust beliefs, e.g. "this failure rule should alter future action";
3. architecture beliefs, e.g. "selector choice may route context but not promote
   trust";
4. remote-runtime beliefs, e.g. "remote output is pending until reviewed";
5. research claims, e.g. "divergence reduces premature convergence".

Each fixture should include:

- original claim;
- evidence list;
- expected trust state;
- seeded hidden flaw or no-flaw label;
- expected materiality outcome;
- expected promotion outcome.

### Conditions

Run each fixture through four conditions:

1. direct promotion baseline;
2. self-consistency-only review;
3. same-model debate/review;
4. model-diverse divergence gate.

The goal is not to prove Grok is superior. The goal is to test whether a
structurally separated challenger catches material alternatives that same-model
or direct promotion misses, while not adding too much false divergence tax.

### Metrics

| Metric | Definition |
| --- | --- |
| material_divergence_yield | material alternatives / all alternatives |
| false_divergence_tax | off_scope + speculative alternatives / all alternatives |
| early_convergence_block_rate | known-bad promotions blocked / known-bad promotions presented |
| good_promotion_survival_rate | known-good promotions still approved / known-good promotions presented |
| repeated_action_regression | future run repeats a known blocked action, yes/no |
| review_cost | tokens + wall time + verifier calls per promotion |
| authority_violation_count | any challenger output directly changes confidence/trust/source truth |

### Acceptance Gate

A first useful v0.3 local harness passes only if:

- authority_violation_count is 0;
- every material alternative has a falsification test and discard condition;
- at least one seeded false promotion is blocked before reaching trusted;
- at least one seeded good promotion survives without being buried by novelty;
- source-truth and confidence increases still require external verification;
- the report labels costs and false-divergence tax instead of hiding them.

This is a research gate, not a production gate. Do not claim Windburn trust
promotion is solved until repeated runs show stable behavior change.

## Implementation Slices

### Slice 1: Schema and fixtures

- Add `DivergencePacket` template.
- Add fixture beliefs with expected materiality outcomes.
- Add invalid examples where challenger output tries to change confidence.

### Slice 2: Local evaluator

- Add a script that validates packet shape, authority boundaries, and materiality
  labels.
- The script should fail when challenger output contains confidence deltas or
  trust-state writes.

### Slice 3: Model-diverse challenger adapter

- Keep provider-neutral interface.
- Grok/xAI is allowed as one challenger backend if available.
- Adapter output is pending evidence only.

### Slice 4: Materiality review

- Classifier prompt/script labels alternatives.
- The classifier can block or park; it cannot promote confidence.

### Slice 5: Behavior-change harness

- Run future-action prompts with and without trusted failure/belief deltas.
- Measure whether the agent avoids a repeated failure and whether it incorrectly
  overreacts to speculative alternatives.

## Suggested Next Issue

Use `issue-templates/windburn-divergence-gate-goal.md`.

One-line goal:

```text
Build Windburn v0.3 divergence-gated trust-promotion research harness
```

## First-Principles Audit

- Vault checked first: yes - vault_status and vault_search were used before web
  synthesis.
- Current repo state checked: yes - branch, head, and existing Windburn files were
  inspected.
- Web sources checked: yes - multiagent debate, Reflexion, self-consistency,
  Generative Agents, and LoCoMo were used as pressure sources.
- Research Vault write: no - blocked by project rule until explicit approval.
- Main inference: divergence is valuable as exploration pressure, not as truth
  authority.
- Main risk: false divergence tax can bury good beliefs unless materiality review
  is strict and cheap.

## Verdict

READY_TO_DISPATCH as a local research harness.

FLAG for empirical proof: the divergence gate is still a hypothesis until a local
fixture corpus shows behavior change and tolerable review cost.
