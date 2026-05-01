# Remote Evolve Sweep Template

## Scope

This issue is a controller created by the Remote HarnessMax Evolve Sweeper. It
is not itself an implementation target.

## Required Pressure

```text
RV_PRESSURE_CHECK
objective:
owner:
vault_source:
queries_or_indexes_checked:
relevant_prior_failures:
proven_patterns:
l2_pressure_applied:
not_applied_and_why:
next_best_action:
verdict: PASS | FLAG | BLOCK
```

If Research Vault access is unavailable, use the closest durable memory source
and mark the result `FLAG` unless the task only needs workbench-local memory.

## Target Selection

- Scan `in_review`, `blocked`, and high-priority `in_progress` issues.
- Prefer HarnessMax, upstream-sync, remote, Hermes, VM, RV/MCP, CCR, and Goal
  Mode work.
- Review at most five targets.
- Do not target `Workbench Max` unless the human explicitly assigned it.

## Required Commands

```bash
multica issue list --output json --limit 100
multica issue get <target-issue-id> --output json
multica issue comment list <target-issue-id> --output json
multica issue runs <target-issue-id> --output json
```

## Output Block

```text
REMOTE_EVOLVE_SWEEP
TARGETS_SCANNED:
TARGETS_REVIEWED:
RV_PRESSURE_MISSING:
REPO_ANCHOR_FLAGS:
VM_PROOF_NEEDED:
HERMES_SYNTHESIS_NEEDED:
ROUTES_CREATED:
REVIEWED_TO_DONE:
BLOCKED:
NO_TARGETS:
NEXT_BEST_ACTION:
VERDICT: PASS | FLAG | BLOCK
```

## Safety

- Do not edit files from this controller issue.
- Do not mutate live agents, runtimes, skills, autopilots, or permission
  profiles.
- Do not write to Research Vault.
- Do not dump raw vault entries, raw run messages, screenshots, secrets, OAuth
  material, request payloads, or broad workspace JSON.
- Create follow-up issues only when the next action is specific, bounded, and
  evidence-backed.
