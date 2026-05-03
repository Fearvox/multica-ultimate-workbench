---
id: dispatch-self-consistency-verifier-20260503
type: conductor-fuzzy-input
target: Windburn cognitive-cache MVP, Slice D (verification fixtures)
priority: high
spawned_from: 2026-05-03 windburn trust dogfood session
trustState: parking
confidence: 0.78
---

# Self-Consistency Verifier — Conductor Fuzzy Input

## Trigger

Dogfood session 2026-05-03: Claude wrote a conversation-derived belief as
`trustState: verified` + `confidence: 0.90`, violating the trust pipeline it
was describing. Operator corrected it to `hypothesis` + `0.62`. This exposed
a missing layer: Windburn has no automated write-time gate that checks whether
a belief's metadata is self-consistent with its content claims.

## Problem (One Sentence)

Agent-generated beliefs can pass structurally invalid trust states through the
pipeline because no syntax-level self-consistency check runs at write time.

## Desired Artefact

A self-consistency verifier that runs at belief write time. Pure structural
check — no model, no semantic understanding, no Grok. Just rules on fields.

## Design Constraints

- **Zero-model**: runs on field values only, no LLM call
- **Write-gate**: blocks or flags at write time, before the belief enters `.learning`
- **Deterministic**: same input → same verdict, every time
- **Reports, not mutates**: flags inconsistencies; does not auto-correct confidence or trust state (that's the agent/Supervisor's job)
- **Lightweight**: CLI or script, single-digit ms, usable in pre-commit hook

## Spec: Inconsistency Rules

The verifier checks N rules. Each rule has a severity: `BLOCK` (reject write) or `FLAG` (allow with warning).

The initial dogfood spec defined Rules 1-8. The three-axis belief model extends
the same zero-model verifier with Rule 9 for stale hot exploration momentum.

### Rule 1: Verified Requires Challenge Review (BLOCK)

```
IF trustState == "verified"
   AND counterEvidence is empty
   AND no challenge review marker exists
THEN BLOCK
REASON: a belief that has never been challenged cannot be "verified"
FIX: attach counterEvidence, challenge_reviewed_at, counterEvidenceReview, or falsification_attempts; otherwise downgrade trustState to "hypothesis"
```

Counter-evidence does not have to exist for a belief to be verified. The hard
requirement is that the belief has been actively challenged or falsification was
attempted. This avoids pushing agents to invent fake counterEvidence just to
pass the verifier.

### Rule 2: High Confidence Requires External Evidence (BLOCK)

```
IF confidence >= 0.80
   AND no evidence entry references a source_type of ("benchmark", "experiment", "review", "external_observation")
THEN BLOCK
REASON: confidence above 0.80 requires at least one piece of external verification
FIX: attach external evidence, or reduce confidence below 0.80
```

### Rule 3: Promotion Request Requires Required-Evidence (BLOCK)

```
IF promotion_request is present
   AND promotion_request.required_evidence is empty
THEN BLOCK
REASON: cannot request promotion without naming what evidence would justify it
FIX: populate required_evidence with at least one concrete item
```

### Rule 4: Staleness Fields Required for Non-Parking Beliefs (FLAG)

```
IF trustState != "parking"
   AND (last_verified_at field is missing OR age_bucket field is missing)
THEN FLAG
REASON: non-parking beliefs need temporal tracking for decay
FIX: populate last_verified_at and age_bucket
```

`last_verified_at: null` is valid for honest hypotheses that have not yet been
externally verified. Missing the field is the inconsistency.

### Rule 5: Confidence Bounds (BLOCK)

```
IF confidence < 0.0 OR confidence > 1.0
THEN BLOCK
REASON: out of bounds
FIX: clamp or re-evaluate
```

### Rule 6: Verified-to-Trusted Gap (FLAG)

```
IF trustState == "trusted"
   AND promotion_request.requested_state != "trusted"
   AND no Supervisor review reference exists in evidence
THEN FLAG
REASON: trusted state requires social verification (Supervisor review or equivalent)
FIX: add review evidence or downgrade to verified
```

### Rule 7: Claim Must Be Present (BLOCK)

```
IF claim is empty or claim.length < 10
THEN BLOCK
REASON: a belief without a substantive claim is not a belief
FIX: write a non-trivial claim
```

### Rule 8: Episodic Beliefs Require Episode Reference (FLAG)

```
IF decayPolicy == "session"
   AND no episodeId reference in evidence
THEN FLAG
REASON: session-scoped beliefs should trace back to the session that produced them
FIX: add episode reference or change decayPolicy
```

### Rule 9: Hot Momentum Requires Recent Action (FLAG)

```
IF explorationMomentum.level is "high" or "critical"
   AND temporal.age_bucket is not "fresh"
   AND (
     explorationMomentum.last_action_at is missing
     OR explorationMomentum.last_action_at < temporal.bucket_transition_at
   )
THEN FLAG
REASON: high exploration priority without recent exploration action
FIX: take an exploration action, downgrade momentum, or accept the flag
```

Rule 9 remains snapshot-level. It does not track state across runs or understand
the belief content; it only compares fields in the same frontmatter block.

## CLI Contract

```bash
windburn-verify <belief-file.md>

# Exit codes:
# 0 = all rules pass
# 1 = one or more FLAG rules triggered (warning, non-blocking)
# 2 = one or more BLOCK rules triggered (write rejected)

# Output format:
# {"verdict": "BLOCK", "violations": [...], "warnings": [...]}
```

`--format json` for structured output, `--strict` to treat FLAG as BLOCK.

## Verification Fixture (Dogfood Case)

Input: the original (pre-correction) `grok-divergence-gate.md` with `trustState: verified, confidence: 0.90, counterEvidence: []`

Expected output:
```
verdict: BLOCK
violations:
  - rule: verified-requires-challenge-review
    severity: BLOCK
    detail: trustState is "verified" but no counter-evidence or challenge review record is present
  - rule: high-confidence-requires-external-evidence
    severity: BLOCK
    detail: confidence 0.90 >= 0.80 with no external evidence source
warnings: []
```

After correction (`trustState: hypothesis, confidence: 0.62, counterEvidence: [...]`):
```
verdict: PASS
violations: []
warnings: []
```

## Scope Boundaries

In scope:
- structural field checks as specified above
- JSON + human-readable output
- verification fixture that replays the dogfood case
- implementation artefacts:
  - `scripts/windburn-verify.mjs`
  - `scripts/windburn-belief-write.mjs`
  - `scripts/windburn-momentum-decay.mjs`
  - `scripts/test-windburn-verify.mjs`
  - `.learning/fixtures/self-consistency/invalid-verified-without-review.md`
  - `.learning/fixtures/self-consistency/corrected-hypothesis.md`
  - `.learning/fixtures/self-consistency/verified-with-external-review.md`
  - `.learning/fixtures/self-consistency/high-momentum-stale-no-action.md`
  - `.learning/fixtures/self-consistency/new-belief-today.md`

Out of scope:
- semantic understanding of belief content
- auto-correction of confidence or trust state
- Grok divergence pass integration
- integration with Workbench Supervisor review flow (separate dispatch)
- `.learning` directory scanning (single-file only for MVP)

## Suggested Routing

Conductor should dispatch as a Standard Path issue with:
- Outer Ring Developer (implementation)
- Slice D verification fixture attachment
- No Heavy Path gates unless the implementation touches remote runtimes

## Related Beliefs

- `.learning/beliefs/grok-divergence-gate.md` — the belief that triggered this spec
- `docs/windburn-cognitive-cache-dispatch.md` — Slice D verification fixtures
