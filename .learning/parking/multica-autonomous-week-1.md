---
id: goal-autonomous-week1-20260503
type: goal-mode-v2-dispatch
target: Multica Ultimate Workbench Project
priority: critical
duration: 1 week (2026-05-03 → 2026-05-10)
mode: fully autonomous, adaptive iteration
spawned_from: 2026-05-03 windburn trust dogfood session
trustState: parking
---

# GOAL_MODE_V2 — Windburn Trust Pipeline, Autonomous Week 1

GOAL_MODE_V2: yes
HEAVY_PATH: yes
SELF_AWARENESS_REQUIRED: yes
L2_PRESSURE: yes

## Objective

Build the Windburn cognitive-cache trust pipeline. 7 blocks, dependency-ordered.
Execute adaptively — if a block reveals new information, adjust the plan.
Ship what ships. Flag what can't. Don't spin.

## Block Map (Reference)

```
0. Self-Consistency Verifier      (no prereqs, smallest, fixtures ready)
1. Three-Axis Belief Migration    (prereq: 0)
2. Cross-Belief Dependency        (prereq: 1)
3. Adaptive Compiler MVP          (prereq: 0 + 2)
4. Grok Divergence Pass           (prereq: 1)
5. Verification Harness           (prereq: 0 + 3)
6. Session Extraction             (prereq: 1)
```

## Autonomous Execution Rules

### Pick Next Block

At each iteration:
1. Run `git status --short && git ls-files --others --exclude-standard`
2. Check which blocks have ship-condition evidence
3. Pick the highest-priority ready block (prereqs met, not yet shipped)
4. If multiple ready: prefer smallest scope first

### Execute Block

1. Read the block spec from `.learning/parking/<spec>.md`
2. Read `.learning/SCHEMA.md` for field contracts
3. Implement: code + tests + fixtures
4. Verify against the block's SHIP CONDITION
5. If PASS: commit, mark block shipped
6. If FLAG: note residual risk, commit, mark shipped with caveat
7. If BLOCK: diagnose, flag for operator only if external blocker

### Adapt

- If implementation reveals a spec gap: note it, continue with best judgment,
  propose spec amendment as parking entry
- If a block turns out larger than expected: split into sub-blocks, dispatch
  sub-tasks as child issues
- If two blocks could merge (shared implementation): merge them, note why
- If a block becomes irrelevant: archive it, note why

### Noise Control

- Max 3 active issues at any time
- Dedupe key: block number + spec file hash
- Cooldown: 4h between re-attempts on same block
- Cancel-on-sight: duplicate issues referencing same block

### Report Cadence

Daily RUN_DIGEST:
```text
BLOCKS_SHIPPED: [0, 1]
BLOCKS_IN_PROGRESS: [2]
BLOCKS_BLOCKED: []
ADAPTATIONS: [none | "merged block 2+3", "split block 3 into 3a/3b"]
RESIDUAL_RISK: [any FLAG items]
NEXT: block 2 — cross-belief dependency resolver
```

## Operator Call Conditions

Stop and ask ONLY if:
- Remote runtime mutation needed
- Secret-bearing config access required
- Research Vault write or maintenance run
- Model fine-tuning/training escalation
- Destructive cleanup
- Schema decision that would make .learning private-only by default
- A BLOCK cannot be resolved after 2 attempts with different approaches

Do NOT call for:
- Normal implementation decisions (specs are clear enough)
- Test failures (fix and retry)
- Spec ambiguities (use best judgment, note in parking)
- Block ordering within approved dependency graph

## Success Metric

After 1 week:
- Blocks 0-3 shipped and verified (core pipeline)
- Verification harness (Block 5) running, at minimum scenarios 1+3 passing
- Session extraction (Block 6) at minimum produces valid proposals from dogfood episode
- Grok divergence pass (Block 4) at minimum: packet validation working, integration
  with promotion flow at least specced if not implemented
- Zero operator interventions for non-BLOCK reasons
- All CLIs follow contract: --help, --format json, zero interactive prompts

## Source Files

Read these before starting:
1. `.learning/SCHEMA.md` — the contract
2. `.learning/parking/multica-dispatch-windburn-phase1.md` — full block details
3. `.learning/parking/self-consistency-verifier-spec.md`
4. `.learning/parking/three-axis-belief-spec.md`
5. `.learning/parking/cross-belief-dependency-spec.md`
6. `.learning/parking/adaptive-compiler-spec.md`
7. `.learning/parking/verification-harness-spec.md`
8. `.learning/parking/session-extraction-spec.md`
9. `.learning/beliefs/grok-divergence-gate.md` — context belief
10. `docs/agent-communication-profile.md` — apply before executing

Do NOT read full agent roster, full issue history, raw transcripts, or unrelated branches.

## Non-Negotiables

- Verifier reports only, never mutates confidence/trustState
- Grok/challenger never modifies confidence or trustState
- Momentum auto-decays by system clock; agent declares, clock enforces
- Compiler retrieves what changes behavior, not what's similar
- No remote runtime mutation, no secret capture, no RV writes
- All CLIs: --help with examples, --format json, zero interactive prompts
- All entries through verifier before .learning/ write
