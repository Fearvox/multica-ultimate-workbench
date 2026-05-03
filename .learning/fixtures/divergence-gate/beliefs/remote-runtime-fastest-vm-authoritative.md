---
id: remote-runtime-fastest-vm-authoritative
bucket: remote-runtime
claim: The fastest remote VM result should be treated as authoritative when local checks are slow.
evidence:
  - source_type: experiment
    description: Remote execution can speed broad test runs and parallel probes.
counterEvidence: []
confidence: 0.43
trustState: hypothesis
explorationMomentum: high
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

# Remote Runtime Fastest Vm Authoritative

Seeded flaw: remote speed does not prove repo anchor, branch, secrets boundary, or deterministic state.
