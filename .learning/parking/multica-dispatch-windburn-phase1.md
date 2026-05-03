---
id: dispatch-multica-windburn-phase1-20260503
type: conductor-dispatch
target: Multica Ultimate Workbench Project
priority: critical
depends_on: []
spawned_from: 2026-05-03 windburn trust dogfood session (episode-windburn-trust)
trustState: parking
---

# Multica Dispatch — Windburn Trust Pipeline Phase 1

Seven blocks. Ship in order. Each block closes when its own verification passes.

## Block Map

```
BLOCK 0: Self-Consistency Verifier        (no prereqs)
  ↓
BLOCK 1: Three-Axis Belief Migration      (prereq: Block 0)
  ↓
BLOCK 2: Cross-Belief Dependency          (prereq: Block 1)
  ├─→ BLOCK 3: Adaptive Compiler MVP       (prereq: Block 0 + 2)
  └─→ BLOCK 4: Grok Divergence Pass        (prereq: Block 1)

BLOCK 5: Verification Harness              (prereq: Block 0 + 3)
BLOCK 6: Session Extraction                (prereq: Block 1)
```

Blocks 2 & 4 are parallel once Block 1 lands. Block 3 waits for Block 0 + 2.
Block 5 waits for compiler (Block 3) — needs it to run end-to-end scenarios.
Block 6 is parallel to 2-4 once belief model (Block 1) is stable.
Block 6 feeds the pipeline: extracted entries → verifier → compiler → harness.

---

## BLOCK 0 — Self-Consistency Verifier

PREREQ: none
PRIORITY: critical
SESSION: standard
SPEC: `.learning/parking/self-consistency-verifier-spec.md`
SCHEMA: `.learning/SCHEMA.md`

WHAT
Build `scripts/windburn-verify.mjs`. Reads a single `.learning` belief file,
checks 9 structural rules, outputs PASS/FLAG/BLOCK. Zero-model. Pure field
validation.

RULES
1. trustState=="verified" requires challenge review → BLOCK
2. confidence ≥ 0.80 requires external evidence source_type → BLOCK
3. promotion_request requires non-empty required_evidence → BLOCK
4. trustState≠"parking" requires temporal.last_verified_at field present → FLAG
5. confidence ∉ [0.0, 1.0] → BLOCK
6. trustState=="trusted" requires Supervisor review ref → FLAG
7. claim < 10 chars → BLOCK
8. decayPolicy=="session" requires episode ref → FLAG
9. explorationMomentum level∈{high,critical} + age≠fresh + no recent action → FLAG

VERIFICATION
- Fixture: original grok-divergence-gate with trustState:verified, confidence:0.90,
  counterEvidence:[] → expect BLOCK (rules 1+2)
- Fixture: corrected version with hypothesis, 0.62, counterEvidence present → expect PASS
- Exit code 0 = PASS, 1 = FLAG, 2 = BLOCK
- `--format json` outputs structured JSON

ARTIFACTS
- `scripts/windburn-verify.mjs`
- `scripts/test-windburn-verify.mjs`
- `.learning/fixtures/self-consistency/invalid-verified-without-review.md`
- `.learning/fixtures/self-consistency/corrected-hypothesis.md`
- `.learning/fixtures/self-consistency/verified-with-external-review.md`

SHIP CONDITION: `node scripts/test-windburn-verify.mjs` exits 0

---

## BLOCK 1 — Three-Axis Belief Migration

PREREQ: Block 0 (verifier ready)
PRIORITY: high
SESSION: standard
SPEC: `.learning/parking/three-axis-belief-spec.md`

WHAT
Align existing belief files with the three-axis data model. Add
explorationMomentum fields to all beliefs. Implement `windburn-momentum-decay.mjs`.
Update SCHEMA.md if any field definitions need clarification from implementation
experience.

SUB-TASKS
1. Audit all existing beliefs in `.learning/beliefs/` for field compliance
2. Add missing `explorationMomentum`, `temporal`, `challengeReview` fields
3. Build `scripts/windburn-momentum-decay.mjs` — decay algorithm per §5 of spec
4. Run `windburn-verify` on every belief, fix violations
5. Ensure all beliefs pass all 9 rules

VERIFICATION
- `windburn-verify` passes on all belief files
- `windburn-momentum-decay --dry-run` reports correct decay for a stale belief
- Fixture: belief with momentum high, age stale, no action → expect decay output

ARTIFACTS
- `scripts/windburn-momentum-decay.mjs`
- Updated belief files (field additions only, no claim changes)

SHIP CONDITION: all beliefs pass `windburn-verify` + momentum decay dry-run correct

---

## BLOCK 2 — Cross-Belief Dependency Resolver

PREREQ: Block 1 (belief model stable)
PRIORITY: medium
SESSION: standard
SPEC: `.learning/parking/cross-belief-dependency-spec.md`

WHAT
Add dependency declaration to belief schema. Build cycle detector. Build ripple
simulator. Add verifier rules 10-13.

SUB-TASKS
1. Add `dependencies` field support to SCHEMA.md and verifier
2. Build `scripts/windburn-deps.mjs`:
   - `show <id> --depth N` — dependency tree
   - `dependents <id>` — reverse lookup
   - `ripple --simulate <id> --from X --to Y` — demotion simulation
   - `cycles` — cycle detection
3. Implement verifier rules 10-13:
   - Rule 10: high-confidence verified beliefs need declared foundation → FLAG
   - Rule 11: dangling dependency → BLOCK
   - Rule 12: trusted on unverified foundation → FLAG
   - Rule 13: stale foundation dependency → FLAG
4. Test ripple algorithm with fixtures from spec §6

VERIFICATION
- `windburn-deps cycles` finds a prepared circular dependency
- `windburn-deps ripple --simulate <id> --from verified --to parking` outputs
  correct confidence deltas for dependents
- `windburn-verify` catches: dangling dep, trusted on hypothesis, high conf no deps

ARTIFACTS
- `scripts/windburn-deps.mjs`
- Updated `scripts/windburn-verify.mjs` (rules 10-13)

SHIP CONDITION: all dependency CLI commands pass tests + verifier rules 10-13 active

---

## BLOCK 3 — Adaptive Compiler MVP

PREREQ: Block 0 (verifier) + Block 2 (deps)
PRIORITY: high
SESSION: standard
SPEC: `.learning/parking/adaptive-compiler-spec.md`

WHAT
Build the compiler that produces context packs. Not similarity-based — retrieves
what would change behavior. Adaptive priority weights. Feedback loop.

SUB-TASKS
1. Build `scripts/windburn-compile.mjs`:
   - Accepts --goal, --budget, --agent, --session-type
   - Scores entries per §3 of spec
   - Packs into sections (failures, contradictions, source-truth, skills, support)
   - Budget enforcement with section allocation
   - Exclusion rules (privacy, trust floor, scope, stale+dormant)
2. Build `scripts/windburn-compile-feedback.mjs`:
   - Records which entries were cited/ignored
   - Updates agent weights via EMA
3. Build `scripts/windburn-compile-audit.mjs`:
   - Reports weight drift, citation rates per type
4. Test adaptive behavior: after 3 feedback events, weights shift measurably

VERIFICATION
- Baseline compilation matches fixture expectations (§10.1 of spec)
- Novelty penalty applied on second compilation with same agent
- After simulated feedback (high failure citation, low support citation):
  failure weight > initial, support weight < initial
- Budget overrun trims sections in correct priority order

ARTIFACTS
- `scripts/windburn-compile.mjs`
- `scripts/windburn-compile-feedback.mjs`
- `scripts/windburn-compile-audit.mjs`
- `.learning/.windburn/compiler-feedback.jsonl` (empty seed)
- `.learning/.windburn/agent-weights.json` (default weights)

SHIP CONDITION: compiler-audit shows weight drift after 3+ feedback events

---

## BLOCK 4 — Grok Divergence Pass Integration

PREREQ: Block 1 (belief model)
PRIORITY: medium
SESSION: standard
DEPS: `scripts/windburn-divergence-gate.mjs` (exists, Hermes)
      `docs/windburn-materiality-classifier-contract.md` (exists, Hermes)
SPEC: `.learning/beliefs/grok-divergence-gate.md` (hypothesis, pending verification)

WHAT
Wire the existing divergence gate CLI into the trust promotion pipeline.
When `windburn-verify` finds a belief requesting promotion to `verified`,
trigger a divergence pass. Materiality classifier labels alternatives.
Claude/Supervisor reviews material alternatives before promotion.

SUB-TASKS
1. Build `scripts/windburn-challenge.mjs`:
   - Calls divergence gate with belief as input
   - Receives DivergencePacket
   - Runs materiality classifier on alternatives
   - Outputs structured challenge review
2. Integrate with promotion flow:
   - verifier Rule 1 triggers: "needs challenge review"
   - challenge CLI runs → produces DivergencePacket + materiality labels
   - material alternatives → Supervisor review required
   - non-material → parked or discarded
3. Wire feedback into compiler (entries that pass challenge get momentum reset)
4. Add test: divergence pass on a verified-requested belief produces packet
   with materiality labels, no confidence mutation

VERIFICATION
- `windburn-challenge` produces valid DivergencePacket
- Materiality classifier labels each alternative (material/adjacent/speculative/off_scope)
- No confidence or trustState mutation in packet output
- A promotion attempt with unresolved material alternatives → BLOCKED

ARTIFACTS
- `scripts/windburn-challenge.mjs`
- Updated promotion flow in belief lifecycle

SHIP CONDITION: end-to-end: verifier → challenge → materiality → promotion gate works

---

## BLOCK 5 — Verification Harness

PREREQ: Block 0 (verifier) + Block 3 (compiler)
PRIORITY: high
SESSION: standard
SPEC: `.learning/parking/verification-harness-spec.md`

WHAT
The meta-test. Proves the full pipeline changes agent behavior, not just that
individual CLIs pass. Five end-to-end scenarios with seeded `.learning/` state,
expected compiler output, and expected behavioral change.

SCENARIOS
1. Repeated-action failure avoidance — agent skips tool-a after reading failure memory
2. RV-grounded architecture decision — agent cites RV, doesn't escalate to training
3. Privacy gate — secret-adjacent entries excluded from context pack
4. Source-truth separation — source-truth in labeled section, parking beliefs excluded
5. Budget enforcement — compiler trims in priority order, failures never trimmed

SUB-TASKS
1. Build `scripts/windburn-harness.mjs`:
   - `run [--scenario <name>]` — seeds .learning, compiles, checks output
   - `verify-behavior --scenario <name>` — spawns controlled agent run, checks action
   - `preflight` — runs verifier on all fixtures before harness run
2. Create harness directory with fixtures and expected outputs
3. Run harness against each Block as it ships:
   - Block 0 → preflight only (no compiler yet)
   - Block 1 → scenarios 1, 4 as integration tests
   - Block 3 → FULL harness gate — all 5 scenarios must pass

VERIFICATION
- `windburn-harness preflight` exits 0 (all fixtures valid)
- `windburn-harness run` exits 0 (all 5 scenarios pass)
- For scenario 1: agent with .learning context uses tool-b directly
- For scenario 1 (baseline): agent without .learning tries tool-a first, fails

ARTIFACTS
- `scripts/windburn-harness.mjs`
- `.learning/harness/scenario-1-pre-convergence/`
- `.learning/harness/scenario-2-rv-routing/`
- `.learning/harness/scenario-3-privacy-gate/`
- `.learning/harness/scenario-4-source-truth/`
- `.learning/harness/scenario-5-budget/`
- `.learning/harness/expected/`

SHIP CONDITION: `windburn-harness run` — all 5 PASS

---

## BLOCK 6 — Session Extraction

PREREQ: Block 1 (belief model) — needs stable belief/failure/skill schemas
PRIORITY: high
SESSION: standard
SPEC: `.learning/parking/session-extraction-spec.md`

WHAT
Bridge between narrative sessions and structured .learning entries. An agent
reads a session episode, proposes beliefs/failures/skills/parking entries.
All proposals enter the trust pipeline at `hypothesis` or `parking` — no
auto-promotion, no gate bypass.

This is what closes the loop: "we talked" → "the system learned."

SUB-TASKS
1. Build `scripts/windburn-extract.mjs`:
   - Reads session episode, applies extraction heuristics (§3 of spec)
   - Proposes BeliefProposal, FailureProposal, SkillProposal, ParkingProposal
   - `--dry-run` prints proposals without writing
   - `--since <date>` extracts from all unprocessed episodes since date
2. Track extracted episodes in `.learning/.windburn/extracted-episodes.json`
3. Wire extraction output into verifier (all proposals go through write gate)
4. Idempotency: running twice on same episode detects existing extractions

EXTRACTION SIGNALS (what the agent looks for)
- Belief: "★ Insight" blocks, operator corrections, design decisions with rationale
- Failure: dogfood moments, corrections, "did X → got Y → should have done Z"
- Skill: repeated CLI patterns, demonstrated workflows
- Parking: "revisit later," "out of scope," "future direction"

VERIFICATION
- Extract from `sessions/2026-05-03-episode-windburn-trust.md`
- Expected: 1 belief (grok-divergence-gate), 1 failure (self-promotion dogfood),
  4 parking ideas (verifier, three-axis, compiler, deps specs)
- All proposed beliefs pass `windburn-verify`
- Running extraction twice on same episode: second run detects existing, proposes nothing new
- Extracted failure's `inferredReason` matches "agent self-promoted belief without challenge review"

ARTIFACTS
- `scripts/windburn-extract.mjs`
- `.learning/.windburn/extracted-episodes.json` (seed with current episode as already-extracted)

SHIP CONDITION: extraction on dogfood episode produces correct proposals + all pass verifier

---

## Hard Gates (All Blocks)

- Verifier reports only, never mutates confidence/trustState
- Grok/challenger never modifies confidence or trustState
- Momentum auto-decays by system clock; agent declares, clock enforces
- Compiler retrieves what changes behavior, not what's similar
- No remote runtime mutation, no secret capture, no RV writes
- All CLIs: `--help` with examples, `--format json`, zero interactive prompts

## Comm Profile

```text
Apply communication profile docs/agent-communication-profile.md.
Tone: human, direct, bilingual, pushback-ok.
```
