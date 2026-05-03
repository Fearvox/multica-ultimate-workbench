---
belief_id: tool-route-terminal-for-system-state
packet_id: no-material-mixed
expected_verdict: FLAG
expected_material_count: 0
expected_adjacent_count: 1
expected_speculative_count: 1
expected_off_scope_count: 1
expected_promotion_outcome: approve
expected_labels:
  - alternative_index: 0
    expected_label: adjacent
    expected_action: park
    why: "The arithmetic boundary sharpens scope but does not negate terminal checks for live state."
  - alternative_index: 1
    expected_label: speculative
    expected_action: park
    why: "Voice interface behavior is future-facing and not evidence-changing."
  - alternative_index: 2
    expected_label: off_scope
    expected_action: discard
    why: "Front-end visual QA is outside the original system-state claim."
seeded_divergence_tax: 2
why: "No blocker exists, but one adjacent follow-up should be parked."
---

Expected classifier output for non-material mixed alternatives.
