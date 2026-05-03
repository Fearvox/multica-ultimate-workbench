---
id: spec-cross-belief-dependency-20260503
type: conductor-fuzzy-input
target: Windburn cognitive-cache MVP — belief graph
priority: medium
spawned_from:
  - 2026-05-03 windburn trust dogfood session
  - spec: three-axis-belief-model
  - spec: self-consistency-verifier
trustState: parking
confidence: 0.58
explorationMomentum: medium
---

# Cross-Belief Dependency — Full Spec

## 0. Problem

Belief A depends on Belief B. B gets demoted by new evidence. A should ripple,
but the system doesn't know A depends on B.

Without dependency resolution:
- stale composite beliefs persist at high confidence
- demotions are incomplete — surface fixed, foundation unchanged
- agent can hide behind undeclared dependencies

## 1. Dependency Model

### 1.1 Declared, Not Detected

Beliefs declare their dependencies explicitly. The compiler does not infer
dependencies from citation text. Rationale: explicit declaration creates
accountability. If a belief rests on another belief, say so.

### 1.2 Dependency Graph Schema

```ts
type BeliefDependency = {
  dependsOn: string;          // belief_id of the dependency
  relationship: "foundation"  // A is built on B
              | "reinforces"  // A and B are mutually supporting
              | "assumes";    // A takes B as a premise
  strength: number;           // 0.0–1.0, how much A depends on B
  declaredAt: string;         // ISO 8601
  declaredBy: string;         // agent_id
};
```

A belief can depend on multiple others:

```yaml
dependencies:
  - dependsOn: belief-grok-divergence-gate
    relationship: foundation
    strength: 0.80
    declaredAt: 2026-05-03T20:00:00Z
    declaredBy: claude-code
  - dependsOn: belief-reward-hacking-vectors
    relationship: assumes
    strength: 0.60
    declaredAt: 2026-05-03T20:00:00Z
    declaredBy: claude-code
```

### 1.3 Dependency in Belief Frontmatter

Add to the belief schema (§2.1 of SCHEMA.md):

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| dependencies | no | array | BeliefDependency[], empty = no declared deps |

## 2. Demotion Ripple Algorithm

When Belief B is demoted, all beliefs that depend on B are checked.

### 2.1 Ripple Rules

```ts
onDemotion(beliefB, oldTrustState, newTrustState):
  for each beliefA where beliefA.dependsOn includes beliefB.id:
    ripple = dependency.strength * demotionSeverity(oldTrustState, newTrustState)

    if ripple >= 0.50:
      beliefA.confidence *= (1 - ripple * 0.5)
      beliefA.trustState = min(beliefA.trustState, newTrustState)
      // recurses: if beliefA was also demoted, check its dependents

    if ripple >= 0.30 and ripple < 0.50:
      beliefA.confidence *= (1 - ripple * 0.3)
      // trustState unchanged, but flagged for review

    if ripple < 0.30:
      // no action, but dependency noted in temporal.stalenessReason
```

### 2.2 Demotion Severity Table

| Old → New | Severity |
|-----------|----------|
| trusted → verified | 0.30 |
| trusted → hypothesis | 0.60 |
| trusted → parking | 0.90 |
| verified → hypothesis | 0.40 |
| verified → parking | 0.70 |
| hypothesis → parking | 0.25 |

### 2.3 Ripple Depth Limit

Max recursion depth: 3. Beyond depth 3, mark as `dependency_chain_too_deep`
and flag for Supervisor review. Prevents infinite cascades.

### 2.4 Circular Dependency Detection

On belief write, the verifier checks for cycles:

```
IF any dependency chain from A leads back to A
THEN BLOCK
REASON: circular dependency — beliefs cannot mutually found each other
```

## 3. Verifier Rules

### Rule 10: High-Confidence Beliefs Require Foundation (FLAG)

```
IF belief.confidence >= 0.80
   AND belief.trustState IN ("verified", "trusted")
   AND belief.dependencies is empty
THEN FLAG
REASON: a high-confidence verified belief with no declared foundation is
        resting on unstated assumptions
FIX: declare dependencies, or explicitly state "self-evident" with justification
```

This is the enforcement mechanism against the "forget to declare" loophole.
A belief can be self-evident, but the agent must say so explicitly.

### Rule 11: Dependency Integrity (BLOCK)

```
IF belief.dependencies is not empty
   AND any dependency.dependsOn references a belief_id that does not exist
THEN BLOCK
REASON: dangling dependency
FIX: create the missing belief, or remove the dependency
```

### Rule 12: Foundation Trust Mismatch (FLAG)

```
IF belief.trustState == "trusted"
   AND any dependency with relationship == "foundation"
       references a belief with trustState < "verified"
THEN FLAG
REASON: trusted belief rests on an unverified foundation
FIX: promote the foundation belief first, or demote this belief
```

### Rule 13: Dependency Staleness (FLAG)

```
IF belief.dependencies is not empty
   AND any dependency with relationship == "foundation"
       references a belief with ageBucket == "stale" OR ageBucket == "cold"
THEN FLAG
REASON: belief rests on a stale foundation — foundation may have decayed
FIX: verify foundation is still current, or update dependency
```

## 4. Compiler Integration

When the compiler includes a belief in a context pack:

```ts
if belief.dependencies.length > 0:
  // For each foundation dependency:
  if dependency.strength >= 0.50:
    // Include a one-line summary of the foundation belief
    // Does NOT count toward the packed entry — it's a footnote on the main belief
    packedEntry.foundationNote = `${dependency.dependsOn}: ${foundationBelief.claimSummary}`
```

The compiler does not recursively pack all dependencies — that would blow
budget. One-line footnote per strong dependency. The agent can request full
dependency context if needed.

## 5. CLI

```bash
windburn-deps show <belief-id> [--depth 2] [--format json]
# Shows dependency tree up to depth. Depth 0 = direct deps only.

windburn-deps dependents <belief-id> [--format json]
# Shows all beliefs that depend on this one (reverse lookup).

windburn-deps ripple --simulate <belief-id> --from verified --to hypothesis
# Dry-run: what would happen if this belief were demoted? Prints affected
# beliefs and their confidence deltas. Does not write.

windburn-deps cycles [--format json]
# Scans all beliefs for circular dependencies. Prints any found.
```

## 6. Test Fixtures

### 6.1 Valid Dependency Chain

```yaml
# belief-foundation (verified, 0.85)
dependencies: []

# belief-composite (verified, 0.80)
dependencies:
  - dependsOn: belief-foundation
    relationship: foundation
    strength: 0.70
```

Verdict: **PASS** — valid chain. Rule 10: FLAG on belief-foundation (high
confidence, no deps). If belief-foundation justifies "self-evident," flag
clears.

### 6.2 Circular Dependency (BLOCK)

```yaml
# belief-a
dependencies:
  - dependsOn: belief-b
    relationship: foundation
    strength: 0.70

# belief-b
dependencies:
  - dependsOn: belief-a
    relationship: foundation
    strength: 0.70
```

Verdict: **BLOCK** — Rule "circular dependency" (write-time check, not a numbered
verifier rule — enforced by the dependency resolver at write time, not the
stateless verifier).

### 6.3 Trusted on Hypothesis Foundation (FLAG)

```yaml
# belief-trusted (trusted, 0.85)
dependencies:
  - dependsOn: belief-hypothesis  # trustState: hypothesis, confidence: 0.55
    relationship: foundation
    strength: 0.80
```

Verdict: **FLAG** — Rule 12. Trusted belief rests on hypothesis.

### 6.4 Ripple Simulation

```
Input: demote belief-foundation from verified → hypothesis (severity 0.40)
       belief-composite depends on it with strength 0.70

Expected ripple: 0.40 * 0.70 = 0.28
0.28 < 0.30 → no action on belief-composite
But dependency noted in belief-composite.temporal.stalenessReason
```

### 6.5 Strong Ripple

```
Input: demote belief-foundation from verified → parking (severity 0.70)
       belief-composite depends on it with strength 0.80

Expected ripple: 0.70 * 0.80 = 0.56
0.56 >= 0.50 → belief-composite.confidence *= (1 - 0.56 * 0.5)
              = belief-composite.confidence * 0.72
              belief-composite.trustState = min(verified, parking) = parking
```

## 7. Out of Scope

- Cross-entry-type dependencies (belief → source-truth). Beliefs only depend on
  beliefs for now.
- Probabilistic dependency detection from text (declared only, explicit opt-in)
- Dependency versioning (if B changes, does A depend on B@v1 or B@latest?)
- Automatic dependency suggestion during compilation
