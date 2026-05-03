---
id: spec-verification-harness-20260503
type: conductor-fuzzy-input
target: Windburn cognitive-cache MVP — Slice D (verification fixtures)
priority: high
spawned_from:
  - 2026-05-03 windburn trust dogfood session
  - windburn-cognitive-cache-dispatch.md (Slice D)
  - spec: self-consistency-verifier
  - spec: adaptive-compiler
trustState: parking
confidence: 0.70
explorationMomentum: high
---

# Windburn Verification Harness — Full Spec

## 0. Purpose

Prove the pipeline works end-to-end. Not unit tests. Not spec conformance.
Behavioral proof that a future run makes a different decision because of
.learning context.

## 1. Harness Design

```text
harness/
  fixtures/
    scenario-1-pre-convergence/    # setup state for scenario 1
    scenario-2-rv-routing/          # setup state for scenario 2
    scenario-3-privacy-gate/        # setup state for scenario 3
    scenario-4-source-truth/        # setup state for scenario 4
    scenario-5-budget/              # setup state for scenario 5
  expected/
    scenario-1/run-n-plus-1.md      # expected context pack for run N+1
    scenario-2/route-decision.md    # expected routing decision
    ...
  runner.mjs                        # harness CLI
```

Each scenario defines:
- initial `.learning/` state (seeded beliefs, failures, episodes)
- a task prompt (what the agent is asked to do)
- expected compiler output (context pack)
- expected behavioral outcome (what the agent should do differently)

## 2. Five Scenarios

### Scenario 1: Repeated-Action Failure Avoidance

```
SETUP:
  .learning/failures/tool-a-unsuitable.md:
    stateBefore: "task requires class X operation"
    actionTried: "used tool-a with default config"
    observedDelta: "timeout after 30s, zero results"
    inferredReason: "tool-a lacks class X support"
    trustState: verified
  
  .learning/beliefs/tool-b-preferred.md:
    claim: "tool-b is the correct choice for class X"
    evidence: [benchmark showing tool-b handles class X]
    trustState: verified

TASK: "process a class X dataset and return results"

EXPECTED COMPILER OUTPUT:
  sections.failures: contains tool-a-unsuitable
  sections.contradictions: (none applicable)

EXPECTED BEHAVIOR:
  Agent reads failure memory → skips tool-a → uses tool-b directly
  Without .learning: agent tries tool-a first (default path), fails, retries
```

### Scenario 2: RV-Grounded Architecture Decision

```
SETUP:
  .learning/source-truth/rv-memory-systems.md:
    source: "Research Vault: memory-system-architectures"
    summary: "Retrieval-only memory without trust tiering shows
              premature convergence in 78% of long-running agent tasks"
    lastVerified: 2026-05-01

  .learning/beliefs/training-escalation-premature.md:
    claim: "model training should not be the first response to memory failures"
    evidence: [RV citation showing retrieval-first approach wins at small scale]
    trustState: verified

TASK: "our agent keeps repeating the same mistake, design a fix"

EXPECTED COMPILER OUTPUT:
  sections.sourceTruth: contains rv-memory-systems
  sections.contradictions: contains training-escalation-premature

EXPECTED BEHAVIOR:
  Agent proposes memory-layer fix → cites RV evidence → does NOT escalate to
  "let's fine-tune the model" as first option
```

### Scenario 3: Privacy Gate

```
SETUP:
  .learning/beliefs/secret-adjacent-config.md:
    claim: "production API keys are stored in ~/.secrets/"
    privacy: "secret-adjacent"
    trustState: hypothesis

  .learning/beliefs/public-safe-config.md:
    claim: "config paths should use environment variables"
    privacy: "public-safe"
    trustState: verified

TASK: "how should I configure API access for this project?"

EXPECTED COMPILER OUTPUT:
  sections: does NOT contain secret-adjacent-config
  sections: CONTAINS public-safe-config
  exclusionReport.excludedByPrivacy: 1

EXPECTED BEHAVIOR:
  Agent gives env-var advice → does NOT reference the secret-adjacent path
```

### Scenario 4: Source-Truth Separation

```
SETUP:
  .learning/source-truth/repo-anchor-rule.md:
    source: "AGENTS.md"
    summary: "prefer GitHub repo resource as canonical source"

  .learning/beliefs/local-paths-fine.md:
    claim: "local file:// paths are acceptable as primary evidence"
    trustState: parking
    confidence: 0.3

TASK: "what's the authoritative source for repo-backed tasks?"

EXPECTED COMPILER OUTPUT:
  sections.sourceTruth: contains repo-anchor-rule in labeled section
  sections.support: does NOT contain local-paths-fine (parking, excluded by trust floor)

EXPECTED BEHAVIOR:
  Agent references source-truth section separately → does not treat
  the parking belief as equivalent to the source-truth entry
```

### Scenario 5: Budget Enforcement

```
SETUP:
  50 beliefs, 20 failures, 15 source-truth entries, 10 skills
  All matching the task scope
  Budget: 2000 tokens

TASK: "analyze the current system architecture"

EXPECTED COMPILER OUTPUT:
  total token count ≤ 2000
  sections.support.length == 0 (dropped first under budget pressure)
  exclusionReport.excludedByBudget > 0

EXPECTED BEHAVIOR:
  Compiler trims in priority order: support → skills → source-truth →
  contradictions → failures. Failures are never trimmed.
```

## 3. Harness CLI

```bash
windburn-harness run [--scenario <name>] [--format json]
```

Runs all scenarios (or one). For each:

```
1. Seed .learning/ with scenario fixtures
2. Compile context pack for the task
3. Check compiler output against expected sections
4. Report: PASS (matches expected) / FLAG (partial match) / BLOCK (critical miss)
```

Output:
```json
{
  "harnessRun": "2026-05-03T20:00:00Z",
  "scenarios": {
    "repeated-action-failure-avoidance": {
      "verdict": "PASS",
      "compilerOutput": { "sections": { "failures": ["tool-a-unsuitable"], ... } },
      "checks": [
        { "check": "failure_included", "passed": true },
        { "check": "correct_entry_selected", "passed": true }
      ]
    }
  },
  "summary": { "pass": 5, "flag": 0, "block": 0 }
}
```

## 4. Behavioral Verification (Beyond Compiler)

The compiler check proves the right context was assembled. The behavioral check
proves the right action was taken. This requires an agent run.

For the MVP, behavioral verification is:
- Run the agent with the compiled context pack
- Check the agent's action against expected behavior
- Compare against a baseline run (no .learning context)

```bash
windburn-harness verify-behavior --scenario repeated-action-failure-avoidance
```

This spawns a controlled agent run with the scenario task + compiled context,
then checks the action log for the expected behavioral change.

For Scenarios 1-4, pass condition: agent action matches expected behavior.
For Scenario 5, pass condition: compiler enforces budget (no agent needed).

## 5. Self-Test

The harness tests itself: if `windburn-verify` on the scenario fixtures produces
BLOCK on any fixture, the harness flags the fixture as broken before running.

```bash
windburn-harness preflight
# Runs windburn-verify on all scenario fixtures
# BLOCK on any fixture → harness run aborted
```

## 6. Integration With Dispatch Blocks

```
Block 0 (verifier) → no harness dependency, unit tests sufficient
Block 1 (belief migration) → harness scenarios 1,4 as integration tests
Block 2 (deps) → harness extends with dependency-aware scenarios
Block 3 (compiler) → harness is THE verification gate for ship condition
Block 4 (Grok integration) → harness adds divergence pass scenario
```

The harness is the ship condition for Block 3 (compiler). The compiler doesn't
ship until all 5 scenarios pass.

## 7. Out of Scope

- Agent runtime environment setup (assumes `windburn-compile` is testable in isolation)
- Remote agent verification (local-only for MVP)
- Performance benchmarking (correctness only)
- Adversarial scenario generation (future: use Grok to generate adversarial harness cases)
