# Runtime Stack Preflight Template

## Goal

Verify whether a Hermes, OpenCode, Pi, or mixed runtime route is the right
Workbench lane before relying on it for implementation, observation, memory, or
dispatch.

## Scope

Read-only by default. No provider config changes, daemon/Desktop/core runtime
mutation, tunnel exposure, credential edits, or production writes unless a
separate issue explicitly approves them.

## Required Checks

```text
RUNTIME_STACK_PREFLIGHT
target_issue_or_goal:
requested_runtime_family: Hermes | OpenCode | Pi | mixed
selected_layer: memory_queue | execution | observation | mixed
source_authority:
repo_anchor:
tool_envelope:
permission_boundary:
observer_surface:
memory_or_rv_boundary:
handoff_surface:
timeout_or_cleanup_policy:
public_surface_scan:
routing_decision:
operator_approval_needed:
verdict: PASS | FLAG | BLOCK
```

## PASS / FLAG / BLOCK

`PASS` means:

- the runtime role matches `docs/runtime-orchestration-stack.md`;
- repo/resource anchor is proven;
- required tools are visible;
- permission and public-surface boundaries are explicit;
- the closeout report shape is known;
- no live secret, provider, tunnel, or destructive mutation is needed.

`FLAG` means:

- the route is useful but one proof is missing;
- the route depends on a dashboard, tunnel, provider, or evolving upstream
  feature;
- a fallback runtime can proceed with named limits.

`BLOCK` means:

- the route requires secrets, provider auth, production mutation, private
  transcript exposure, or tunnel exposure without approval;
- repo anchor or runtime identity cannot be proven;
- a `PASS` claim would depend on memory, screenshots, or UI state without
  primary evidence.

## Runtime-Specific Notes

Hermes:

- Name the profile, Kanban board, cron, gateway, or memory surface.
- Treat memory as advisory pressure unless current repo/issue evidence confirms
  it.

OpenCode:

- Name the branch, worktree, permission rules, and commands expected.
- Use `ask` or `deny` for destructive commands and external directories unless
  the issue grants them.

Pi:

- Name the TUI/dashboard/RPC/JSON event surface.
- Include timeout, kill, cleanup, and transcript retention policy.
- Tunnel or mobile access needs explicit operator approval.

Mixed route:

- Name the lead runtime and the observer runtime.
- Do not let observer evidence replace repo/issue/CI proof.
- Keep handoffs short and source-grounded.

## Closeout

```text
RUNTIME_STACK_PREFLIGHT_CLOSEOUT
route_selected:
runtime_family:
why_not_the_other_layers:
evidence_checked:
operator_approval_needed:
next_issue_or_action:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```
