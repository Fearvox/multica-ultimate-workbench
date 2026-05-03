---
schema_version: 1
packet_id: no-material-mixed
belief_id: tool-route-terminal-for-system-state
challenger_model: null
generated_at_utc: "2026-05-03T22:20:00Z"
original_claim: "Live system state claims must be checked with terminal commands instead of memory."
confidence_change_allowed: false
alternatives:
  - claim: "The rule may need a narrower note for deterministic arithmetic because calculator tools can also produce current numeric evidence."
    relevance: adjacent
    why_it_might_matter: "It sharpens wording but does not change the safety rule for live system state."
    falsification_test: "Compare tasks involving live OS state against pure arithmetic tasks and confirm they require different tool routes."
    discard_condition: "Discard if the rule is explicitly scoped to OS, disk, ports, processes, dates, or other live system state."
    expected_cost: low
  - claim: "A future voice interface might prefer spoken summaries of system state checks."
    relevance: speculative
    why_it_might_matter: "It is weakly related to output format, not the truth of the tool-route claim."
    falsification_test: "Look for an approved voice-interface requirement that changes evidence collection rather than presentation."
    discard_condition: "Discard if voice output remains presentation-only and terminal evidence collection is unchanged."
    expected_cost: medium
  - claim: "This implies front-end visual checks should avoid browser snapshots."
    relevance: off_scope
    why_it_might_matter: "It shifts from live system state to visual QA, which is a different routing problem."
    falsification_test: "Check whether the original claim mentions browser-visible UI surfaces."
    discard_condition: "Discard because the original claim is about system state, not front-end visual inspection."
    expected_cost: low
hidden_premises:
  - "The task is asking about live system state rather than static files."
untested_boundaries:
  - "Pure arithmetic and deterministic transforms may use non-terminal tools."
retrigger_conditions:
  - "A future task conflates live system state with non-live calculation."
---

This packet should produce FLAG: one adjacent wording boundary and no material blocker.
