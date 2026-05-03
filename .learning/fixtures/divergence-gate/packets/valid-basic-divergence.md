---
schema_version: 1
belief_id: windburn-local-browser-route
challenger_model: null
generated_at_utc: "2026-05-03T21:30:00Z"
original_claim: "Local browser targets should use the dedicated browser-use path before generic web browsing."
confidence_change_allowed: false
alternatives:
  - claim: "The observed failure may come from a stale local dev server rather than an incorrect browser route."
    relevance: direct
    why_it_might_matter: "It would change the next check from tool selection to server health."
    falsification_test: "Run the expected local server command and request the target URL from the same runtime."
    discard_condition: "Discard if the server responds successfully and the route still fails only through the selected browser path."
    expected_cost: low
  - claim: "A screenshot-only check may miss state that needs DOM or console inspection."
    relevance: adjacent
    why_it_might_matter: "It may affect verification depth without changing the route decision."
    falsification_test: "Compare screenshot evidence with DOM text and console output for the same page state."
    discard_condition: "Discard if visual, DOM, and console evidence agree for the target state."
    expected_cost: medium
hidden_premises:
  - "The local app is reachable from the agent runtime."
  - "The requested verification target is a browser-visible surface."
untested_boundaries:
  - "File URLs may require a different local browser path than localhost URLs."
retrigger_conditions:
  - "A local browser task fails after a server-health check passes."
---

This valid packet expands alternatives only. It does not mutate trust,
confidence, source truth, or freshness.
