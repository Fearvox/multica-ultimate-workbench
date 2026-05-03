---
id: spec-session-extraction-20260503
type: conductor-fuzzy-input
target: Windburn cognitive-cache MVP — bridge between episodes and beliefs
priority: high
spawned_from:
  - 2026-05-03 windburn trust dogfood session
  - .learning/sessions/2026-05-03-episode-windburn-trust.md (example input)
  - .learning/beliefs/grok-divergence-gate.md (example output)
trustState: parking
confidence: 0.65
explorationMomentum: high
---

# Session Extraction — Full Spec

## 0. Problem

Sessions produce narrative episodes. Beliefs, failures, and skills are structured
entries. The gap: there's no defined process for extracting structured learning
from a session record.

Without extraction:
- sessions pile up as narrative artifacts, never become actionable
- insights from conversation stay locked in prose
- the trust pipeline has nothing to verify because no new beliefs get created

## 1. Design Principle

Extraction is agent-assisted, not automatic. An agent reads the session,
proposes structured entries. Those entries go through the normal trust pipeline
(verifier → challenge review → promotion). No entry bypasses gates just because
it came from a session.

## 2. Input / Output

### Input
- A session episode file (`.learning/sessions/YYYY-MM-DD-episode-*.md`)
- Existing `.learning/` state (for dedup — don't create a belief that already exists)

### Output

```ts
type ExtractionOutput = {
  episodeId: string;
  extractedAt: string;
  extractedBy: string;
  proposals: {
    beliefs: BeliefProposal[];
    failures: FailureProposal[];
    skills: SkillProposal[];
    parking: ParkingProposal[];
    sourceTruthUpdates: SourceTruthProposal[];
  };
  summary: string;  // 1-3 sentences: what was learned
};
```

### Proposal Types

```ts
type BeliefProposal = {
  claim: string;
  evidence: string[];         // references into the episode
  counterEvidence: string[];  // operator pushback, corrections
  suggestedConfidence: number;
  suggestedTrustState: "hypothesis"; // always hypothesis — never auto-promote
  suggestedExplorationMomentum: ExplorationMomentum["level"];
  validScope: string;
  relatesToExisting: string[]; // IDs of existing beliefs this extends/contradicts
};

type FailureProposal = {
  stateBefore: string;
  actionTried: string;
  observedDelta: string;
  inferredReason: string;
  sourceInEpisode: string;  // "Claude wrote belief as verified → operator corrected"
};

type SkillProposal = {
  name: string;
  procedure: string;
  demonstratedInEpisode: string;
};

type ParkingProposal = {
  idea: string;
  trigger: string;
  earliestRevisit: string;
};

type SourceTruthProposal = {
  source: string;
  summary: string;
  action: "create" | "update" | "verify-still-current";
  existingId?: string;
};
```

## 3. Extraction Heuristics

The agent should look for specific signals in the episode:

### Belief Signals
- "the key insight is..." / "★ Insight" blocks
- Operator disagreement or correction ("no, actually...")
- Design decisions with stated rationale
- Claims followed by evidence citation

### Failure Signals
- "Agent did X → got Y result → should have done Z"
- Corrections: "I initially wrote X but that was wrong because Y"
- Dogfood moments: system violated its own rules

### Skill Signals
- Repeated patterns: "here's how to do X" followed by concrete steps
- CLI sequences that solved a non-obvious problem
- Workflows demonstrated successfully

### Parking Signals
- "we should revisit this later"
- "out of scope for now"
- "future direction: ..."

## 4. Anti-Heuristics (Do Not Extract)

- General programming advice ("use const not let")
- Opinions without evidence
- Session metadata (timestamps, participant lists)
- "we discussed X" summaries without a claim
- Operator small talk

## 5. CLI Contract

```bash
windburn-extract <episode-file.md> [--format json] [--dry-run]
```

Dry-run: prints proposals, does not write.

Without dry-run: writes proposed entries to `.learning/` with trustState
set appropriately (hypothesis for beliefs, parking for parking ideas).

```bash
windburn-extract --since 2026-05-01 [--format json]
# Extracts from all unprocessed episodes since date
```

Tracks which episodes have been extracted via `.learning/.windburn/extracted-episodes.json`:

```json
{
  "2026-05-03-episode-windburn-trust": {
    "extractedAt": "2026-05-03T21:00:00Z",
    "extractedBy": "claude-code",
    "proposalsCreated": {
      "beliefs": ["belief-grok-divergence-gate"],
      "failures": [],
      "skills": [],
      "parking": ["self-consistency-verifier-spec", "three-axis-belief-spec",
                   "adaptive-compiler-spec", "cross-belief-dependency-spec"]
    }
  }
}
```

## 6. Extraction + Trust Pipeline

Extracted entries enter the pipeline at the lowest trust tier:

```
extraction → belief (hypothesis, confidence from suggestion, momentum from suggestion)
           → windburn-verify (write gate)
           → if BLOCK: extraction must fix or operator overrides
           → if PASS/FLAG: belief enters .learning, ready for challenge review
```

No extracted entry skips the verifier. The extraction agent's confidence
suggestion is a suggestion — the verifier enforces Rule 2 (external evidence
required for ≥ 0.80).

## 7. Dogfood Example

Input: `sessions/2026-05-03-episode-windburn-trust.md`

Expected extraction:
```json
{
  "beliefs": [
    {
      "claim": "Grok-style divergent reasoning may be a useful structural defense
               against premature convergence in agent memory systems",
      "evidence": ["operator-identified Grok benchmark strengths"],
      "counterEvidence": ["no formal benchmark attached", "Grok failure modes identified"],
      "suggestedConfidence": 0.62,
      "suggestedTrustState": "hypothesis",
      "suggestedExplorationMomentum": "high",
      "validScope": "Windburn trust pipeline design",
      "relatesToExisting": []
    }
  ],
  "failures": [
    {
      "stateBefore": "Claude wrote conversation-derived belief as verified",
      "actionTried": "saved with trustState:verified, confidence:0.90, counterEvidence:[]",
      "observedDelta": "operator corrected to hypothesis + 0.62",
      "inferredReason": "agent self-promoted belief without challenge review — Rule 1 violation",
      "sourceInEpisode": "dogfood correction moment"
    }
  ],
  "parking": [
    {
      "idea": "Self-consistency verifier as zero-model write gate",
      "trigger": "dogfood correction exposed missing verifier layer",
      "earliestRevisit": "immediate — spec written same session"
    }
  ]
}
```

This extraction output exactly matches what we manually created during the
session. The spec formalizes what we did ad-hoc.

## 8. Repeat Extraction Safety

Running extraction twice on the same episode must be idempotent: detect
existing extractions, propose only new entries, flag conflicts.

If a belief with the same claim already exists: show diff, suggest update
instead of create. If the episode has a new counterEvidence for an existing
belief: propose counterEvidence append, not new belief.

## 9. Out of Scope

- Full auto-extraction without agent review (agent-in-the-loop for MVP)
- Cross-episode pattern detection ("over 10 sessions, agent keeps making this mistake")
- Extraction from non-episode sources (code reviews, PR comments, issue threads)
- Belief merging (similar beliefs from different sessions → merge proposal)
