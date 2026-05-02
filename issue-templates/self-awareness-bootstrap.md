# Self-Awareness Bootstrap Template

Use this template when the Friction Tier Router selects Heavy Path, when
repo/runtime ownership is ambiguous, or when Standard Path evidence depends on
current runtime capability before SDD, Goal Mode, L2 Pressure, remote execution,
or VM routing.

## Goal

Establish the live capability envelope, repo anchor, memory boundary, risk
boundary, route, and completion metric before execution starts.

## Scope

- Runtime family and assigned role.
- Project-bound repo/resource and branch.
- Current issue or run state.
- Relevant tools, MCP surfaces, and connectors actually visible in this runtime.
- Memory sources checked and whether they are current evidence or advisory
  pressure.
- Public/private boundary, destructive-action boundary, and operator-call
  conditions.

## Required Checks

1. Read the issue description and latest relevant comments.
2. Verify the repo/resource anchor before making repo claims.
3. Check current branch/status if the task changes files.
4. List available task-relevant tools and missing tools.
5. Check Research Vault or durable memory only when it is relevant; label it as
   advisory unless it is current live evidence.
6. Decide the next route: inline, SDD, child issue, Goal Mode, L2 Pressure, VM,
   remote runtime, QA, or Supervisor review.

## Required Output

```text
SELF_AWARENESS_BOOTSTRAP
runtime_identity:
role_boundary:
repo_anchor:
tool_envelope:
mcp_envelope:
memory_sources_checked:
current_state_proof:
risk_envelope:
routing_decision:
success_metric:
operator_call_conditions:
verdict: READY | FLAG | BLOCK
```

## Evidence Allowed

Allowed:

- command names and exit status
- small derived summaries
- changed file paths
- current branch/status
- tool names
- verdict labels
- sanitized issue or PR URLs

Not allowed in public Git artifacts:

- secrets, cookies, tokens, or credential material
- raw request payloads
- full logs or transcripts
- live workspace, runtime, agent, run, or comment IDs
- personal absolute paths
- direct machine addresses

## Closeout

```text
SELF_AWARENESS_CLOSEOUT
bootstrap_verdict:
routing_used:
capability_gap_found:
artifact_or_blocker:
residual_risk:
next_slice_started:
```

Close `PASS` only when the selected route has real evidence or a precise
external blocker has been proven.
