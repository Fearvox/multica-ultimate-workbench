---
id: memory-trust-user-preference-always-promotes
bucket: memory-trust
claim: A direct user preference correction should always become trusted memory immediately.
evidence:
  - source_type: agent_observation
    description: User corrections are usually high-priority durable guidance.
counterEvidence: []
confidence: 0.58
trustState: hypothesis
explorationMomentum: medium
created_at: 2026-05-03T21:00:00Z
observed_at: 2026-05-03T21:00:00Z
last_verified_at: null
last_accessed_at: 2026-05-03T21:00:00Z
age_bucket: fresh
expected:
  seeded_hidden_flaw: true
  expected_materiality: material
  expected_promotion_outcome: block
privacy: local-only
---

# Memory Trust User Preference Always Promotes

Seeded flaw: some corrections are task-local or privacy-sensitive and should not become durable memory.
