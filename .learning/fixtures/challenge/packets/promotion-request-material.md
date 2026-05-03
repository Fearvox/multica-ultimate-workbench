---
schema_version: 1
packet_id: challenge-promotion-request-material
belief_id: challenge-promotion-request-hypothesis
challenger_model: null
generated_at_utc: "2026-05-03T23:36:00Z"
original_claim: "A local challenge review should run before promoting a Windburn belief to verified."
confidence_change_allowed: false
alternatives:
  - claim: "The belief may be false because promotion could bypass the challenge review when a direct trust write path is used."
    relevance: direct
    why_it_might_matter: "If true, this changes whether the belief should be promoted."
    falsification_test: "Run the write path and confirm whether it rejects promotion without a challenge review reference."
    discard_condition: "Discard only if every promotion path requires a challenge review artifact."
    expected_cost: medium
  - claim: "This may imply challenge summaries need a decorative progress bar."
    relevance: off_scope
    why_it_might_matter: "It shifts from trust-promotion correctness to presentation UI."
    falsification_test: "Check whether the original claim mentions progress bar presentation."
    discard_condition: "Discard if the claim is limited to local promotion gating."
    expected_cost: low
hidden_premises:
  - "All write paths share the same promotion gate."
untested_boundaries:
  - "External Supervisor override is outside this local fixture."
retrigger_conditions:
  - "Rerun when a new belief write path is added."
---

Material challenge fixture: promotion must block for Supervisor materiality review.
