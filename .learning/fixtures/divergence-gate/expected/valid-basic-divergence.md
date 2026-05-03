---
belief_id: windburn-local-browser-route
packet_id: valid-basic-divergence
expected_verdict: BLOCK
expected_material_count: 1
expected_adjacent_count: 1
expected_speculative_count: 0
expected_off_scope_count: 0
expected_promotion_outcome: block
expected_labels:
  - alternative_index: 0
    expected_label: material
    expected_action: block
    why: "A stale local server would change whether the route claim should be promoted."
  - alternative_index: 1
    expected_label: adjacent
    expected_action: park
    why: "DOM evidence affects verification depth but not the browser-route claim itself."
seeded_divergence_tax: 0
why: "One alternative can change the promotion decision; one only sharpens verification."
---

Expected classifier output for the existing basic divergence packet.
