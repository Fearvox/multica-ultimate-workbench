# Manual-to-Scheduled Ladder v0

Status: draft policy.
Scope: Multica Ultimate Workbench recurring gate outputs, sweeper candidates,
and operator-reviewed automation proposals.

## Intent

Keep new Workbench gates manual until repeated clean evidence proves that the
workflow is stable, safe to batch, and worth proposing for scheduled automation.

This document is policy only. It does not create a schedule, change a trigger,
reactivate an autopilot, mutate a skill, or change any daemon, Desktop, core, or
runtime behavior.

## Ladder

| Clean manual cycles | Eligible action | Required approval | Automation status |
| --- | --- | --- | --- |
| 0-2 | Keep the workflow manual. | None beyond the current issue owner. | No automation proposal. |
| 3-4 | Operator-approved manual batch may be proposed for the next run only. | Explicit operator approval in the current issue or direct session. | No schedule creation and no trigger change. |
| 5+ | Scheduled automation proposal may be written for review. | Explicit operator approval before any implementation, activation, trigger change, or autopilot reactivation. | Proposal only until separately approved. |

The clean-cycle count is advisory evidence, not permission. A workflow with five
clean cycles is eligible for a proposal; it is not eligible for automatic
activation.

## Clean Cycle Definition

A clean manual cycle must have all of the following evidence:

- The original issue objective was satisfied with a `PASS` verdict.
- The closeout preserved the literal `PASS` / `FLAG` / `BLOCK` verdict.
- Required evidence was attached or cited: issue ID, repo path, command output,
  PR or commit when relevant, and residual-risk notes.
- `REMAINING:` was either `(none)` or synced to the relevant follow-up issue.
- No secret, private topology, OAuth material, raw token, raw request payload,
  private screenshot, or sensitive partner/internal detail was stored in public
  artifacts.
- No unapproved runtime, trigger, schedule, autopilot, daemon, Desktop, core, or
  skill mutation happened during the cycle.

If any item is missing, the cycle does not count as clean. A `FLAG` cycle may be
useful learning, but it does not advance the clean-cycle count.

## Manual Batch Eligibility At Three To Four Clean Cycles

At three to four clean cycles, the owner may propose a manual batch for a
bounded set of similar items. The batch is eligible for the next run only, and
the proposal must define what counts as that next run so the permission does not
turn into an open-ended standing batch. The proposal must name:

- the exact batch scope;
- the maximum number of items;
- the command or checklist to be run manually;
- the rollback or stop condition;
- the evidence that each item will produce; and
- the operator approval comment or direct-session approval that authorizes only
  that manual batch.

This stage still forbids schedule creation, trigger mutation, and autopilot
reactivation.

## Scheduled Proposal Eligibility At Five Clean Cycles

At five clean cycles, the owner may write a scheduled automation proposal. The
proposal must remain a review artifact until a separate operator approval
explicitly authorizes implementation and activation.

The proposal must include:

- objective and non-goals;
- source issues or runs that prove the five clean manual cycles;
- exact schedule or trigger candidate;
- target agent or runtime;
- max concurrency and cooldown;
- dedupe key;
- failure handling and escalation path;
- secret and public-artifact policy;
- rollback plan;
- dry-run or shadow-run plan; and
- owner, reviewer, and required closeout format.

No proposal may activate itself. Implementation, activation, trigger mutation,
or autopilot reactivation requires a separate approved issue.

## Mandatory `public_safety` Field

Every future gate output that is used to justify a manual batch or scheduled
automation proposal must include a top-level `public_safety` field.

Recommended shape:

```yaml
public_safety:
  verdict: "PASS | FLAG | BLOCK"
  checked:
    - public artifacts contain no secrets, tokens, OAuth material, raw request payloads, or private screenshots
    - public artifacts contain no private hostnames, local absolute paths, SSH targets, or credential locations
    - added or changed public text does not expose sensitive partner/internal details
    - no unapproved schedule, trigger, autopilot, daemon, Desktop, core, runtime, or skill mutation occurred
  evidence:
    - <command, issue, PR, commit, or artifact path>
  remaining:
    - <bounded follow-up or "(none)">
```

`public_safety.verdict` rules:

- `PASS`: all checks were performed and evidence is cited.
- `FLAG`: recoverable evidence is missing or a non-blocking public-surface risk
  remains.
- `BLOCK`: a secret, sensitive internal detail, private topology leak,
  unapproved mutation, or unverifiable public artifact is present.

A gate output without `public_safety` cannot be counted as a clean manual cycle
for this ladder.

## Review Rule

Workbench Supervisor reviews the ladder stage against the evidence, not against
the agent's preferred next step:

- 0-2 clean cycles: hold manual.
- 3-4 clean cycles: allow only an operator-approved manual batch.
- 5+ clean cycles: allow only a scheduled automation proposal.

Any request to create schedules, change triggers, reactivate autopilots, mutate
skills, or alter daemon/Desktop/core/runtime behavior is outside this policy
document and must be routed as a separate approved issue.
