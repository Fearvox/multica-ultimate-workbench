# .learning Schema Contract

Schema-as-contract for the `.learning` directory. Humans and verifier both read this.
Adding a new entry type means adding a row to §2, a section to §3, and a rule applicability
entry to §5. The verifier parses this file at startup; schema changes don't require
verifier rebuild.

## 1. Entry Types

| # | Type | Directory | Purpose |
|---|------|-----------|---------|
| 1 | belief | `beliefs/` | Falsifiable claim with evidence, trust state, momentum |
| 2 | episode | `sessions/` | Immutable record of a work session |
| 3 | spec | `parking/` | Design doc awaiting implementation |
| 4 | failure | `failures/` | Action attempted, observed delta, avoid/retry rule |
| 5 | source-truth | `source-truth/` | Ground truth reference (repo doc, RV citation, issue) |
| 6 | skill | `skills/` | Reusable procedure or pattern |

## 2. Frontmatter Schema Per Type

### 2.1 belief

| Field | Required | Type | Nullable | Notes |
|-------|----------|------|----------|-------|
| id | yes | string | no | unique, kebab-case |
| claim | yes | string | no | min 10 chars |
| confidence | yes | number | no | 0.0–1.0, max 2 decimal places |
| trustState | yes | enum | no | parking / hypothesis / verified / trusted |
| explorationMomentum | yes | object | no | see §2.1a |
| evidence | yes | array | no | EvidenceEntry[], min 1 |
| counterEvidence | no | array | yes | EvidenceEntry[], empty=unchallenged |
| challengeReview | no | object | yes | required iff trustState≥verified |
| validScope | yes | string | no | e.g. "Windburn trust pipeline design" |
| decayPolicy | yes | enum | no | session / project / until-contradicted / expires |
| temporal | yes | object | no | see §2.1b |
| promotionRequest | no | object | yes | required iff trustState transition requested |
| lastUpdated | yes | string | no | ISO 8601 |

#### 2.1a explorationMomentum

| Field | Required | Type | Nullable | Notes |
|-------|----------|------|----------|-------|
| level | yes | enum | no | critical / high / medium / low / dormant |
| numeric | yes | number | no | derived from level per §3.1 of three-axis spec |
| declaredBy | yes | string | no | agent_id |
| declaredAt | yes | string | no | ISO 8601 |
| lastActionAt | no | string | yes | null = no exploration action taken yet |
| decayHistory | yes | array | no | DecayEvent[], empty on creation |

#### 2.1b temporal

| Field | Required | Type | Nullable | Notes |
|-------|----------|------|----------|-------|
| createdAt | yes | string | no | ISO 8601 |
| observedAt | yes | string | no | ISO 8601 |
| lastVerifiedAt | no | string | yes | null = never externally verified |
| lastAccessedAt | yes | string | no | ISO 8601 |
| ageBucket | yes | enum | no | fresh / warm / stale / cold |
| bucketTransitionAt | yes | string | no | ISO 8601 |
| stalenessReason | no | string | yes | null = no staleness concern |

### 2.2 episode

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| episodeId | yes | string | YYYY-MM-DD-slug |
| date | yes | string | ISO 8601 date |
| participants | yes | array | string[] |
| topics | yes | array | string[] |

### 2.3 spec

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| id | yes | string | unique, kebab-case |
| type | yes | string | "conductor-fuzzy-input" or future types |
| target | yes | string | what system/component this targets |
| priority | yes | enum | critical / high / medium / low |
| spawnedFrom | yes | array | string[], references to sessions/beliefs |
| trustState | no | enum | parking only for specs |
| confidence | no | number | 0.0–1.0 |
| explorationMomentum | no | object | same schema as belief |

### 2.4 failure

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| id | yes | string | unique, kebab-case |
| stateBefore | yes | string | context before action |
| actionTried | yes | string | exactly what was attempted |
| observedDelta | yes | string | what actually happened |
| inferredReason | yes | string | root cause hypothesis |
| avoidUntil | no | string | condition for avoidance |
| retryCondition | no | string | when to re-attempt |
| trustState | no | enum | parking / hypothesis / verified |
| temporal | yes | object | same schema as belief temporal |

### 2.5 source-truth

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| id | yes | string | unique, kebab-case |
| source | yes | string | file path, URL, or RV citation |
| sourceType | yes | enum | repo_doc / rv_entry / issue / decision_record / external |
| lastVerified | yes | string | ISO 8601 |
| summary | yes | string | 1-3 sentences |
| temporal | yes | object | same schema as belief temporal |

### 2.6 skill

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| id | yes | string | unique, kebab-case |
| name | yes | string | human-readable |
| procedure | yes | string | step-by-step |
| preconditions | no | array | string[] |
| validScope | yes | string | when to use this skill |
| trustState | no | enum | hypothesis / verified / trusted |
| temporal | yes | object | same schema as belief temporal |

## 3. Shared Types

### EvidenceEntry

```yaml
id: string              # unique
sourceType: enum        # benchmark | experiment | review | external_observation
                        # | operator_feedback | agent_observation | rv_citation
description: string     # 1-3 sentences
ref: string | null      # pointer to artifact
supports: boolean       # true = supports claim, false = contradicts
addedAt: string         # ISO 8601
```

### ChallengeReview

```yaml
challengedAt: string            # ISO 8601
challengedBy: enum              # grok-divergence-pass | supervisor | operator | peer-agent
alternativesGenerated: number
materialAlternatives: number
offScopeAlternatives: number
falsificationAttempted: boolean
outcome: enum                   # belief_held | belief_modified | belief_demoted
reviewedBy: string
```

### PromotionRequest

```yaml
requestedState: enum    # verified | trusted
requiredEvidence:       # string[], min 1 entry
  - string
selfConsistencyPass: boolean
challengeReview: ChallengeReview | null
```

### DecayEvent

```yaml
fromNumeric: number
toNumeric: number
reason: enum            # inactivityBleed | agentDowngrade | supervisorOverride | actionReset
at: string              # ISO 8601
```

## 4. Type Conversion Paths

```
parking/spec   →  beliefs/       when implemented & verified
parking/idea   →  beliefs/       when substantiated with evidence
                              OR failures/  when proven to fail
failures/      →  beliefs/       when pattern generalizes beyond single incident
beliefs/       →  source-truth/  when promoted to trusted + reviewed
source-truth/  →  (immutable)    corrections = new source-truth entry, not edit
```

## 5. Verifier Rule Applicability

| Rule # | belief | episode | spec | failure | source-truth | skill |
|--------|--------|---------|------|---------|-------------|-------|
| 1 (verified requires challenge review) | ✓ | — | — | — | — | ✓ |
| 2 (high confidence requires external) | ✓ | — | ✓ | — | — | ✓ |
| 3 (promotion requires evidence) | ✓ | — | — | — | — | ✓ |
| 4 (staleness fields required) | ✓ | — | — | ✓ | ✓ | ✓ |
| 5 (confidence bounds) | ✓ | — | ✓ | — | — | ✓ |
| 6 (trusted requires review) | ✓ | — | — | — | — | ✓ |
| 7 (claim min length) | ✓ | — | — | — | — | — |
| 8 (session-scoped needs episode) | ✓ | — | — | — | — | — |
| 9 (momentum requires recent action) | ✓ | — | ✓ | — | — | — |

## 6. Extension Protocol

To add a new entry:
1. New row in §1 (Entry Types)
2. New column in §5 (Verifier Rule Applicability)
3. New subsection in §2 (Frontmatter Schema)
4. If introducing new shared fields, add to §3

New entry types are valid immediately. Existing verifier rules apply per the
applicability table. If a new type needs a new verifier rule, add the rule to
the verifier spec and this table together — atomic change, single PR.
