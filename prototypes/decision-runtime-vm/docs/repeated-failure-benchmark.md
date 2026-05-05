# Repeated Failure Submit Benchmark

This fixture-backed benchmark proves a narrow Windburn-style state update inside the local decision-runtime VM.

It models a precondition-gated submit flow where the first predicted action is `click_submit`, the page does not advance, and a missing-answer banner appears. The benchmark passes only when the runtime converts that failed action into durable state and chooses a precondition-satisfying next action instead of repeating submit.

## Purpose

- score state update quality, not just a final answer;
- keep perception, belief, failure, parking, and source-truth separate;
- prove non-repetition after a world-state delta with local deterministic fixtures;
- stay inside the prototype boundary without touching Multica Desktop, daemon state, GitHub, live CAPY, native app code, or files outside `prototypes/decision-runtime-vm/`.

## Fixture Shape

```text
fixtures/
  repeated-failure-submit.context.json
  repeated-failure-submit.evidence.json
```

`repeated-failure-submit.context.json` defines the scenario, initial prediction, starting precondition state, parked speculative analogue, and fixture fact IDs that may be cited by the local source-truth boundary.

`repeated-failure-submit.evidence.json` defines the observed delta after `click_submit`: the page does not advance, the missing-answer banner appears, and the banner text is available as fixture evidence. The runtime still records that delta as `perception`; the source-truth object only references fixture-backed fact IDs and file provenance.

## Scoring Criteria

The benchmark expects these durable updates after the first failed action:

- `perception`: page did not advance; missing-answer error appeared;
- `belief`: submit is blocked because the required answer has not been selected;
- `failure`: do not click submit again until `select_required_answer` satisfies the missing precondition;
- `parking`: any browser-game analogue remains speculative and unpromoted;
- `source_truth`: only fixture facts, never model inference by itself.

A passing run must also reject `click_submit` as the next action and select `select_required_answer` before another submit attempt.

## Source-Truth Boundary

Observed deltas and model interpretations are not source-truth on their own.

In this local fixture:

- source-truth is limited to explicit fixture facts from the context and evidence JSON;
- the belief that submit is blocked is a supported interpretation, not a promoted truth object;
- promotion beyond fixture facts would require explicit human approval.

## Why Local Fixture, Not Live Harness

This benchmark exists to prove decision behavior deterministically.

It is not a live browser or UI harness because the target question is whether the runtime updates state correctly after failure, not whether selectors, network timing, or external systems behave correctly. A live harness would add nondeterministic surface area that does not improve this specific proof.

## Memory Surface Note

Markdown today: durable, reviewable, GitHub-native memory surface.

Cutdown later: possible app-native structured document / agent-readable AST substrate when parser/tooling exists.

Cutdown remains a draft, pre-1.0, future-fuzzy spike candidate only. This benchmark does not migrate existing docs, add a parser, or add a dependency.
