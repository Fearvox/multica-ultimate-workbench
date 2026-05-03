# Windburn v0.3 Divergence-Gated Trust Promotion Goal

```text
/goal
GOAL_MODE: yes
GOAL_MODE_V2: yes
STANDARD_PATH: yes
SELF_AWARENESS_REQUIRED: no unless runtime ownership becomes ambiguous
L2_PRESSURE: yes
```

## RAW_REQUIREMENT

Build the first local research harness for Windburn v0.3 divergence-gated trust
promotion. The harness should test whether a model-diverse challenger can reduce
premature belief convergence without gaining authority over confidence, trust
state, source truth, or time freshness.

## HANDOFF_SUMMARY

Windburn v0.2 proves the local `.learning` substrate. v0.3 should test the next
trust boundary: before a belief moves from `verified` to `trusted`, a challenger
expands the hypothesis space, a materiality classifier decides which alternatives
matter, and an external verifier or Supervisor resolves material blockers.

The challenger may be Grok/xAI if available, but the interface must stay
provider-neutral. Grok is not a judge. Grok produces alternatives only.

## SCOPED_EVIDENCE

Read only as needed:

- `docs/windburn-divergence-gated-trust-research.md`
- `docs/windburn-cognitive-cache-direction.md`
- `docs/windburn-cognitive-cache-dispatch.md`
- `.learning/beliefs/grok-divergence-gate.md`
- `scripts/windburn-verify.mjs`
- `scripts/test-windburn-verify.mjs`
- Research Vault entries:
  - `20260411-2303-11366-reflexion`
  - `20260411-competitor-landscape`
  - `20260411-2310-08560-memgpt`
  - `20260411-hermes-evensong-synthesis`
  - `20260411-evensong-first-principles-audit`
- Web prior art:
  - Du et al. 2024, multiagent debate
  - Wang et al. 2022, self-consistency
  - Shinn et al. 2023, Reflexion
  - Park et al. 2023, Generative Agents
  - Maharana et al. 2024, LoCoMo

## ANTI_OVER_READ

Do not read full issue history, raw transcripts, private screenshots, unrelated
branches, or full agent rosters. Do not scan private memory stores unless the
work proves a specific dependency and the operator approves.

## NON_NEGOTIABLES

- Do not touch Workbench Max.
- Do not mutate Multica daemon, Desktop UI, live runtimes, agents, or autopilots.
- Do not write to Research Vault without separate explicit approval.
- Do not store secrets, OAuth material, raw transcripts, private screenshots, or
  raw request payloads.
- Do not let challenger output change confidence, trust state, freshness, or
  source truth.
- Do not let self-consistency or debate majority vote become proof.
- Do not claim Grok superiority. Test structural separation, not model fandom.
- Do not begin model training, GPU rental, SGLang cluster setup, or MLX training.

## SUCCESS_METRIC

A local prototype exists that can:

1. define and validate `DivergencePacket` schema;
2. run at least 20 fixture beliefs through direct-promotion, self-consistency,
   same-model debate, and model-diverse challenger conditions;
3. classify challenger alternatives as material / adjacent / speculative /
   off_scope;
4. block trust promotion when material alternatives are unresolved;
5. preserve good promotions when challenger output is irrelevant or speculative;
6. prove `authority_violation_count = 0`;
7. report material divergence yield, false divergence tax, early-convergence
   block rate, good-promotion survival rate, repeated-action regression, and
   review cost;
8. produce a compact RUN_DIGEST with PASS / FLAG / BLOCK.

## OPERATOR_CALL_CONDITIONS

Stop and ask the human before:

- any live runtime mutation;
- any remote VM or droplet mutation;
- any Research Vault write;
- any secret-bearing config access;
- any source-truth memory write;
- any trust-state promotion in shared `.learning`;
- any model fine-tuning/training;
- any destructive cleanup.

## REQUIRED_SPEC_PACKET

```text
SPEC_PACKET
objective:
research_question:
fixture_corpus:
conditions:
divergence_packet_schema:
materiality_classifier:
external_verifier_boundary:
metrics:
authority_violation_guards:
operator_call_conditions:
verdict: READY_TO_IMPLEMENT | NEEDS_DESIGN | OPERATOR_NEEDED
```

## REQUIRED_CLOSEOUT

```text
WINDBURN_DIVERGENCE_GATE_CLOSEOUT
goal_id:
changed:
verified:
fixture_count:
conditions_run:
material_divergence_yield:
false_divergence_tax:
early_convergence_block_rate:
good_promotion_survival_rate:
authority_violation_count:
residual_risk:
next_action:
verdict: PASS | FLAG | BLOCK
```
