---
id: belief-new-today-fixture
claim: A new Windburn belief can enter the write path as an honest hypothesis after passing all nine structural rules.
evidence:
  - source_type: operator_feedback
    supports: true
    description: "Operator requested dogfood verification of the write gate."
counterEvidence:
  - source_type: agent_observation
    supports: false
    description: "No external verifier evidence has been attached yet."
confidence: 0.56
validScope: Windburn trust pipeline verifier fixture
decayPolicy: project
trustState: hypothesis
explorationMomentum:
  level: high
  numeric: 0.8
  declared_by: codex
  declared_at: 2026-05-03T20:00:00Z
  last_action_at: 2026-05-03T20:00:00Z
  decay_history: []
temporal:
  created_at: 2026-05-03T20:00:00Z
  observed_at: 2026-05-03T20:00:00Z
  last_verified_at: null
  last_accessed_at: 2026-05-03T20:00:00Z
  age_bucket: fresh
  bucket_transition_at: 2026-05-03T20:00:00Z
  staleness_reason: new dogfood write-gate fixture
lastUpdated: 2026-05-03T20:00:00Z
---

# New Belief Today Fixture

This fixture proves the write path can accept a new honest hypothesis after the
deterministic self-consistency verifier passes.
