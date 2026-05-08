---
id: spec-windburn-materiality-backend-20260508
type: decision-packet
target: Windburn Materiality Classifier (docs/windburn-materiality-classifier-contract.md), v0.3 promotion gate harness
priority: high
spawned_from:
  - 2026-05-08 Claude cloud research lane first application
  - contract: docs/windburn-materiality-classifier-contract.md
  - placeholder impl: scripts/windburn-materiality-classify.mjs
  - corpus eval entry point: scripts/windburn-materiality-corpus-eval.mjs
trustState: parking
confidence: 0.62
explorationMomentum: high
authority: proposes — does not promote, does not vote, does not mutate trust
---

# Windburn Materiality Classifier — Backend Decision Packet

## 0. What This Packet Is

The Materiality Classifier contract is **READY_FOR_IMPLEMENTATION as a local
deterministic classifier** (`docs/windburn-materiality-classifier-contract.md`
verdict). The current `scripts/windburn-materiality-classify.mjs` is a working
local placeholder that uses a small keyword-and-hint rule set. It satisfies
the CLI contract, exit codes, and JSON output shape — but the decision of
**what kind of classifier the v0.3 promotion gate should ride on long-term**
has not been made.

Three candidate backends are on the table. This packet describes them, scores
them against the contract's authority and stability requirements, and
recommends a path. It does **not** modify the classifier, the contract, or
any belief / trust state. Selection is for Goal Mode v2 / Supervisor.

## 1. Decision Question

> What backend should the Windburn materiality classifier use once the v0.3
> harness exits the placeholder phase?

Constraints inherited from the contract (non-negotiable):

1. **Authority neutrality** — the classifier is a router, not a judge. It must
   not change confidence, trust state, source truth, or freshness. The
   `collectAuthorityViolations` walk in the placeholder enforces this; any
   backend must preserve it.
2. **Provider neutrality** — the classifier may not weight alternatives by
   which model produced them, may not trust the challenger's own
   `relevance` field, and the rules apply identically to Grok / Claude /
   human / script challengers.
3. **Stability against fixture testing** — `test-windburn-materiality-classify.mjs`
   and `test-windburn-promotion-gate.mjs` rely on the classifier producing
   the same label for the same packet across runs. Drift between runs
   invalidates fixture coverage. The contract calls this out as Residual
   Design Risk #1.
4. **Citation requirement** — every label must cite the original-claim
   phrase and the alternative phrase that triggered the label. A backend
   that can produce a label but not a citation does not satisfy the
   contract.

## 2. Candidate Backends

### Candidate A — Local Rule Expansion

Keep the current `windburn-materiality-classify.mjs` shape (zero-deps Node,
deterministic, runs in CI without provider auth) and extend the rule set:

- Replace the small hard-coded keyword arrays in `classifyAlternative`
  (`scripts/windburn-materiality-classify.mjs:280-303`) with a structured
  `rules.json` table per label, each entry being `{phrase, label, citation_template, rule_id}`.
- Add a per-belief-domain dictionary (e.g. trust-pipeline domain has its own
  vocabulary; runtime-hygiene domain has another). Domain selected by the
  belief's `domain` frontmatter field.
- Add a "claim-anchored" check: the alternative's claim must share at least
  one noun-phrase with the original_claim, otherwise default-route to
  `off_scope` regardless of other triggers (this catches "target shift" /
  adversarial cosplay from Rule 4).
- Citation auto-generated from rule match: `{rule_id} matched phrase
  "{matched_text}" in alternative.claim`.
- Corpus eval (`scripts/windburn-materiality-corpus-eval.mjs`) becomes the
  ground truth. A rule change ships only when corpus pass rate ≥ a stated
  floor (e.g. 0.85 across the 20-belief corpus from the harness plan
  Task 5).

**Pros**
- Fully deterministic. Same input → same output, always. Satisfies fixture
  stability with zero effort.
- Zero provider dependency. Runs in any CI, on any machine, with no auth.
- Authority-neutral and provider-neutral by construction — no model is in
  the loop, so neither boundary can be crossed.
- Cheap to debug. A misclassification points at a rule entry; the fix is a
  rule edit, not a prompt re-tune.

**Cons**
- Brittle to paraphrase. "the claim depends on a hidden assumption" and
  "this presupposes X" should both fire `material:premise_failure`, but the
  current keyword list catches only the first.
- Vocabulary growth must be human-curated. As corpus grows from 20 to 200
  beliefs, rule maintenance is real work.
- Cannot handle nuanced cases — when an alternative is a borderline
  precision-improvement-vs-claim-contradiction, a rule cannot reason.

**Cost**
- Implementation: 1 standard-tier session to refactor rules to `rules.json`,
  1 to add domain dictionaries, 1 to add the claim-anchored check.
- Recurring: per-misclassification, ~10 minutes of rule editing + corpus
  re-eval.

**Provider neutrality**: perfect. **Authority risk**: zero by construction.
**Stability**: perfect. **Drift**: zero.

---

### Candidate B — Prompt-Based LLM Classifier

Replace the keyword logic in `classifyAlternative` with a single LLM call per
alternative that takes the contract's classification rules as a system prompt
and the alternative + original_claim as the user message, returning a
structured `MaterialityLabel` JSON.

Concretely:
- New `scripts/windburn-materiality-classify-llm.mjs` (or a `--backend llm`
  flag on the existing script) that wraps a provider-neutral adapter:
  `adapters/materiality-llm-adapter.mjs` exposing `classify(packet) → MaterialityVerdict`.
- The adapter is **not** Claude-specific or Grok-specific. It selects a
  model via a tier name (`materiality-default`) routed through the same
  registry as `docs/claude-workbench-runtime-profile.md` for Claude tasks
  or another provider's profile for non-Claude tasks. The classifier
  contract's "Grok is not judge" extends here: the LLM is router, not judge.
- Authority guard preserved as a post-call validator: the LLM's response is
  walked by `collectAuthorityViolations`; any violation forces `BLOCK` and
  drops the LLM verdict.
- Determinism cap: `temperature: 0`, `seed` fixed where the provider
  exposes it, response_format JSON schema enforced.

**Pros**
- Handles paraphrase and nuance natively. The four-class rule set in the
  contract is exactly the kind of rubric LLMs follow well.
- Citation requirement is easy to satisfy in-prompt — the model can be
  asked to quote the triggering phrase.
- Adapts to corpus growth without rule maintenance.

**Cons**
- **Stability conflict with the contract.** Even at `temperature: 0`, the
  same input can produce different labels across model versions, provider
  releases, and infrastructure changes. The contract's Residual Risk #1
  is exactly this. Fixture tests become sensitive to provider drift.
- Per-call cost. The corpus evaluator runs the classifier across the full
  belief corpus on each evaluation — that's N alternatives × M beliefs per
  run. Cheap at corpus=20, real money at corpus=200+.
- Provider entanglement risk. Even with the adapter, the model used in CI
  is the model used in fixture tests. If the model changes, the fixtures
  drift. The "Grok is not judge" principle is technically preserved
  (model is router not judge), but the workbench has been careful to keep
  the trust pipeline runnable without provider auth, and this candidate
  reverses that.
- Failure modes are non-local. A misclassification cannot be fixed by an
  edit; it requires prompt tuning, model swap, or rule fallback.

**Cost**
- Implementation: 1 standard-tier session to wire the adapter + prompt + JSON
  schema; 1 standard-tier session to bring fixture tests up to provider-drift
  tolerance (golden labels + tolerance for borderline cases).
- Recurring: per-call provider $; on corpus eval scale, this becomes the
  dominant cost of the harness.

**Provider neutrality**: maintainable via adapter, but at risk if a tier
defaults to one model. **Authority risk**: low if the post-call validator
runs. **Stability**: degraded — depends on provider determinism.
**Drift**: real.

---

### Candidate C — Two-Stage Embedding + LLM Tiebreaker

Use a small set of seed exemplars per label (5–10 exemplar alternatives per
class, drawn from `.learning/fixtures/divergence-gate/expected/`), embed them
once, then for each new alternative:

1. Embed the alternative's claim + the original_claim.
2. Compute cosine similarity to each exemplar; the dominant cluster's label
   is the **provisional label**.
3. If the top-2 clusters are within a confidence margin (`material` vs
   `adjacent` is the borderline that matters most), call an LLM tiebreaker
   on those two candidates only.
4. If clusters are unambiguous (margin > threshold), the embedding-only
   label wins; no LLM call.

Concretely:
- `scripts/windburn-materiality-classify.mjs --backend hybrid` with
  `--exemplar-set .learning/fixtures/divergence-gate/exemplars.json` and an
  embedding adapter (the embedding model is treated like the LLM in
  Candidate B — provider-neutral via adapter).
- Exemplars are markdown frontmatter records, hand-curated, version-controlled,
  promoted only via Supervisor review (so the seed is auditable).
- LLM tiebreaker carries the same authority guard from Candidate B.

**Pros**
- LLM cost amortised. On a well-seeded corpus, ≥80% of alternatives resolve
  at the embedding stage with no LLM call.
- Easier to debug than pure prompt-based: a bad classification points at
  either an exemplar gap (add an exemplar) or a borderline (refine the
  margin or the tiebreaker prompt).
- Stability is partial. Embedding-stage labels are stable as long as the
  embedding model is pinned; only borderline cases inherit LLM drift.
- Authority and provider neutrality preserved by adapter pattern.

**Cons**
- Two adapters instead of one (embedding + LLM). Two providers to keep
  pinned across CI runs.
- Exemplar curation is its own quality bar. If exemplars drift from the
  contract's rule definitions, classification drifts silently.
- The borderline detection threshold itself becomes a tunable knob —
  another small surface area for unintended drift.
- Complexity is meaningful: this is the most code, the most adapters, and
  the most "moving parts" of the three.

**Cost**
- Implementation: 2 standard-tier sessions to build the embedding cache,
  exemplar loader, similarity scorer, and tiebreaker fallback; 1 session
  to harden fixture tests against the borderline path.
- Recurring: embedding calls (cheap) + a fraction of LLM calls (Candidate B
  cost × borderline ratio). Realistic estimate: 15–25% of pure-LLM cost on
  a balanced corpus.

**Provider neutrality**: maintained via adapters. **Authority risk**: low
with the post-call validator. **Stability**: high at embedding stage,
degraded at borderlines. **Drift**: bounded to borderline cases.

## 3. Scorecard

Scored against the four contract constraints. 5 = excellent, 1 = poor.

| Constraint | A: Local Rules | B: Pure LLM | C: Embedding + LLM |
| --- | --- | --- | --- |
| Authority neutrality | 5 (by construction) | 4 (needs validator) | 4 (needs validator) |
| Provider neutrality | 5 (no provider) | 3 (adapter helps; tier risk) | 3 (two adapters) |
| Stability vs fixture testing | 5 (deterministic) | 2 (provider drift) | 4 (drift bounded to borderlines) |
| Citation requirement | 4 (rule_id matches phrase) | 4 (in-prompt) | 4 (in-prompt at borderlines, rule-id at non-borderlines) |
| Paraphrase handling | 2 (brittle) | 5 (native) | 4 (good with seeds) |
| Implementation cost | low | medium | medium-high |
| Recurring runtime cost | none | high at corpus scale | low–medium |
| Failure-mode locality | excellent (rule edit) | poor (prompt tune) | medium (exemplar add) |

## 4. Recommendation

**Stage gate, A → C.** Do not run B as a default backend.

1. **Now: harden Candidate A.** Refactor `windburn-materiality-classify.mjs`
   rules to a `rules.json` table with `rule_id` citations, add the
   claim-anchored "shared noun-phrase or default off_scope" check, and add
   per-domain dictionaries. Run the corpus evaluator after each rule batch.
   Stop expansion when corpus pass rate plateaus (the rate stays flat across
   3 consecutive rule edits despite different misclassifications surfacing).
2. **At plateau: introduce Candidate C alongside, not replacing.** Add the
   embedding-only stage as a `--backend hybrid` flag, gated to specific
   domains where rule expansion plateaued. Keep Candidate A as the default
   on the rest of the corpus. The hybrid backend's borderline tiebreaker
   may use an LLM, but that LLM's verdict is **not** authoritative —
   it is treated as a third candidate label; if it disagrees with the
   embedding-only stage by more than the margin, the classifier emits
   `FLAG` rather than `BLOCK` or `PASS`, and the alternative goes to human
   review.
3. **Do not adopt Candidate B as default.** A pure-LLM backend conflicts
   with the contract's stability requirement and with the workbench
   pattern of running the trust pipeline without provider auth in CI.

This stage gate matches the existing `windburn-divergence-gated-trust-research.md`
philosophy: validate cheap deterministic floors first, only buy probabilistic
muscle when the deterministic floor demonstrably caps out.

## 5. Decision Hand-Off

This packet is for **Goal Mode v2 dispatch** (per `docs/windburn-cognitive-cache-dispatch.md`
and `skills/workbench-goal-mode-v2/SKILL.md`). The dispatch layer should:

- Treat the recommendation in §4 as a proposal, not a verdict.
- If accepted, open a Standard-Path issue for §4 step 1 (Candidate A
  hardening). Estimated: 2–3 standard-tier sessions.
- Do **not** dispatch §4 step 2 until step 1's plateau is observed in the
  corpus evaluator output. Plateau is the trigger.
- Carry the Self-Awareness Bootstrap + RV Pressure Check gates from the
  cognitive-cache dispatch contract; this decision is not Heavy, but it is
  load-bearing for the v0.3 harness so it warrants the gates.

## 6. Out Of Scope

- Selecting specific embedding or LLM models. The adapter pattern keeps that
  decision separate; it is downstream of accepting Candidate C.
- Modifying the classification rules in the contract. The four labels and
  their triggers are stable; this packet is about the implementation
  backend, not the rubric.
- Promoting any belief, mutating any trust state, or signing off on any
  v0.3 harness verdict. Those remain external-verifier / Supervisor calls.

## 7. Verification (when this packet is acted on)

A future implementation session that takes step 1 should be able to verify:

```bash
# rules table exists and is referenced from the script
test -f config/windburn-materiality-rules.json
rg -n "rules\.json" scripts/windburn-materiality-classify.mjs

# corpus evaluator runs and reports a numeric pass rate
node scripts/windburn-materiality-corpus-eval.mjs evaluate --format json \
  --belief-dir .learning/fixtures/divergence-gate/beliefs \
  | jq '.corpus_pass_rate'

# fixture tests still green
node scripts/test-windburn-materiality-classify.mjs

# authority guard still enforced (a packet with confidence_delta blocks)
node scripts/windburn-materiality-classify.mjs classify --format json \
  --packet .learning/fixtures/divergence-gate/packets/invalid-confidence-delta.md
echo $?  # expect 2
```

If any of those fail, the implementation has drifted from the contract and
needs review before the harness depends on it.
