# Windburn Materiality Classifier Contract

Date: 2026-05-03
Status: spec; not implementation
Depends on: `docs/windburn-divergence-gated-trust-research.md` DivergencePacket contract
Feeds: `docs/plans/windburn-divergence-gate-harness-plan.md` Tasks 6-7

## Purpose

This is the implementable contract for the materiality classifier — the layer
that receives a `DivergencePacket` and labels each alternative hypothesis as
`material`, `adjacent`, `speculative`, or `off_scope`. The classifier is a gate,
not a judge. It decides what must block trust promotion vs. what can be parked
or discarded.

## Role Boundary

| May do | Must not do |
|--------|-------------|
| Label each alternative with one of four classes | Change confidence, trust state, or source truth |
| Cite the specific phrase that makes an alternative relevant or irrelevant | Treat novelty or interestingness as proof |
| Block promotion when material alternatives are unresolved | Resolve alternatives itself (that is the external verifier's job) |
| Park or discard non-material alternatives with stated reasons | Approve promotion on its own authority |
| Return a structured verdict with per-alternative reasoning | Emit a vague "interesting" or "maybe later" label |

The classifier is provider-neutral. It operates on the `DivergencePacket`
shape defined in `docs/windburn-divergence-gated-trust-research.md`. It does
not know or care which model produced the alternatives. "Grok is not judge"
applies transitively: the challenger is not a judge, and the classifier is not
a judge either — the classifier is a router.

---

## Classification Rules

Each alternative receives exactly one label. The rules are applied in order;
the first matching rule wins.

### Rule 1: material — BLOCK promotion

```
IF the alternative could, if true, change whether the
   original belief should become trusted
THEN material
```

Concrete triggers (any one is sufficient):

1. **Claim contradiction**: the alternative asserts something that, if true,
   would make the original claim false, incomplete, or misleading.
2. **Evidence gap**: the alternative identifies a missing piece of evidence
   that the original claim depends on and that has not been verified.
3. **Scope error**: the alternative exposes that the original claim's scope
   is too broad — it holds only under narrower conditions than stated.
4. **Premise failure**: the alternative shows that a hidden premise of the
   original claim does not hold, and the claim collapses without it.
5. **Falsification path exists**: the alternative has a concrete, executable
   falsification test and plausible discard condition.

Action: **BLOCK** promotion until the external verifier resolves the
alternative or the Supervisor accepts a documented risk.

### Rule 2: adjacent — PARK with revisit trigger

```
IF the alternative is relevant to the domain but does not
   challenge the truth of the original claim
THEN adjacent
```

Concrete triggers:

1. **Precision improvement**: the alternative suggests a narrower scope or
   sharper boundary but does not contradict the claim.
2. **Evidence supplement**: the alternative points to additional evidence
   that would strengthen the claim but is not required for it to hold.
3. **Cross-domain connection**: the alternative links to a related belief or
   domain but the link does not affect the current claim's validity.
4. **Forward-looking**: the alternative matters for a future promotion gate
   (e.g., hypothesis → verified) but not for the current (verified → trusted).

Action: **PARK** — record in `.learning/parking/` with a revisit trigger
condition. Do not block promotion. The revisit trigger must name when this
alternative should be re-examined.

### Rule 3: speculative — PARK with no trust impact

```
IF the alternative is weakly related to the claim or lacks
   evidence that would make it testable
THEN speculative
```

Concrete triggers:

1. **No evidence attached**: the alternative is a "what if" without any
   evidence, benchmark, observation, or citation to support it.
2. **Cannot be falsified**: the alternative's falsification test requires
   evidence or conditions that do not currently exist.
3. **Novelty-biased**: the alternative is interesting or high-tension but
   the connection to the original claim is tenuous.
4. **Abstract symmetry**: the alternative mirrors the claim in language but
   carries different meaning or no meaning at all (false symmetry).

Action: **PARK** — record but with `trust_impact: false`. The alternative is
stored for future reference but does not affect the current promotion
decision. It may graduate to `adjacent` or `material` if later evidence
surfaces.

### Rule 4: off_scope — DISCARD with reason

```
IF the alternative does not address the original claim
THEN off_scope
```

Concrete triggers:

1. **Abstraction jump**: the alternative pulls the claim to a scope far beyond
   what is verifiable from the original evidence ("this repo's runtime profile
   should be lean" → "the entire agent OS governance model should be
   redesigned").
2. **Target shift**: the alternative attacks a weakened or adjacent version of
   the claim, not the claim itself (adversarial cosplay).
3. **Wrong domain**: the alternative is about a different belief, system, or
   problem entirely.
4. **Unparseable**: the alternative cannot be evaluated because its claim is
   incoherent or circular.

Action: **DISCARD** — log the reason and do not park. Off-scope alternatives
should not accumulate in `.learning/parking/`. They are counted in
`false_divergence_tax` but impose no further review cost.

---

## Citation Requirement

Every classification must cite the **original claim text** and the **specific
phrase** in the alternative that triggers the classification. A classification
without a citation is invalid.

```
Classification:
  label: material
  original_claim_phrase: "selector choice may route context but not promote trust"
  alternative_phrase: "the selector has no mechanism to enforce this boundary"
  reasoning: the alternative challenges whether the claim's stated boundary is
    mechanically enforceable, which would change whether the belief can be
    trusted as policy.
```

A vague label like "interesting" or "maybe useful" is invalid. The classifier
must state **why this label and not a weaker/stronger one**.

---

## Output Contract

### Per-Alternative Output

```ts
type MaterialityLabel = {
  alternative_index: number;            // 0-based index into packet.alternatives
  label: "material" | "adjacent" | "speculative" | "off_scope";
  original_claim_phrase: string;        // the part of the original claim this addresses
  alternative_phrase: string;           // the part of the alternative that triggered the label
  reasoning: string;                    // why this label, not weaker/stronger
  action: "block" | "park" | "discard";
  revisit_trigger?: string;             // required for adjacent; optional for speculative
};
```

### Aggregate Output

```ts
type MaterialityVerdict = {
  verdict: "PASS" | "BLOCK" | "FLAG";
  belief_id: string;
  packet_id: string;
  material_count: number;
  adjacent_count: number;
  speculative_count: number;
  off_scope_count: number;
  labels: MaterialityLabel[];
  promotion_blocked: boolean;           // true if any material alternative exists
  authority_violation: boolean;         // true if any label tries to change confidence/trust/source-truth
};
```

- `PASS`: no material alternatives; promotion may proceed (Supervisor still approves).
- `BLOCK`: one or more material alternatives exist; promotion is blocked until resolved.
- `FLAG`: no material alternatives but one or more adjacent alternatives
  exist; promotion proceeds with parked follow-ups.

---

## Expected Fixture Schema

Each expected fixture lives under `.learning/fixtures/divergence-gate/expected/`
and pairs with a belief fixture (see `docs/plans/windburn-divergence-gate-harness-plan.md`
Task 5 for belief fixture schema).

### YAML Frontmatter

```yaml
belief_id: string                        # matches belief fixture .id
packet_id: string                        # matches the DivergencePacket fixture id
expected_verdict: PASS | BLOCK | FLAG
expected_material_count: number
expected_adjacent_count: number
expected_speculative_count: number
expected_off_scope_count: number
expected_promotion_outcome: block | approve | park
expected_labels:
  - alternative_index: 0
    expected_label: material
    why: string                          # the expected reasoning for verification
seeded_divergence_tax: number            # expected off_scope + speculative count
why: string                              # human-readable explanation of the expected outcome
```

### Rules for Expected Fixtures

1. **One expected fixture per belief fixture** — `scripts/test-windburn-divergence-gate.mjs`
   must fail if any belief fixture lacks a matching expected fixture.
2. **`expected_material_count` > 0 implies `expected_promotion_outcome: block`** —
   a fixture that expects material alternatives must also expect blocked promotion.
3. **`expected_promotion_outcome: approve` requires `expected_material_count: 0`** —
   no promotion can be approved with unresolved material alternatives.
4. **`expected_labels` is a subset** — the expected fixture only declares labels
   for alternatives where the classification is non-obvious or worth testing.
   The test harness checks that actual labels match expected ones where declared,
   and does not fail on undeclared labels unless they change the verdict.

---

## Reviewer Checklist: Block vs Park

When a human Supervisor or reviewer evaluates the classifier's output, use
this checklist before approving the materiality verdict.

### Block Gates (check each material alternative)

- [ ] Does the alternative's `original_claim_phrase` actually appear in the
  original claim? If not → reclassify as `off_scope` (target shift).
- [ ] Does the alternative have a concrete, executable `falsification_test`?
  If not → reclassify as `speculative` (no falsification path).
- [ ] Does the alternative have a plausible `discard_condition` — something
  that, if observed, would make this alternative irrelevant? If not →
  reclassify as `speculative` (cannot be resolved).
- [ ] Would the alternative, if true, actually change the promotion decision?
  If not → reclassify as `adjacent` (precision, not validity).
- [ ] Is the alternative's `expected_cost` consistent with the claim's
  importance? A `high` cost alternative on a low-stakes claim may warrant
  `adjacent` parking if the marginal trust gain is small.

### Park Gates (check each adjacent/speculative alternative)

- [ ] Does the `revisit_trigger` name a concrete condition (not "someday")?
  - Good: "revisit when benchmark X runs with ≥ 3 trials"
  - Bad: "maybe check this later"
- [ ] Is the parking location correct? `adjacent` goes to `.learning/parking/`
  with a revisit trigger; `speculative` goes to `.learning/parking/` with
  `trust_impact: false`.
- [ ] Could any `speculative` alternative become `material` if one piece of
  evidence were added? If yes → note the missing evidence in the parking
  record.

### Discard Gates (check each off_scope alternative)

- [ ] Is the discard reason specific? "Not about the claim" is insufficient;
  name the scope mismatch. "Alternative addresses agent OS governance; original
  claim is about repo runtime profile."
- [ ] Could this off_scope alternative actually be `adjacent` if reframed?
  If yes → note the reframing but still discard; the classifier evaluates
  what was submitted, not what could have been submitted.

### Authority Violation Check (all alternatives)

- [ ] Does any label statement change confidence? If yes → **BLOCK the
  classifier output**, not just the alternative.
- [ ] Does any label statement change trust state? Same rule.
- [ ] Does any label statement write to source truth? Same rule.
- [ ] Does any label statement claim a provider or model is superior?
  Same rule — the classifier is provider-neutral.

### Final Verdict Check

- [ ] If `material_count > 0` → verdict must be `BLOCK`.
- [ ] If `material_count = 0` and `adjacent_count > 0` → verdict may be
  `FLAG` (promotion proceeds with parked follow-ups).
- [ ] If `material_count = 0` and `adjacent_count = 0` → verdict should be
  `PASS`.
- [ ] `authority_violation` must be `false` for the verdict to stand.

---

## CLI Contract (future implementation)

```bash
node scripts/windburn-divergence-gate.mjs classify --format json \
  --belief .learning/fixtures/divergence-gate/beliefs/<belief>.md \
  --packet .learning/fixtures/divergence-gate/packets/<packet>.md
```

Exit codes:
- `0` = PASS (no material alternatives, no authority violations)
- `1` = FLAG (adjacent or speculative alternatives exist, no material)
- `2` = BLOCK (material alternatives or authority violations)

Output: `MaterialityVerdict` as JSON.

---

## Consistency with "Grok is not judge"

- This contract uses "challenger" throughout, not "Grok." The classification
  rules apply identically whether the challenger is Grok, Claude, a human, or
  a script.
- The classifier does not weight alternatives by which model produced them.
- The classifier does not trust a model's own `relevance` label on its
  alternatives. The classifier re-evaluates every alternative independently.
- The classifier may produce a different label than the challenger's own
  `AlternativeHypothesis.relevance` field. The classifier's label is
  authoritative for the materiality gate.

---

## Residual Design Risks

1. **Classifier prompt drift**: if the classifier is implemented as an LLM
   prompt, the same input may produce different labels across runs. Mitigation:
   the fixture harness must test the classifier against expected labels and
   fail on misclassification of `material` alternatives.
2. **False material tax**: a conservative classifier may label too many
   alternatives as `material`, blocking promotions that should proceed.
   Mitigation: the reviewer checklist includes a "would it actually change the
   decision?" gate.
3. **Parking accumulation**: `adjacent` and `speculative` alternatives can
   accumulate in `.learning/parking/` without bound. Mitigation: revisit
   triggers expire; a future cleanup harness should remove parked alternatives
   whose triggers have passed without escalation.
4. **Boundary between adjacent and speculative**: the distinction between
   "useful but not required" (adjacent) and "weakly related" (speculative) is
   the most subjective boundary in the contract. Mitigation: the citation
   requirement forces the classifier to name what makes the alternative
   adjacent rather than speculative; a reviewer can override.

---

## Verdict

READY_FOR_IMPLEMENTATION as a local deterministic classifier.

FLAG for empirical validation: the classification rules produce correct
materiality labels only after fixture-based testing against the 20-belief
corpus described in `docs/plans/windburn-divergence-gate-harness-plan.md`
Task 5.
