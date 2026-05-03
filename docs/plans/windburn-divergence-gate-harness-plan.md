# Windburn Divergence-Gate Harness Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a local deterministic harness that tests Windburn v0.3 divergence-gated trust promotion before any Grok/provider integration.

**Architecture:** Keep v0.3 as a local `.learning` fixture harness. Extend the existing Node verifier pattern from `scripts/windburn-verify.mjs`, but do not let any challenger output mutate belief confidence, trust state, source truth, or freshness. The first useful result is a reproducible metrics report over fixture beliefs and divergence packets.

**Tech Stack:** Node.js ESM scripts, markdown files with YAML frontmatter, repo-local fixtures under `.learning/fixtures/divergence-gate/`, no new package dependency unless a later task proves the current frontmatter parser is insufficient.

---

## Constraints

- No Research Vault write.
- No live runtime, agent, autopilot, daemon, Desktop, remote VM, or droplet mutation.
- No Grok/xAI call in the first implementation pass.
- No source-truth write or trust promotion in shared `.learning`.
- The challenger role emits pending evidence only.
- Self-consistency and debate majority vote are not proof.

## Acceptance Gate

The local harness passes only if:

- `authority_violation_count = 0` for valid fixtures.
- Invalid fixtures with confidence/trust/source-truth/freshness mutations fail.
- At least 20 fixture beliefs are present across the five buckets in `docs/windburn-divergence-gated-trust-research.md`.
- Metrics output includes:
  - `material_divergence_yield`
  - `false_divergence_tax`
  - `early_convergence_block_rate`
  - `good_promotion_survival_rate`
  - `repeated_action_regression`
  - `review_cost`
  - `authority_violation_count`
- `node scripts/test-windburn-divergence-gate.mjs` passes.
- Existing `node scripts/test-windburn-verify.mjs` still passes.

---

## Task 1: Create the divergence fixture layout

**Objective:** Create stable paths for v0.3 fixture inputs and expected outputs.

**Files:**
- Create: `.learning/fixtures/divergence-gate/README.md`
- Create: `.learning/fixtures/divergence-gate/beliefs/`
- Create: `.learning/fixtures/divergence-gate/packets/`
- Create: `.learning/fixtures/divergence-gate/expected/`

**Step 1: Create the README**

Content must explain:

- belief fixtures are source inputs;
- packet fixtures are pending challenger outputs;
- expected fixtures define materiality and promotion outcome;
- no fixture may contain secrets, raw transcripts, private screenshots, or live runtime IDs.

**Step 2: Verify layout**

Run:

```bash
test -d .learning/fixtures/divergence-gate/beliefs
test -d .learning/fixtures/divergence-gate/packets
test -d .learning/fixtures/divergence-gate/expected
```

Expected: exit 0.

---

## Task 2: Add the DivergencePacket schema validator

**Objective:** Add a script that validates packet shape and authority boundaries.

**Files:**
- Create: `scripts/windburn-divergence-gate.mjs`
- Test later: `scripts/test-windburn-divergence-gate.mjs`

**CLI contract:**

```bash
node scripts/windburn-divergence-gate.mjs validate-packet --format json .learning/fixtures/divergence-gate/packets/<packet>.md
```

**Required packet frontmatter fields:**

```yaml
schema_version: 1
belief_id: string
challenger_model: string | null
generated_at_utc: ISO-8601 string
original_claim: string
confidence_change_allowed: false
alternatives:
  - claim: string
    relevance: direct | adjacent | speculative | off_scope
    why_it_might_matter: string
    falsification_test: string
    discard_condition: string
    expected_cost: low | medium | high
hidden_premises:
  - string
untested_boundaries:
  - string
retrigger_conditions:
  - string
```

**BLOCK rules:**

- missing required field;
- `schema_version != 1`;
- fewer than 2 alternatives;
- invalid `relevance` or `expected_cost`;
- missing `falsification_test` or `discard_condition`;
- `confidence_change_allowed !== false`;
- any field named or matching:
  - `confidence_delta`
  - `new_confidence`
  - `trustState`
  - `new_trust_state`
  - `source_truth_write`
  - `last_verified_at`
  - `age_bucket`
  - `verdict: verified|trusted|source-truth`

**Output shape:**

```json
{
  "verdict": "PASS | BLOCK",
  "violations": [],
  "warnings": [],
  "packet_id": "...",
  "belief_id": "..."
}
```

**Verification:**

Run with a not-yet-created fixture after Task 3. Expected valid packet: PASS. Expected invalid packet: BLOCK.

---

## Task 3: Add minimal packet fixtures

**Objective:** Prove the validator catches authority violations before building the full corpus.

**Files:**
- Create: `.learning/fixtures/divergence-gate/packets/valid-basic-divergence.md`
- Create: `.learning/fixtures/divergence-gate/packets/invalid-confidence-delta.md`
- Create: `.learning/fixtures/divergence-gate/packets/invalid-trust-promotion.md`

**Valid fixture requirements:**

- two alternatives minimum;
- one `direct`, one `adjacent` or `speculative`;
- `confidence_change_allowed: false`;
- no trust/confidence/source-truth mutation fields.

**Invalid fixture requirements:**

- `invalid-confidence-delta.md` contains `confidence_delta` or `new_confidence`.
- `invalid-trust-promotion.md` contains `new_trust_state: trusted` or equivalent.

**Verification:**

Run:

```bash
node scripts/windburn-divergence-gate.mjs validate-packet --format json .learning/fixtures/divergence-gate/packets/valid-basic-divergence.md
node scripts/windburn-divergence-gate.mjs validate-packet --format json .learning/fixtures/divergence-gate/packets/invalid-confidence-delta.md
node scripts/windburn-divergence-gate.mjs validate-packet --format json .learning/fixtures/divergence-gate/packets/invalid-trust-promotion.md
```

Expected:

- valid exits 0 with `PASS`;
- both invalid fixtures exit 2 with `BLOCK`.

---

## Task 4: Add the first automated tests

**Objective:** Make packet validation reproducible.

**Files:**
- Create: `scripts/test-windburn-divergence-gate.mjs`

**Test cases:**

- valid packet exits 0 and returns `PASS`;
- confidence mutation exits 2 and reports an authority violation;
- trust promotion exits 2 and reports an authority violation;
- unknown relevance exits 2;
- missing falsification test exits 2.

**Verification:**

Run:

```bash
node scripts/test-windburn-divergence-gate.mjs
```

Expected:

```text
windburn-divergence-gate fixtures pass
```

---

## Task 5: Add 20 belief fixtures

**Objective:** Build the local corpus before any provider-backed challenger is added.

**Files:**
- Create 20 files under `.learning/fixtures/divergence-gate/beliefs/`

**Buckets:**

1. 4 tool-route beliefs
2. 4 memory-trust beliefs
3. 4 architecture beliefs
4. 4 remote-runtime beliefs
5. 4 research-claim beliefs

**Each belief fixture frontmatter must include:**

```yaml
id: string
bucket: tool-route | memory-trust | architecture | remote-runtime | research-claim
claim: string
evidence:
  - source_type: agent_observation | review | experiment | benchmark | external_observation | rv_citation
    description: string
counterEvidence: []
confidence: number
trustState: hypothesis | verified
explorationMomentum: low | medium | high
created_at: ISO-8601 string
observed_at: ISO-8601 string
last_verified_at: null | ISO-8601 string
last_accessed_at: ISO-8601 string
age_bucket: fresh | aging | stale | expired
expected:
  seeded_hidden_flaw: true | false
  expected_materiality: material | adjacent | speculative | off_scope | none
  expected_promotion_outcome: block | approve | park
privacy: public-safe | local-only
```

**Verification:**

The test script must count exactly 20 belief fixtures and fail if any bucket has fewer than 4.

---

## Task 6: Add expected materiality fixtures

**Objective:** Make classifier expectations explicit before model output exists.

**Files:**
- Create 20 files under `.learning/fixtures/divergence-gate/expected/`

**Expected fixture shape:**

```yaml
belief_id: string
expected_material_alternatives: number
expected_adjacent_alternatives: number
expected_speculative_alternatives: number
expected_off_scope_alternatives: number
expected_promotion_outcome: block | approve | park
why: string
```

**Verification:**

`node scripts/test-windburn-divergence-gate.mjs` must fail if any belief fixture lacks a matching expected fixture.

---

## Task 7: Add local metrics computation

**Objective:** Produce the first metrics report from fixtures and packet outputs.

**Files:**
- Modify: `scripts/windburn-divergence-gate.mjs`
- Modify: `scripts/test-windburn-divergence-gate.mjs`

**CLI contract:**

```bash
node scripts/windburn-divergence-gate.mjs score-fixtures --format json .learning/fixtures/divergence-gate
```

**Output shape:**

```json
{
  "verdict": "PASS | FLAG | BLOCK",
  "fixture_count": 20,
  "conditions_run": ["fixture-static"],
  "material_divergence_yield": 0.0,
  "false_divergence_tax": 0.0,
  "early_convergence_block_rate": 0.0,
  "good_promotion_survival_rate": 0.0,
  "repeated_action_regression": null,
  "review_cost": {"tokens": 0, "wall_ms": 0, "verifier_calls": 0},
  "authority_violation_count": 0
}
```

**Rule:** static fixture scoring may use `null` or 0 for behavior-only metrics until Task 9 adds simulated conditions, but the keys must exist.

---

## Task 8: Add invalid authority fixtures across all mutation classes

**Objective:** Protect against subtle challenger authority leaks.

**Files:**
- Create invalid packet fixtures for:
  - confidence raise
  - confidence lower
  - trust promotion
  - trust demotion
  - source-truth write
  - freshness reset
  - verifier verdict embedded in challenger packet

**Verification:**

`node scripts/test-windburn-divergence-gate.mjs` must assert all invalid fixtures exit 2 and increment authority-violation accounting.

---

## Task 9: Add condition simulation stubs

**Objective:** Represent the four experimental conditions without calling external models.

**Files:**
- Modify: `scripts/windburn-divergence-gate.mjs`
- Create: `.learning/fixtures/divergence-gate/conditions/README.md`

**Conditions:**

- `direct-promotion-baseline`
- `self-consistency-only-review`
- `same-model-debate-review`
- `model-diverse-divergence-gate`

**Rule:** for the first pass, conditions are deterministic fixture labels, not live model calls.

**Verification:**

`score-fixtures` must emit all four condition names once stubs exist.

---

## Task 10: Add RUN_DIGEST output

**Objective:** Produce a compact closeout artifact for the harness run.

**Files:**
- Modify: `scripts/windburn-divergence-gate.mjs`
- Create output path only when command is run with `--out`, e.g. `.learning/fixtures/divergence-gate/RUN_DIGEST.md`

**CLI contract:**

```bash
node scripts/windburn-divergence-gate.mjs score-fixtures .learning/fixtures/divergence-gate --out .learning/fixtures/divergence-gate/RUN_DIGEST.md
```

**Digest shape:**

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

---

## Task 11: Final verification

**Objective:** Prove the plan was implemented without regressing current verifier behavior.

Run:

```bash
node scripts/test-windburn-verify.mjs
node scripts/test-windburn-divergence-gate.mjs
git diff --check
```

Expected:

```text
windburn-verify fixtures pass
windburn-divergence-gate fixtures pass
```

Then check:

```bash
git status --short --branch
```

Expected: only intentional v0.3 harness files changed.

---

## Follow-up After This Plan Passes

Only after this deterministic local harness passes should the team add:

1. materiality classifier prompt/script;
2. same-model debate baseline adapter;
3. provider-neutral challenger interface;
4. Grok/xAI adapter;
5. optional remote execution through Goal Mode v2 runtime leases.

Do not start with provider integration. Start with authority boundaries and fixtures.
