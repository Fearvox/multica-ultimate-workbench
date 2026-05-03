---
id: spec-adaptive-compiler-20260503
type: conductor-fuzzy-input
target: Windburn cognitive-cache MVP, Slice C (router prototype)
priority: critical
spawned_from:
  - 2026-05-03 windburn trust dogfood session
  - spec: three-axis-belief-model
  - spec: self-consistency-verifier
  - schema: .learning/SCHEMA.md
trustState: parking
confidence: 0.72
explorationMomentum: high
---

# Adaptive Context Compiler — Full Spec

## 0. Thesis

Most memory systems retrieve what's *similar*. Windburn should retrieve what
would *change behavior.* The compiler is not a RAG wrapper. It is an attention
allocator that learns from its own past selections.

## 1. Core Principle

```text
context pack = MINIMUM entries that maximally change the action distribution
               for THIS goal, given THIS agent's failure history and beliefs.
```

Short: **don't retrieve what the agent knows. Retrieve what the agent forgot
or never learned.**

## 2. Input / Output

### 2.1 Input

```ts
type CompilerInput = {
  goal: string;                    // 1-sentence task description
  goalKeywords: string[];          // extracted or declared
  budget: number;                  // token ceiling for output pack
  agentProfile: {                  // who's asking
    agentId: string;
    runtimeFamily: "codex" | "claude-code" | "hermes";
    sessionType: "fast" | "standard" | "heavy";
  };
  priorCompilations: string[];     // ids of past packs shown to this agent
  feedback: CompilationFeedback[]; // what the agent actually used (may be empty)
};
```

### 2.2 Output

```ts
type ContextPack = {
  packId: string;
  compiledAt: string;
  budgetUsed: number;
  sections: {
    failures: FailureEntry[];      // avoid-repeat items
    contradictions: BeliefEntry[]; // beliefs that challenge naive approach
    sourceTruth: SourceEntry[];    // ground facts
    skills: SkillEntry[];          // known patterns
    support: BeliefEntry[];        // reinforcing beliefs — lowest priority
  };
  exclusionReport: {
    excludedByPrivacy: number;
    excludedByTrustState: number;
    excludedByBudget: number;
    excludedByScope: number;
  };
};
```

## 3. Adaptive Ranking Algorithm

### 3.1 Base Scorer

Each candidate entry gets a composite score:

```ts
score(entry, goal) =
    relevanceScore(entry, goal)        // keyword + scope match
  * priorityWeight(entry.entryType)    // failure > contradiction > source > skill > support
  * recencyBoost(entry.temporal)       // fresh entries weighted higher
  * momentumBoost(entry)               // high-momentum entries pushed up
  * noveltyFactor(entry, priorPacks)   // previously-unseen entries score higher
  * feedbackAdjustment(entry, agentId) // learn from what this agent actually used
```

### 3.2 Priority Weights (Initial)

```
failure:        1.00   // avoid repeat mistakes — highest ROI
contradiction:  0.85   // beliefs that challenge the likely approach
source-truth:   0.60   // grounding facts, not action-changing
skill:           0.40   // known patterns, helpful but additive
support:         0.20   // reinforcing beliefs — lowest, retrieves only if budget permits
```

These weights are **initial**. They adapt per agent and per task type over time.

### 3.3 Recency Boost

```ts
recencyBoost(temporal) =
  ageBucket == "fresh"  → 1.0
  ageBucket == "warm"   → 0.85
  ageBucket == "stale"  → 0.50
  ageBucket == "cold"   → 0.20
```

### 3.4 Momentum Boost

```ts
momentumBoost(entry) =
  entry.explorationMomentum.level == "critical" → 1.15
  entry.explorationMomentum.level == "high"     → 1.05
  entry.explorationMomentum.level == "medium"   → 1.00
  entry.explorationMomentum.level == "low"      → 0.90
  entry.explorationMomentum.level == "dormant"  → 0.70
```

### 3.5 Novelty Factor

An entry previously shown to this agent in a prior pack gets a penalty:

```ts
noveltyFactor(entry, priorPacks) =
  entry.id IN any priorPack.entries → 0.70   // already seen
  entry.id NEVER shown              → 1.00   // fresh to this agent
```

Reasoning: if an agent saw a failure memory last time and still repeated the
mistake, showing it again has diminishing returns. The compiler should try
different entries or reformulate.

If the same failure was shown AND the agent still failed: flag as
`repeated_failure_after_context` — this is a signal that the failure memory
isn't action-guiding enough. It needs rewriting, not re-showing.

### 3.6 Feedback Adjustment (The Adaptive Layer)

This is where the compiler *learns*.

After each compilation, the agent reports which entries it actually *used* —
cited in a decision, referenced before an action, explicitly noted as helpful.

```ts
type CompilationFeedback = {
  packId: string;
  entriesCited: string[];        // ids the agent actually used
  entriesIgnored: string[];      // ids in the pack the agent didn't touch
  entryUsefulness: Record<string, 1|2|3|4|5>; // optional per-entry rating
  taskOutcome: "pass" | "flag" | "block" | "unknown";
  taskDuration: number;          // minutes
};
```

The feedback adjusts two things:

**Per-agent type weights.** If agent X consistently cites failures and ignores
skills, the next compilation for X pushes failures higher and skills lower.

**Per-entry effectiveness.** If an entry was cited and the task passed, its
effectiveness score rises. If cited and the task still failed, the entry may
need reformulation.

The adaptation is incremental and bounded — weights don't swing wildly on one
data point.

```ts
// Exponential moving average, learning rate 0.1
newWeight = oldWeight * 0.9 + observedUtility * 0.1

// observedUtility for a given entry type in a given compilation:
//   (entries of this type cited / entries of this type shown) * (taskOutcome == "pass" ? 1.0 : 0.3)
```

### 3.7 Section Assignment

After scoring, entries are sorted and bucketed into sections:

```ts
for entry in scored:
  if entry.type == "failure" and entry.score > 0:
    sections.failures.push(entry)
  else if entry.isSupportingBelief:
    sections.support.push(entry)       // only if budget remains
  else if entry.isContradictingBelief:
    sections.contradictions.push(entry)
  else if entry.type == "source-truth":
    sections.sourceTruth.push(entry)
  else if entry.type == "skill":
    sections.skills.push(entry)
```

Pack within each section by descending score. Trim at section boundary to fit
total budget.

## 4. Budget Enforcement

### 4.1 Hard Caps

| Session Type | Token Budget |
|-------------|-------------|
| fast | 2,000 |
| standard | 4,000 |
| heavy | 8,000 |

Token count: approximate as `word count * 1.3` for markdown. The compiler
doesn't need a tokenizer — a reasonable proxy is acceptable.

### 4.2 Budget Allocation (Initial)

```
failures:        up to 35% of budget
contradictions:  up to 25%
source-truth:    up to 20%
skills:          up to 15%
support:         remainder (floor 0)
```

If a section is empty, its allocation redistributes to failures and contradictions.

### 4.3 Budget Overrun Protocol

If the top-scoring entries exceed budget:
1. Trim lowest-scoring entries within each section
2. If still over: drop `support` entirely
3. If still over: drop `skills`
4. If still over: drop `source-truth` (agent must ground itself)
5. If still over: drop lowest-scoring `contradictions`
6. If still over: `failures` remain — they're the highest ROI

The last entry before the cut is logged with its score. This is the
`exclusionReport. excludedByBudget` count.

## 5. Exclusion Rules (Hard Blocks)

These entries are NEVER included, regardless of score:

| Reason | Condition |
|--------|-----------|
| privacy | entry contains `privacy: "secret-adjacent"` or `"local-only"` |
| trust floor | belief has `trustState == "parking"` (speculative, not action-guiding) |
| scope mismatch | entry has `validScope` with zero keyword overlap with `goalKeywords` |
| explicit suppress | entry has `compilerSuppress: true` |
| stale + dormant | `ageBucket == "cold"` AND `explorationMomentum.level == "dormant"` |

Privacy and trust-floor exclusions can be overridden with `--include-parking`
or `--include-local` flags. Scope and dormant exclusions are absolute.

## 6. CLI Contract

```bash
windburn-compile \
  --goal "implement windburn self-consistency verifier" \
  --budget 4000 \
  --agent claude-code \
  --session-type standard \
  --format json

# Output: ContextPack JSON to stdout
```

```bash
windburn-compile-feedback \
  --pack-id "pack-2026-05-03-001" \
  --cited "belief-grok-divergence-gate" "spec-self-consistency-verifier" \
  --ignored "skill-rv-query-pattern" \
  --outcome pass

# Updates feedback store. No output on success.
```

```bash
windburn-compile-weights --show --agent claude-code
# Shows current adapted priority weights for this agent.
```

## 7. Feedback Store

Minimal, file-based:

```text
.learning/.windburn/
  compiler-feedback.jsonl    # one line per compilation feedback event
  agent-weights.json         # per-agent, per-type adapted weights
```

`compiler-feedback.jsonl` is append-only. `agent-weights.json` is recalculated
from the full feedback history on each `compile-feedback` call.

## 8. Self-Audit

The compiler tracks its own effectiveness:

```bash
windburn-compile-audit
```

Output:

```json
{
  "totalCompilations": 47,
  "totalFeedbackEvents": 42,
  "avgCitationRate": 0.38,
  "avgSectionCitation": {
    "failures": 0.52,
    "contradictions": 0.44,
    "sourceTruth": 0.31,
    "skills": 0.22,
    "support": 0.09
  },
  "agentBreakdown": {
    "claude-code-01": { "avgCitationRate": 0.41, "topCitedType": "failures" },
    "codex-03": { "avgCitationRate": 0.29, "topCitedType": "source-truth" }
  },
  "weightDrift": {
    "failures": { "initial": 1.00, "current": 1.12, "direction": "up" },
    "support": { "initial": 0.20, "current": 0.08, "direction": "down" }
  }
}
```

If `support` average citation rate stays below 0.10 for 50+ compilations:
the compiler proposes dropping it from the default pack.

## 9. Integration With Trust Pipeline

The compiler reads belief metadata. It does not modify it. But it feeds back
into the pipeline:

- If a failure memory is cited and the agent STILL fails: the compiler raises
  a `FAILURE_MEMORY_INEFFECTIVE` flag. This is input to the trust pipeline —
  the failure memory may need rewriting or demotion.
- If a support belief is consistently ignored: it's contributing to the
  `exclusionReport.excludedByBudget` without value. Proposal: archive or
  downgrade its exploration momentum.
- If the compiler audit shows weight drift > 0.3 from initial: Supervisor
  review triggered.

## 10. Test Fixtures

### 10.1 Baseline Compilation

```
Input: goal="avoid reusing a pattern that failed last session"
       budget=2000, agent=claude-code, session=standard
       .learning/ contains: 1 failure (matching), 3 beliefs (2 support, 1 contradict),
                             2 source-truth, 1 skill

Expected output:
  sections.failures.length == 1        // exactly the matching failure
  sections.contradictions.length == 1   // the contradicting belief
  sections.sourceTruth.length <= 1
  sections.skills.length == 0          // dropped due to budget
  sections.support.length == 0         // dropped due to budget + lowest priority
  exclusionReport.excludedByBudget >= 2
```

### 10.2 Novelty Penalty

```
Input: same goal, same agent, but failure already shown in pack-001
Expected: failure score *= 0.70 (novelty penalty applied)
```

### 10.3 Feedback Adaptation

```
Given: 3 prior compilations where agent cited failures (avg 0.55 citation rate)
       and never cited support beliefs (avg 0.05 citation rate)

After feedback processing:
  failures weight: 1.00 → 1.08 (trending up)
  support weight:  0.20 → 0.13 (trending down)

Next compilation:
  failures get boosted priority
  support is dropped earlier under budget pressure
```

## 11. Out of Scope

- Content-based semantic similarity (keyword + scope match only for initial scoring)
- Cross-agent weight sharing (each agent learns its own weights)
- Compiler-prompted belief rewrites (flag only, no auto-rewrite)
- Real-time compilation (batch, not streaming)
