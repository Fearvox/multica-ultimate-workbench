# Windburn Divergence-Gate Fixtures

These fixtures exercise the local Windburn v0.3 divergence-gated trust harness.

- `beliefs/` contains source belief inputs used by later harness slices.
- `packets/` contains pending challenger outputs. A packet can expand the
  hypothesis space, but it cannot change confidence, trust state, source truth,
  or freshness.
- `expected/` contains expected materiality and promotion outcomes for later
  evaluator slices.

Fixtures must stay sanitized. Do not store secrets, raw transcripts, private
screenshots, raw request payloads, direct IPs, live runtime IDs, OAuth material,
or partner/internal details here.
