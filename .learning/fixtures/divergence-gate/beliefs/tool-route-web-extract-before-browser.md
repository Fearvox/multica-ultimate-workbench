---
id: tool-route-web-extract-before-browser
bucket: tool-route
claim: Static documentation lookup should prefer text extraction before interactive browser sessions.
evidence:
  - source_type: agent_observation
    description: Prior agent runs showed plain-text docs are cheaper and more repeatable than browser interaction.
counterEvidence: []
confidence: 0.64
trustState: hypothesis
explorationMomentum: medium
created_at: 2026-05-03T21:00:00Z
observed_at: 2026-05-03T21:00:00Z
last_verified_at: null
last_accessed_at: 2026-05-03T21:00:00Z
age_bucket: fresh
expected:
  seeded_hidden_flaw: true
  expected_materiality: adjacent
  expected_promotion_outcome: park
privacy: public-safe
---

# Tool Route Web Extract Before Browser

Seeded flaw: some modern docs render critical version selectors client-side, so the rule needs a fallback trigger.
