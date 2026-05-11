# RV Search Claim Fixture

Use this fixture when Research Vault or a fallback search returns no hits for a
query that may still have adjacent Workbench knowledge. The point is to classify
the empty result before creating a new research issue or claiming that no useful
knowledge exists.

This fixture is read-only. It does not authorize Research Vault writes,
maintenance, raw exports, credential reads, runtime mutation, or broad private
log review.

## Contract

```yaml
RV_SEARCH_CLAIM_FIXTURE:
  query_term: ""
  query_intent: ""
  expected_claims:
    - claim: ""
      why_expected: ""
      evidence_refs:
        - ""
  expected_source_surfaces:
    - surface: "vault_status | vault_search | vault_taxonomy | vault_get | repo_doc | issue_history | git_history | local_fallback"
      refs:
        - ""
      current_access: "available | missing | degraded | historical"
      expected_signal: ""
  acceptable_fallback_sources:
    - source: "repo_doc | issue_history | git_history | local_fallback"
      refs:
        - ""
      use_when: ""
      limits: ""
  empty_result_classification: "true_negative | index_gap | tool_selection_gap | vault_degraded"
  classification_reason: ""
  minimum_evidence_before_new_research_issue:
    - ""
  new_research_issue_allowed: true
  next_action_when_empty: ""
  public_safety:
    allowed:
      - "public issue IDs"
      - "repo-relative paths"
      - "public source URLs"
      - "compact hit counts and summaries"
    forbidden:
      - "raw private vault entries"
      - "secrets or credential paths"
      - "raw local absolute paths"
      - "screenshots or private payloads"
```

## Empty Result Classes

| Classification | Use when | Next action |
| --- | --- | --- |
| `true_negative` | Direct RV tools or a bounded fallback prove the claim is absent from the expected surfaces. | A new research issue may be valid if the need is still material. |
| `index_gap` | A known adjacent issue, path, or doc exists but the searched index or query returns no relevant hit. | Fix search keys, taxonomy, registry, or fixture coverage before fanout. |
| `tool_selection_gap` | The agent used the wrong tool, stopped after one empty query, skipped taxonomy, or failed to use an available source. | Re-run with the correct read-only tool order and record the failed route. |
| `vault_degraded` | Direct RV MCP is unavailable, registry views disagree, or only fallback evidence is available. | Report `FLAG`, use durable fallback sources, and avoid broad absence claims. |

## Minimum Evidence Before A New Research Issue

Before creating a new research issue from an empty RV/search result, collect all
of the following:

1. The exact query term and the intent behind it.
2. At least one expected claim that would make the result non-empty.
3. The expected source surfaces, including whether each was available,
   degraded, missing, or historical.
4. The bounded search or read-only tool path attempted, including hit count or
   compact no-hit summary.
5. A fallback check against issue history, repo docs, or reachable git history
   when direct RV tools are unavailable.
6. A dedupe check against adjacent issues or artifacts.
7. The empty-result classification and the smallest next action.

If the classification is `index_gap`, `tool_selection_gap`, or
`vault_degraded`, do not create a broad research issue until the search/tool
ambiguity has a bounded follow-up or documented waiver.

## Filled Example: DAS-1212 RV Discoverability Gap

```yaml
RV_SEARCH_CLAIM_FIXTURE:
  query_term: "Workbench Windburn Evensong Research Vault autoresearch dogfood autonomous loop goal mode"
  query_intent: "Find prior grounding for DAS-1212 MAXXED autoresearch and distinguish no relevant knowledge from search/index/tool drift."
  expected_claims:
    - claim: "DAS-1212 has an RV grounding entry produced by DAS-1689."
      why_expected: "DAS-1689 closed with an RV grounding summary for DAS-1212 and named the first domain record."
      evidence_refs:
        - "DAS-1689"
        - "raw/2026-05/20260505-das-1689-l2-pressure-rv-grounding-das-1212-maxxed-autoresearch.md"
    - claim: "Current Workbench docs include an ActiveMemoryPacket discoverability pattern."
      why_expected: "The active-memory template defines required retrieval keys and a repo-local discoverability check."
      evidence_refs:
        - "issue-templates/active-memory-packet.md"
        - "scripts/check-active-memory-discoverability.mjs"
    - claim: "Workbench sandbox run-record concepts are adjacent knowledge but not present in the current HEAD tree."
      why_expected: "Reachable git history contains repo-relative docs for WORKBENCH_SANDBOX_RUN_RECORD and HERMES_SANDBOX_RUN_RECORD, while current HEAD grep only finds ActiveMemoryPacket."
      evidence_refs:
        - "docs/workbench-vercel-open-agents-integration-lane.md (git-history)"
        - "docs/hermes-openai-sandbox-adapter-lane.md (git-history)"
        - "issue-templates/hermes-openai-sandbox-adapter-spike.md (git-history)"
    - claim: "MCP-Atlas supports using claim-based rubrics and tool-use diagnostics when evaluating MCP/tool-agent behavior."
      why_expected: "MCP-Atlas evaluates real MCP-server tasks with claims-based scoring and diagnostics for tool discovery, parameterization, syntax, error recovery, and efficiency."
      evidence_refs:
        - "https://arxiv.org/abs/2602.00933"
  expected_source_surfaces:
    - surface: "vault_search"
      refs:
        - "DAS-1212 cycle 007"
      current_access: "missing"
      expected_signal: "A direct search for the query should reveal DAS-1689 or clearly report no matching indexed record."
    - surface: "vault_taxonomy"
      refs:
        - "docs/remote-rv-mcp.md"
        - "issue-templates/rv-mcp-remote-preflight.md"
      current_access: "missing"
      expected_signal: "Taxonomy should expose whether goal-mode controllers, dogfood loops, or agent execution reliability categories exist."
    - surface: "repo_doc"
      refs:
        - "SYNTHESIS.md"
        - "docs/remote-rv-mcp.md"
        - "issue-templates/active-memory-packet.md"
        - "skills/workbench-l2-pressure-gate/SKILL.md"
      current_access: "available"
      expected_signal: "Read-only RV tool order, fallback rules, and ActiveMemoryPacket discoverability checks are documented."
    - surface: "issue_history"
      refs:
        - "DAS-1212"
        - "DAS-1689"
      current_access: "available"
      expected_signal: "Issue history shows that local fallback found DAS-1689 grounding but no RV_SEARCH_CLAIM_FIXTURE."
    - surface: "git_history"
      refs:
        - "docs/workbench-vercel-open-agents-integration-lane.md (git-history)"
        - "docs/hermes-openai-sandbox-adapter-lane.md (git-history)"
      current_access: "historical"
      expected_signal: "Historical docs show sandbox run-record contracts that are absent from current HEAD."
  acceptable_fallback_sources:
    - source: "issue_history"
      refs:
        - "DAS-1212"
        - "DAS-1689"
      use_when: "Direct RV MCP tools are not visible in the runtime."
      limits: "Issue summaries prove grounding exists but do not prove the live vault index is healthy."
    - source: "repo_doc"
      refs:
        - "docs/remote-rv-mcp.md"
        - "issue-templates/rv-mcp-remote-preflight.md"
        - "issue-templates/active-memory-packet.md"
      use_when: "The fixture needs public-safe contracts and source surfaces."
      limits: "Repo docs are durable Workbench memory, not a substitute for live RV search."
    - source: "git_history"
      refs:
        - "docs/workbench-vercel-open-agents-integration-lane.md (git-history)"
        - "docs/hermes-openai-sandbox-adapter-lane.md (git-history)"
      use_when: "A named term is absent from current HEAD but present in reachable repository history."
      limits: "Historical presence is evidence of adjacent knowledge, not current documentation."
  empty_result_classification: "index_gap"
  classification_reason: "The query is not a true negative because DAS-1689 grounding and ActiveMemoryPacket docs exist. It is also vault_degraded in this runtime because direct RV MCP tools were unavailable, but the primary operator risk is an index/search surface that hides known adjacent knowledge."
  minimum_evidence_before_new_research_issue:
    - "Run or document direct read-only RV status/search/taxonomy if available."
    - "Check DAS-1212 and DAS-1689 issue history for existing grounding."
    - "Check current repo docs for ActiveMemoryPacket and RV MCP contracts."
    - "Check reachable git history before treating absent sandbox terms as nonexistent."
    - "Dedupe against DAS-1481, DAS-1689, DAS-1724, and DAS-1789."
    - "Cite MCP-Atlas arXiv 2602.00933 or a stronger current source for claim-based MCP/tool-use evaluation."
  new_research_issue_allowed: false
  next_action_when_empty: "Create or update a bounded search/taxonomy/preflight fixture. Do not route another broad research issue from the empty search alone."
  dedupe:
    DAS-1481: "RV operational-verification entries, operator-gated write path; not a search-claim fixture."
    DAS-1689: "DAS-1212 RV grounding entry; proves adjacent knowledge exists but does not define empty-result classification."
    DAS-1724: "Agent failure diagnosis packet; classifies cron/agent failures, not RV search claims."
    DAS-1789: "Cron stale-BLOCK review; handles scheduler status drift, not RV discoverability."
  verdict: "FLAG"
```

Validate this template with:

```bash
node scripts/check-rv-search-claim-fixture.mjs
```
