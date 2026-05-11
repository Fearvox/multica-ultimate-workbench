# NO_GOBLINS Action Trust Report

Use this template before an agent performs a mutation or publication that could
create operator-visible drift. It is a review packet, not a runtime hook. The
goal is to make the proposed action, trust boundary, evidence, safer
alternative, and residual risk visible before work fans out.

## Scope

Use this report for proposed actions touching:

- issue creation or status changes;
- repo writes;
- provider, model, auth, billing, or runtime settings;
- MCP tool routes or tool capability changes;
- Research Vault writes or exports;
- public-surface publication;
- destructive cleanup or branch/ref mutation.

Skip this report for ordinary read-only checks, tiny typo fixes, and bounded
review comments that do not mutate source-of-truth state.

## Report

```yaml
NO_GOBLINS_ACTION_TRUST_REPORT:
  source_issue: ""
  dedupe_key: ""
  proposed_action: ""
  action_summary: ""
  intended_effect: ""
  target_surface: "issue_creation | repo_write | provider_runtime | mcp_tool | research_vault | public_surface | branch_or_ref | other"
  action_category: "read_only | comment_update | child_issue_create | repo_patch | provider_call | deployment | credential_adjacent | destructive"
  risk_level: "none | low | medium | high | critical"
  decision: "allow | warn | review_required | block"
  local_closeout: "PASS | FLAG | BLOCK"

  owner_and_reviewer:
    owner: ""
    reviewer: ""
    operator_approval_required: "yes | no"
    approval_ref: ""

  dedupe_and_active_count:
    searched_key: ""
    active_count: ""
    overlapping_issues:
      - ""
    fanout_allowed: "yes | no"

  evidence_required_for_pass:
    - "issue comment, run, PR, diff, status check, validator output, source URL, screenshot/DOM proof, or other bounded artifact"

  evidence_refs:
    - ""

  trace_or_validator_evidence:
    required: "yes | no"
    refs:
      - ""
    self_report_disagreement: "none | possible | confirmed"
    source_of_truth_if_disagreement: ""

  checkpoint_evidence:
    - checkpoint: ""
      evidence_ref: ""
      status: "PASS | FLAG | BLOCK"

  runtime_observable_effect:
    changed_artifact: ""
    observed_by: ""
    verification_ref: ""

  enforcement_layer:
    primary: "issue_template | repo_policy | host_runtime | mcp_server | transport | supply_chain | human_review"
    secondary: "issue_template | repo_policy | host_runtime | mcp_server | transport | supply_chain | human_review"

  capability_labels:
    capability: ""
    confidentiality: "public | internal | private | secret | unknown"
    trust_level: "trusted | bounded | untrusted | unknown"
    label_source: ""
    unknowns:
      - ""

  memory_parameter_source:
    - parameter: ""
      memory_ref: ""
      confidence: "low | medium | high"
      uncertainty_or_review_reason: ""

  memory_lifecycle_phase: "write | store | retrieve | execute | share | none"
  memory_anomaly_check:
    baseline_ref: ""
    anomaly_signal: "none | possible | confirmed"
    synonym_loophole_check: "not_applicable | checked | missing"
    retrieval_rank_vs_detection_tradeoff: ""

  session_chain_risk:
    level: "none | low | medium | high | critical"
    recent_related_actions:
      - ""
    chain_escalates_decision: "yes | no"

  objective_drift_check:
    source_objective: ""
    current_objective: ""
    changed: "yes | no"
    reviewer_action: "allow | warn | review_required | block"

  interface_and_supply_chain:
    interface_preserved_implementation_changed: "yes | no | unknown"
    attack_surface: "tool_description | transport | dependency | memory | prompt | runtime | other | unknown"
    trust_boundary: ""
    network_or_execution_trace_evidence: ""

  decision_point:
    option: "act | refuse | replan | operator_needed"
    refusal_or_replan_option: ""
    safer_alternative: ""

  recovery_budget:
    max_patch_attempts: 1
    max_comments_before_review: 2
    stop_condition: ""

  public_safety_scan:
    secrets: "absent | redacted | present"
    oauth_material: "absent | redacted | present"
    tokens: "absent | redacted | present"
    credential_paths: "absent | redacted | present"
    raw_private_payloads: "absent | redacted | present"
    private_screenshots: "absent | redacted | present"
    host_or_ip_values: "absent | redacted | present"
    local_absolute_paths: "absent | redacted | present"
    raw_operator_commands: "absent | redacted | present"

  residual_risk:
    - ""

  final_verdict: "PASS | FLAG | BLOCK"
```

## Decision Rules

- `allow`: the action is low-risk, deduped, public-safe, and has enough evidence.
- `warn`: the action is safe to continue, but a named residual risk must remain
  visible in closeout.
- `review_required`: the action touches mutation, publication, provider/runtime,
  Research Vault write, branch/ref mutation, or uncertain tool capability.
- `block`: the action has missing source-of-truth evidence, unresolved
  high-risk findings, secret/private leakage, destructive ambiguity, objective
  drift, or no clear operator approval where approval is required.

Do not turn `warn`, `review_required`, or `block` into a Workbench `PASS`.
Workbench closeout uses `PASS | FLAG | BLOCK`; this report's decision field is
the pre-action trust decision.

## Public-Safe Fixtures

1. `issue_creation.fanout.review`: creating a child issue from a public-safe
   summary requires dedupe key, owner, scope, active-count check, and explicit
   mention side-effect intent.
2. `repo_mutation.public_docs.warn`: editing README/docs requires repo-relative
   paths, public-surface scan, diff check, and residual-risk field.
3. `provider_runtime_mutation.block`: provider credential, billing, auth,
   runtime, or model-routing mutation defaults to `block` unless a separate
   operator approval reference is present.
4. `research_vault_write.review`: Research Vault writes require category,
   source pointer, summary level, redaction proof, and confirmation that no raw
   transcript or private payload is stored.
5. `publication_public_surface.review`: publishing or sharing artifacts requires
   public-safe examples only, redacted screenshots/status, and no host/IP,
   credential, private-path, or private-payload strings.
6. `session_chain_risk.review_block`: individually low-risk steps can escalate
   to review or block when the session chain crosses a mutation, publication, or
   provider/runtime boundary.
7. `trace_validator_required.review`: agent narrative alone is insufficient for
   tool/result claims; require trace, status, PR, validator, or check evidence.
8. `act_refuse_checkpoint.required`: before mutation or publication, record
   act, refuse, replan, or operator-needed as an explicit decision point.
9. `long_horizon_objective_drift.block`: if multi-session context changes the
   source objective or trust boundary, block until source-truth and operator
   intent are re-read.
10. `memory_parameter_source.required`: actions using remembered state must cite
   the memory item or source that supplied each material tool parameter.

## Source Boundary

This template is derived from the AgentTrust / MCP / memory-risk research packet
captured in DAS-2656 and accepted DAS-1212 review augmentations. Paper accuracy
or benchmark claims remain source claims until reproduced in local
Workbench/Windburn fixtures. Do not import any external runtime dependency from
this template alone.

## Non-Goals

- No live interceptor.
- No MCP server installation.
- No provider, credential, billing, auth, runtime, deploy, or production change.
- No Research Vault write.
- No broad issue sweep or fanout.
- No destructive cleanup or force push.
