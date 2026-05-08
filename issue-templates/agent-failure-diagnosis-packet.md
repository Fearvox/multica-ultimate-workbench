# Agent Failure Diagnosis Packet

Use this template when a Workbench Goal Mode, cron, Multica dispatch, or agent
execution path fails and the next operator needs to identify the first
unrecoverable step without reading private logs or hidden issue history.

This packet separates "scheduler fired", "Multica run dispatched", "agent
started", "agent completed", and "cycle evidence posted". It is a diagnosis
artifact, not a runtime mutation, Research Vault write, or proof that a later
cycle succeeded.

## Public Safety

- Use issue IDs, repo-relative paths, public source URLs, and sanitized state.
- Do not paste raw logs, raw transcripts, private prompts, signed URLs, private
  payloads, screenshots, public IPs, credential paths, tokens, cookies, or local
  absolute paths.
- Do not mutate Hermes cron, gateway, daemon, runtime config, agents, skills,
  autopilots, providers, auth, payment, production routes, Workbench Max,
  `_local-cred/`, or Research Vault from this packet.
- If exact provider/backend evidence requires private logs or credentials, mark
  that gap explicitly and use `verdict: FLAG` or `verdict: BLOCK`.

## Source Grounding

Use these sources as supporting grounding, not as proof of any specific
Workbench event:

- AgentRx, Microsoft Research:
  https://www.microsoft.com/en-us/research/publication/agentrx-diagnosing-ai-agent-failures-from-execution-trajectories/
  Supports critical-failure-step localization, evidence-backed validation logs,
  and failure-category assignment for agent trajectories.
- AgentRx arXiv record:
  https://arxiv.org/abs/2602.02475
- PROV-AGENT:
  https://arxiv.org/abs/2508.02866
  Supports provenance fields for agent/model/tool/workflow interactions and
  downstream traceability. Do not cite it as proof that Workbench memory or RV
  state is correct.
- MCP-Bench:
  https://arxiv.org/abs/2508.20453
  Supports real MCP/tool-agent evaluation pressure around multi-step tasks,
  tool coordination, schemas, runtime checks, and grounded intermediate outputs.
- MCP-Atlas:
  https://arxiv.org/abs/2602.00933
  Supports claims-based evaluation of real MCP server/tool competency and
  empty-result/tool-selection ambiguity.
- MCPAgentBench:
  https://arxiv.org/abs/2512.24565
  Supports tool-selection and execution-efficiency evaluation with simulated MCP
  tools and distractors. It is supporting evidence for tool-use evaluation, not
  memory provenance.

## Packet Template

```yaml
AGENT_FAILURE_DIAGNOSIS_PACKET:
  packet_id: ""
  source_issue: ""
  controller_or_cycle: ""
  checked_at_utc: "YYYY-MM-DDTHH:MM:SSZ"
  public_safety_level: "public-safe | internal-safe | blocked-redaction-needed"

  observed_failure_layer:
    primary: "scheduler_success | multica_dispatch | agent_bootstrap | provider_backend | sandbox_tool | evidence_delivery | operator_policy | inconclusive"
    secondary_flags: []

  first_unrecoverable_step:
    step_label: ""
    what_was_expected: ""
    what_was_observed: ""
    why_unrecoverable: ""
    confidence: "high | medium | low"

  provenance_inputs:
    issue_evidence: []
    run_evidence: []
    tool_evidence: []
    model_or_provider_evidence: []
    runtime_evidence: []
    excluded_evidence: []

  tool_model_runtime_surface:
    scheduler: ""
    multica_run: ""
    agent_runtime: ""
    model_provider: ""
    tools_or_mcp: ""
    sandbox_or_filesystem: ""

  evidence_status:
    scheduler_fired: "yes | no | unknown"
    run_dispatched: "yes | no | unknown"
    agent_started: "yes | no | partial | unknown"
    agent_completed: "yes | no | unknown"
    cycle_evidence_posted: "yes | no | unknown"
    required_fields_present: "yes | no | partial"
    evidence_gaps: []

  downstream_effect:
    user_visible_effect: ""
    controller_effect: ""
    child_issue_effect: ""
    rv_or_memory_effect: ""

  blocker_class:
    primary: "system_failure | invalid_invocation | guardrail_or_policy | unsupported_intent | underspecified_intent | misinterpreted_tool_output | plan_adherence | evidence_gap | inconclusive"
    secondary: []

  duplicate_or_fanout_risk:
    risk_level: "low | medium | high"
    why: ""
    dedupe_key_or_adjacent_issues: []
    suppress_new_fanout_until: ""

  next_owner_action:
    owner: ""
    action: ""
    non_goals: []
    verification_needed: []

  rubric:
    PASS: "First unrecoverable step is evidenced, public-safe, and next owner action is bounded."
    FLAG: "Useful classification exists, but a non-critical evidence gap or residual ambiguity remains."
    BLOCK: "Safe diagnosis cannot proceed without credentials, private logs, approval, or an upstream fix."

  verdict: "PASS | FLAG | BLOCK"
  residual_risk: ""
```

## Filled Example: DAS-1212/DAS-1455 Scheduler Dispatch Evidence Gap

```yaml
AGENT_FAILURE_DIAGNOSIS_PACKET:
  packet_id: "DAS-1212-DAS-1455-cron-agent-evidence-gap-public-safe"
  source_issue: "DAS-1212"
  controller_or_cycle: "MAXXED autoresearch/dogfood cron cycle, sanitized from DAS-1455"
  checked_at_utc: "2026-05-06T02:00:00Z"
  public_safety_level: "public-safe"

  observed_failure_layer:
    primary: "evidence_delivery"
    secondary_flags:
      - "agent_bootstrap"

  first_unrecoverable_step:
    step_label: "automatic cron-triggered agent run did not produce cycle evidence"
    what_was_expected: "Scheduler tick leads to a Multica run, agent completion, and AUTORESEARCH_DOGFOOD_CYCLE START/END fields posted to DAS-1212."
    what_was_observed: "Public-safe issue evidence showed a scheduler/dispatch path existed, but the automatic path did not post the required START/END cycle report."
    why_unrecoverable: "Without the operator-visible cycle artifact, the next cycle could not distinguish scheduler success from agent completion."
    confidence: "high"

  provenance_inputs:
    issue_evidence:
      - "DAS-1212 controller issue"
      - "DAS-1455 cron delivery verification issue"
      - "DAS-1724 source packet report"
    run_evidence:
      - "Sanitized Multica run status readback only"
    tool_evidence:
      - "Multica issue/comment/run read commands"
    model_or_provider_evidence:
      - "Sanitized state only; exact provider/backend subcause not assigned"
    runtime_evidence:
      - "Sanitized scheduler/dispatch status from DAS-1455"
    excluded_evidence:
      - "raw logs"
      - "raw transcripts"
      - "private URLs"
      - "signed attachment URLs"
      - "screenshots"
      - "credential material"
      - "local absolute paths"

  tool_model_runtime_surface:
    scheduler: "Existing Hermes cron lane; not mutated by this packet"
    multica_run: "Run dispatch was differentiated from agent completion"
    agent_runtime: "Agent completion remained unproven from public-safe evidence"
    model_provider: "Not conclusively assigned from public-safe evidence"
    tools_or_mcp: "Not evidenced as the first failure layer in this example"
    sandbox_or_filesystem: "Not evidenced as the first failure layer in this example"

  evidence_status:
    scheduler_fired: "yes"
    run_dispatched: "yes"
    agent_started: "partial"
    agent_completed: "no"
    cycle_evidence_posted: "no"
    required_fields_present: "no"
    evidence_gaps:
      - "No public-safe AUTORESEARCH_DOGFOOD_CYCLE START/END packet"
      - "Exact provider/backend versus bootstrap subcause unresolved"

  downstream_effect:
    user_visible_effect: "Controller appeared stale or ambiguous despite scheduler success."
    controller_effect: "DAS-1212 could not count a complete automatic cycle."
    child_issue_effect: "DAS-1455 stayed adjacent to FLAG/BLOCK until cycle evidence existed."
    rv_or_memory_effect: "No RV write should be inferred; DAS-1481 remains the operator-gated RV path."

  blocker_class:
    primary: "evidence_gap"
    secondary:
      - "system_failure"

  duplicate_or_fanout_risk:
    risk_level: "high"
    why: "Confusing scheduler success with cycle completion can spawn duplicate cron/runtime investigations."
    dedupe_key_or_adjacent_issues:
      - "DAS-1455 cron verification: adjacent evidence source, not duplicated"
      - "DAS-1481 RV operational entries: operator-gated downstream use, not written here"
      - "DAS-1724 source packet: issue-comment source converted into repo template"
      - "DAS-1847 RV search claim fixture: complementary claim classification, not agent execution diagnosis"
      - "DAS-1902 RV search fixture landing: adjacent repo-current landing work, not duplicated"
    suppress_new_fanout_until: "A public-safe automatic START/END cycle report exists or a bounded runtime-provider investigation packet is assigned."

  next_owner_action:
    owner: "Controller/operator owning the cron/agent runtime lane"
    action: "Verify the next automatic run posts required START/END fields; if not, investigate agent bootstrap/provider path rather than creating another cron job."
    non_goals:
      - "Do not create another cron job"
      - "Do not use a manual tick as automatic proof"
      - "Do not mutate gateway or runtime config from this packet"
    verification_needed:
      - "job_id"
      - "planned_run_utc"
      - "actual_start_utc"
      - "actual_end_utc"
      - "repeat_index"
      - "cycle_index"

  rubric:
    PASS: "Use only when scheduler, dispatch, completion, and evidence delivery are all shown or the first failure step is fully evidenced."
    FLAG: "Use when classification is useful but provider/backend or bootstrap detail remains unresolved."
    BLOCK: "Use when diagnosis requires private logs, credentials, approval, or unsafe runtime mutation."

  verdict: "FLAG"
  residual_risk: "The first public-safe unrecoverable step is evidence delivery, but exact provider/backend versus bootstrap subcause remains unresolved."
```

## Dedupe Notes

- DAS-1455 verifies cron delivery and START/END evidence expectations; this
  template does not re-run or replace cron verification.
- DAS-1481 is the operator-gated path for Research Vault operational entries;
  this template must not write to RV or bypass that gate.
- DAS-1724 is the issue-comment source packet that this file codifies into a
  repo-current artifact.
- DAS-1847 classifies Research Vault search/tool-output claims; it complements
  this packet by classifying search claims, while this packet classifies the
  first unrecoverable step in agent execution.
- DAS-1902 lands the DAS-1847 RV search fixture into repo-current files; this
  template is a separate landing artifact for agent failure diagnosis.

## Discoverability Checklist

Before closing an issue that uses this packet:

1. Search the repo for `AGENT_FAILURE_DIAGNOSIS_PACKET`, `AgentRx`, and
   `first unrecoverable step`.
2. Run `node scripts/check-agent-failure-diagnosis-packet.mjs` from the repo
   root.
3. Run `git diff --check`.
4. Run a public-surface scan over touched files for raw paths, signed URLs,
   credentials, public IPs, and token-like material.
5. Close with `PASS`, `FLAG`, or `BLOCK` and name the next owner action.
