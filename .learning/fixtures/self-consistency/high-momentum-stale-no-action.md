---
id: belief-high-momentum-stale-no-action-fixture
claim: High exploration momentum should be flagged when a stale belief has no recent exploration action.
evidence:
  - source_type: agent_observation
    supports: true
    description: "Fixture for Rule 9 snapshot-level momentum check."
counterEvidence:
  - source_type: agent_observation
    supports: false
    description: "No external evidence is attached; this remains a hypothesis."
confidence: 0.62
validScope: Windburn trust pipeline verifier fixture
decayPolicy: until-contradicted
trustState: hypothesis
explorationMomentum:
  level: high
  numeric: 0.8
  declared_by: fixture
  declared_at: 2026-04-01T00:00:00Z
  last_action_at: null
  decay_history: []
temporal:
  created_at: 2026-04-01T00:00:00Z
  observed_at: 2026-04-01T00:00:00Z
  last_verified_at: null
  last_accessed_at: 2026-04-01T00:00:00Z
  age_bucket: stale
  bucket_transition_at: 2026-04-15T00:00:00Z
  staleness_reason: stale fixture without recent exploration action
lastUpdated: 2026-04-01T00:00:00Z
---

# High Momentum Stale No Action Fixture

This belief is structurally valid as a hypothesis but should receive Rule 9
warning because it declares hot exploration momentum without a recent action.
