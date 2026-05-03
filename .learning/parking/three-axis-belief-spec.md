---
id: spec-three-axis-belief-model-20260503
type: conductor-fuzzy-input
target: Windburn cognitive-cache MVP — belief data model & governance
priority: high
spawned_from:
  - 2026-05-03 windburn trust dogfood session
  - belief: grok-divergence-gate
  - spec: self-consistency-verifier
trustState: parking
confidence: 0.78
explorationMomentum: high
---

# Three-Axis Belief Model — Full Spec

## 1. Problem Collapsed

Agent memory systems collapse three orthogonal signals into one number
(confidence), then wonder why agents repeat mistakes, chase stale leads, and
can't distinguish "true" from "interesting."

The axes are separable. Each has its own governance. The spec codifies that.

## 2. The Three Axes

| Axis | Question | Range | Decay Trigger | Moves Fast? |
|------|----------|-------|--------------|-------------|
| **confidence** | how likely true? | 0.0–1.0 | contradictory evidence | no — external, sparse |
| **trustState** | who validated? | parking / hypothesis / verified / trusted | gate pipeline | no — gated, social |
| **explorationMomentum** | worth chasing? | dormant (0.0) → critical (1.0) | inactivity | yes — auto-decay, daily bleed |

**Non-goal**: these three do not encode belief provenance, versioning, or
cross-belief relationships. Those are separate concerns.

## 3. Full Data Model

```ts
// ─── Core Axes ───

type Confidence = number; // 0.0 .. 1.0, 2 decimal places

type TrustState = "parking" | "hypothesis" | "verified" | "trusted";

type ExplorationMomentum = {
  level: "critical" | "high" | "medium" | "low" | "dormant";
  numeric: number;        // 0.0 .. 1.0, derived from level
  declared_by: string;    // agent_id that set it
  declared_at: string;    // ISO 8601
  last_action_at: string | null; // ISO 8601, last exploration action
  decay_history: DecayEvent[];   // ordered, newest last
};

type DecayEvent = {
  from_numeric: number;
  to_numeric: number;
  reason: "inactivity_bleed" | "agent_downgrade" | "supervisor_override" | "action_reset";
  at: string; // ISO 8601
};

// ─── Evidence ───

type EvidenceEntry = {
  id: string;
  source_type: "benchmark" | "experiment" | "review" | "external_observation"
             | "operator_feedback" | "agent_observation" | "rv_citation";
  description: string;
  ref: string | null;      // pointer to artifact (file, issue, commit)
  supports: boolean;       // true = supports belief, false = contradicts
  added_at: string;
};

// ─── Challenge Review ───

type ChallengeReview = {
  challenged_at: string;
  challenged_by: "grok-divergence-pass" | "supervisor" | "operator" | "peer-agent";
  alternatives_generated: number;
  material_alternatives: number;   // classified as "material" after review
  off_scope_alternatives: number;
  falsification_attempted: boolean;
  outcome: "belief_held" | "belief_modified" | "belief_demoted";
  reviewed_by: string;  // agent_id or "supervisor"
};

// ─── Promotion Request ───

type PromotionRequest = {
  requested_state: "verified" | "trusted";
  required_evidence: string[];  // concrete, falsifiable items
  self_consistency_pass: boolean;
  challenge_review: ChallengeReview | null;
};

// ─── Temporal Tracking ───

type AgeBucket = "fresh" | "warm" | "stale" | "cold";

type TemporalState = {
  created_at: string;
  observed_at: string;       // last time belief was read/used
  last_verified_at: string | null;  // null = never externally verified
  last_accessed_at: string;
  age_bucket: AgeBucket;
  bucket_transition_at: string;  // when current bucket started
  staleness_reason: string | null;
};

// ─── The Full Belief ───

type Belief = {
  id: string;
  claim: string;
  evidence: EvidenceEntry[];
  counterEvidence: EvidenceEntry[];  // renamed from "counterEvidence"; same type
  confidence: Confidence;
  trustState: TrustState;
  explorationMomentum: ExplorationMomentum;
  validScope: string;
  decayPolicy: "session" | "project" | "until-contradicted" | "expires";
  temporal: TemporalState;
  promotion_request: PromotionRequest | null;
  lastUpdated: string;
};
```

### 3.1 ExplorationMomentum Numeric Mapping

```ts
const MOMENTUM_MAP: Record<ExplorationMomentum["level"], number> = {
  critical: 1.0,
  high:     0.8,
  medium:   0.5,
  low:      0.25,
  dormant:  0.05,
};
```

## 4. Permission Matrix

Every axis transition has an authorized actor.

### 4.1 Confidence

| Transition | Authorization | Constraint |
|-----------|--------------|------------|
| agent raises | **BLOCKED** | self-serving bias vector |
| agent lowers | **ALLOWED** | agent may downgrade its own confidence |
| peer (Grok) modifies | **BLOCKED** | Grok produces DivergencePacket, not confidence delta |
| verifier blocks claim | **ALLOWED** | if Rule 2 triggered (high conf, no external evidence) |
| verifier lowers | **BLOCKED** | verifier reports, does not mutate |
| Supervisor modifies | **ALLOWED** | any direction, logged |
| external evidence raises | **ALLOWED** | requires at least one source_type ≠ "agent_observation" |

### 4.2 TrustState

| Transition | Authorization | Constraint |
|-----------|--------------|------------|
| agent promotes | **BLOCKED** | self-promotion vector |
| agent demotes | **ALLOWED** | e.g., "I called this verified, I was wrong" |
| peer (Grok) | **BLOCKED** | Grok has no trust authority |
| verifier BLOCK | **ALLOWED** | blocks promotion if rules violated; does not downgrade |
| Supervisor promotes | **ALLOWED** | after challenge review + materiality gate |
| Supervisor demotes | **ALLOWED** | any reason, logged |

### 4.3 ExplorationMomentum

| Transition | Authorization | Constraint |
|-----------|--------------|------------|
| agent declares (any level) | **ALLOWED** | agent owns exploration intent |
| agent downgrades | **ALLOWED** | "never mind, not hot anymore" |
| system clock decays | **ALLOWED** | automatic, see §5 |
| agent action resets | **ALLOWED** | exploration action → momentum refresh |
| peer (Grok) | **BLOCKED** | momentum is attention allocation, not truth |
| Supervisor overrides | **ALLOWED** | any direction, logged — overrides auto-decay |
| verifier flags staleness | **ALLOWED** | §6 Rule 9 (FLAG only, no mutation) |

## 5. Momentum Auto-Decay Algorithm

### 5.1 Age Bucket Determination

```
fresh:  created_at ≤ 3 days ago
warm:   3 days < created_at ≤ 14 days ago
stale:  14 days < created_at ≤ 30 days ago
cold:   created_at > 30 days ago
```

Bucket calculated dynamically; `bucket_transition_at` stores the wall-clock
time when the current bucket was entered.

### 5.2 Decay Schedule

```
fresh (0-3d):
  momentum holds at declared value
  no decay

warm (3-14d):
  IF last_action_at is null
     OR last_action_at < bucket_transition_at
  THEN momentum -= 0.15 * (days_in_bucket / 11)
  reason: "inactivity_bleed"

  IF last_action_at >= bucket_transition_at
  THEN momentum resets to declared value

stale (14-30d):
  momentum -= 0.30 * (days_in_bucket / 16)
  reason: "inactivity_bleed"
  floor: 0.25 (can't go below "low" numeric floor)

cold (30d+):
  momentum -= 0.05 * (days_in_bucket / 7)
  reason: "inactivity_bleed"
  floor: 0.05 (dormant, not zero — don't delete)
```

### 5.3 Exploration Action (Resets Decay)

An exploration action is any logged event of type:

```ts
type ExplorationAction =
  | { type: "grok_divergence_pass_completed"; at: string; packet_id: string }
  | { type: "experiment_run"; at: string; result_ref: string }
  | { type: "benchmark_attached"; at: string; benchmark_ref: string }
  | { type: "operator_review_requested"; at: string }
  | { type: "supervisor_review_passed"; at: string; review_ref: string }
  | { type: "belief_cited_in_decision"; at: string; decision_ref: string }
  | { type: "agent_exploration_log"; at: string; note: string };
```

Any of these sets `explorationMomentum.last_action_at = action.at`, which
resets the decay clock and recalculates momentum from declared level.

### 5.4 CLI

```bash
windburn-momentum-decay <belief-file.md> [--dry-run]

# Prints:
# {
#   "belief_id": "...",
#   "current_momentum": 0.8,
#   "age_bucket": "stale",
#   "days_since_last_action": 17,
#   "decay_applied": -0.32,
#   "new_momentum_numeric": 0.48,
#   "new_momentum_level": "medium",
#   "reason": "inactivity_bleed"
# }
```

`--dry-run` prints what *would* happen, does not write.

## 6. Self-Consistency Verifier (Updated Rule Set)

### 6.1 Rule Table

| # | Rule | Severity |
|---|------|----------|
| 1 | trustState == "verified" requires challenge review record | BLOCK |
| 2 | confidence ≥ 0.80 requires external evidence source_type | BLOCK |
| 3 | promotion_request present requires non-empty required_evidence | BLOCK |
| 4 | trustState ≠ "parking" requires temporal.last_verified_at *field* present | FLAG |
| 5 | confidence ∉ [0.0, 1.0] | BLOCK |
| 6 | trustState == "trusted" requires Supervisor review reference | FLAG |
| 7 | claim.length < 10 or empty | BLOCK |
| 8 | decayPolicy == "session" requires episode reference in evidence | FLAG |
| 9 | explorationMomentum.level ∈ {"high","critical"} AND age_bucket ≠ "fresh" AND last_action_at missing or stale | FLAG |

### 6.2 Rule 9 Detail

```
IF explorationMomentum.level IN ("high", "critical")
   AND temporal.age_bucket NOT IN ("fresh")
   AND (
     explorationMomentum.last_action_at IS NULL
     OR explorationMomentum.last_action_at < temporal.bucket_transition_at
   )
THEN FLAG
REASON: claiming high exploration priority without recent exploration action
FIX: take an exploration action, downgrade momentum, or accept the flag
```

### 6.3 New Constraint: Stateless + One Field

Rule 9 is the only rule that requires one piece of temporal comparison
(`last_action_at` vs `bucket_transition_at`). It does not require the verifier
to:
- track time across runs
- maintain state between invocations
- understand belief *content*

It only reads two fields from the same snapshot. The verifier remains
"snapshot-level" — just the snapshot now includes a timestamp pair.

## 7. State Machine

```text
BELIEF_MINIMAL  (claim + parking + confidence ≤ 0.5 + momentum: agent-set)
  │
  ├─→ agent raises confidence → confidence gate (Rule 2)
  ├─→ agent adds evidence → advances toward hypothesis
  │
  ▼
HYPOTHESIS  (claim + evidence + counterEvidence + confidence explicit + momentum hot?)
  │
  ├─→ verifier passes → eligible for verified request
  ├─→ verifier BLOCK → fix fields, retry
  ├─→ momentum bleeds → FLAG from Rule 9 → agent acts or momentum drops
  │
  ├─→ promotion_request: verified + challenge review
  │
  ▼
VERIFIED  (hypothesis + challenge review passed + external evidence attached)
  │
  ├─→ Grok divergence pass → DivergencePacket
  ├─→ Claude materiality review → classify alternatives
  ├─→ promotion_request: trusted + Supervisor reference
  │
  ▼
TRUSTED  (verified + materiality review done + Supervisor approval)
  │
  ├─→ confidence decays on contradictory evidence
  ├─→ momentum auto-decays normally
  ├─→ can be demoted by Supervisor or contradictory evidence cascade
```

### 7.1 Demotion Paths

```text
trusted → verified    contradictory evidence, Supervisor review
trusted → hypothesis  evidence cascade undermines foundation
verified → hypothesis challenge review failed or new counterEvidence
hypothesis → parking  belief abandoned, momentum at dormant
parking   → archived  cold + dormant + no access for 60d
```

## 8. File Layout

```text
.learning/
  beliefs/
    <slug>.md            # one belief per file, frontmatter + body
  sessions/
    YYYY-MM-DD-episode-<slug>.md
  parking/
    <slug>.md            # speculative ideas, never source truth
  source-truth/
    <slug>.md            # repo docs, issue state, RV citations
  failures/
    <slug>.md            # action attempted, observed delta, avoid/retry
  skills/
    <slug>.md            # reusable procedures
  .windburn/
    compiled-context.md  # latest compiled context pack (read-only)
    router-index.json    # keyword → file mapping
```

## 9. CLI Surface

```bash
# Belief lifecycle
windburn-belief create --claim "..." [--momentum high] [--scope "..."]
windburn-belief show <slug>
windburn-belief update <slug> --confidence 0.7 --evidence "..."
windburn-belief promote <slug> --to verified
windburn-belief demote <slug> --to hypothesis --reason "..."
windburn-belief list [--momentum high] [--trustState verified] [--age fresh]

# Momentum decay (runs on read or cron)
windburn-momentum-decay <slug> [--dry-run] [--apply]

# Self-consistency check
windburn-verify <slug> [--format json] [--strict]

# Challenge review (Grok divergence pass trigger)
windburn-challenge <slug> [--model grok-4.3] [--format json]

# Context compilation
windburn-compile [--goal "..."] [--budget 8000] [--format json]

# Decay sweep (all beliefs)
windburn-momentum-sweep [--dry-run] [--apply]
```

All commands: `--help` with examples, `--format json` for structured output,
zero interactive prompts.

## 10. Test Fixtures

### 10.1 Valid Hypothesis (PASS)

```yaml
trustState: hypothesis
confidence: 0.62
counterEvidence:
  - source_type: agent_observation
    supports: false
    description: "no formal benchmark attached yet"
temporal:
  age_bucket: fresh
  last_verified_at: null
explorationMomentum:
  level: high
  last_action_at: 2026-05-03T19:42:48Z
```

Verdict: **PASS** — honest hypothesis, correctly declared, recent action.

### 10.2 False Verified (BLOCK — Rule 1)

```yaml
trustState: verified
confidence: 0.90
counterEvidence: []
# no challenge review markers present
```

Verdict: **BLOCK** — Rule 1 (verified without challenge review).

### 10.3 High Momentum, No Action (FLAG — Rule 9)

```yaml
trustState: hypothesis
confidence: 0.62
explorationMomentum:
  level: high
  last_action_at: null
temporal:
  age_bucket: stale
  bucket_transition_at: 2026-04-18T00:00:00Z
```

Verdict: **PASS** on Rules 1–8, **FLAG** on Rule 9 — high momentum with no
exploration action in a stale belief.

### 10.4 High Confidence, No External Evidence (BLOCK — Rule 2)

```yaml
trustState: hypothesis
confidence: 0.85
evidence:
  - source_type: agent_observation
    supports: true
    description: "I think this is right"
```

Verdict: **BLOCK** — Rule 2 (confidence ≥ 0.80, no external source_type).

### 10.5 Fully Promoted Trusted (PASS)

```yaml
trustState: trusted
confidence: 0.88
evidence:
  - source_type: benchmark
    supports: true
    description: "early-convergence benchmark shows 40% reduction"
  - source_type: review
    supports: true
    description: "Supervisor review #DAS-XXX PASS"
counterEvidence:
  - source_type: experiment
    supports: false
    description: "divergence pass found 2 material alternatives"
challenge_review:
  challenged_at: 2026-05-03T20:00:00Z
  challenged_by: grok-divergence-pass
  alternatives_generated: 7
  material_alternatives: 2
  off_scope_alternatives: 5
  falsification_attempted: true
  outcome: belief_held
  reviewed_by: claude-code
promotion_request:
  requested_state: trusted
  required_evidence:
    - "Supervisor review of challenge review outcome"
  self_consistency_pass: true
explorationMomentum:
  level: low
  numeric: 0.25
  last_action_at: 2026-05-03T20:30:00Z
temporal:
  age_bucket: fresh
  last_verified_at: 2026-05-03T20:00:00Z
```

Verdict: **PASS** — all gates cleared. Fully promoted.

## 11. Out of Scope

- belief provenance and versioning (git history handles this for now)
- cross-belief dependency graph (separate spec)
- belief merging / deduplication
- belief export to Sanity context registry
- remote runtime belief sync (local-first until trust gates proven)
- model training from belief trajectories (Phase 3+)
