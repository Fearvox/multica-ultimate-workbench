# Superconductor User Dogfood Goal

Use this template when the operator says "dogfood", "acting like a user", or
hands over a fuzzy product thought that should become an immediately usable
Workbench/Superconductor improvement.

The goal is not to prove that protocols exist. The goal is to reduce the
operator's live state-reconstruction burden.

## Required Header

```text
/goal
GOAL_MODE: yes
STANDARD_PATH: yes
```

Use `HEAVY_PATH: yes` only when the work touches live runtime mutation,
credentials, publishing, daemon/Desktop/core behavior, or cross-agent
automation.

## RAW_REQUIREMENT

```text
Turn this fuzzy dogfood observation into a concrete session trust improvement:

<paste the operator's literal thought>
```

## GOAL_LOCK

```text
GOAL_LOCK:
objective: produce one current session status card and one reviewable product
  primitive that reduces operator state reconstruction.
owner:
non_goals: no daemon/Desktop/core runtime mutation; no credential access; no raw
  screenshot or transcript persistence; no broad redesign.
closeout_gates: user_job, visible_surfaces, changed_file_buckets,
  evidence_confidence, confidence_limits, safe_next_action, docs_report,
  git_status.
operator_call_conditions: ask only before live app mutation, destructive
  cleanup, publishing, or changing the operator's chosen repo anchor.
```

## USER_JOB

```text
Can I look at this session and know what the agent is doing, what changed, what
proof exists, and what I should do next?
```

## VISIBLE_SURFACES

- Superconductor project/worktree:
- Agent session/tab:
- Repo anchor:
- Changed files:
- Evidence artifacts:
- UI/screenshot/app state confidence:

## STATUS_CARD

```text
Goal:
Current action:
Last verified evidence:
Changed files:
Waiting on:
Safe next action:
```

## CHANGED_FILE_BUCKETS

```text
intentional source changes:
generated evidence:
browser/test artifacts:
operator-provided assets:
unknown/unclaimed files:
```

## EVIDENCE_CONFIDENCE

- Direct tool/MCP readback:
- Screenshot or visual evidence:
- Repo evidence:
- Fallbacks used:
- What could not be observed:

## PRODUCT_PRIMITIVE

Name the smallest product primitive that would reduce operator effort now.

Examples:

- session status card;
- changed-file bucket summary;
- repo-anchor banner;
- waiting-on-human indicator;
- last verified evidence row.

## CLOSEOUT

```text
GOAL_LOCK:
WHAT_CHANGED:
VERIFICATION:
DOCS_REPORT:
GIT_STATUS:
RESIDUAL_RISK:
OPERATOR_NEEDED: yes/no
VERDICT: PASS | FLAG | BLOCK
```

`PASS` means the operator can use the output immediately to understand the live
session state. `FLAG` means the output is useful but one evidence source,
surface, or repo state is incomplete. `BLOCK` means the session cannot be
trusted without operator action or upstream access repair.
