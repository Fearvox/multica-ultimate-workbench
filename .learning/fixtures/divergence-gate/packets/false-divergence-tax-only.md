---
schema_version: 1
packet_id: false-divergence-tax-only
belief_id: research-claim-memory-effect-beats-recall
challenger_model: null
generated_at_utc: "2026-05-03T22:25:00Z"
original_claim: "Memory systems should be judged by whether they change future behavior, not by recall volume alone."
confidence_change_allowed: false
alternatives:
  - claim: "This may imply the UI should show a colorful memory dashboard."
    relevance: off_scope
    why_it_might_matter: "It moves from evaluation criteria to dashboard aesthetics."
    falsification_test: "Check whether the original claim says anything about visual dashboard design."
    discard_condition: "Discard if the original claim is limited to behavioral evaluation of memory systems."
    expected_cost: low
  - claim: "A hypothetical future benchmark might reward poetic explanations of memory."
    relevance: speculative
    why_it_might_matter: "It names no existing benchmark and does not challenge the behavior-change criterion."
    falsification_test: "Search for an approved benchmark spec that scores poetic explanations as memory effectiveness."
    discard_condition: "Discard if no such benchmark is part of the current harness."
    expected_cost: medium
hidden_premises:
  - "The evaluation target is memory utility, not presentation quality."
untested_boundaries:
  - "A product demo may still need recall-volume metrics for explainability."
retrigger_conditions:
  - "A benchmark explicitly rewards non-behavioral memory presentation."
---

This packet should produce PASS: it contains only false divergence tax.
