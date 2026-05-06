# Capy Linear Slack Sync Lane

The Capy Linear Slack Sync Lane is the bounded, source-first automation contract for syncing GitHub evidence into Linear and Slack without turning chat into a control plane.

GitHub PRs, commits, CI/checks, and review findings remain the primary evidence. Captain Capy makes the semantic state decision from that evidence. Linear is the durable external work ledger. Slack is the human coordination and notification surface only. Machine-readable config and reports should use the canonical project source-of-truth tokens `git`, `github`, `ci`, and `review-comments`.

## Role Split

| Layer | Role | Authority |
| --- | --- | --- |
| GitHub, git, CI, reviews | primary evidence | decides what happened |
| Captain / webhook automation | semantic classifier | maps evidence to the allowed state machine |
| Linear adapter | durable ledger writer | writes status and comments idempotently after Captain decides |
| Slack adapter | human attention surface | posts bounded notifications only when human attention is warranted |
| Build agents | implementation and verification | must not write Linear or Slack directly |

Default rollout: the registry entry ships disabled until an operator explicitly enables it after verifying Linear/Slack auth, permissions, and rollout intent.

## State Machine

| From | To | Gate | Required evidence |
| --- | --- | --- | --- |
| `Todo` | `In Progress` | Captain or Build work starts | task dispatch, assignment, or clear work-start evidence |
| `In Progress` | `In Review` | PR opens or ready-for-review evidence exists | GitHub PR state or equivalent review-ready repo evidence |
| `In Review` | `Ready for Merge` | PR exists, required checks are passing, and no open high/critical review findings remain | open PR, passing required checks, no open high/critical findings |
| `Ready for Merge` | `Done` | PR is merged | merged PR evidence |
| any state | `Blocked` | required CI/check evidence fails, the requirement is unclear, a high/critical review finding is open, required primary evidence cannot be read, or primary GitHub/CI/review evidence conflicts and cannot be resolved safely | failing/contradictory primary evidence or a read/requirement blocker that prevents trustworthy classification |

Rules:

- Recompute state from evidence on every eligible event; do not trust prior chat or stale cache.
- The semantic state and the external sync verdict are separate outputs.
- `Ready for Merge` is an evidence state, not merge authority.
- Capy must never auto-merge unless a human explicitly asks for that exact PR merge.
- Precedence rule: classify semantic state from primary GitHub/repo evidence first.
- If durable GitHub/repo evidence resolves a mismatch against chat, memory, Linear, Slack, or another supporting surface, keep that semantic state and emit `FLAG` naming the mismatch.
- If the semantic state is clear but Linear/Slack auth, tooling, or write permission fails, keep that semantic state and emit `FLAG` naming the failed external surface.
- If primary GitHub, CI, and review evidence disagree with each other and cannot be resolved safely, use `Blocked` and emit `BLOCK`.

## Slack Notification Matrix

| Condition | Notify now | Default channel | Notes |
| --- | --- | --- | --- |
| `Blocked` state | yes | `#everos-ops` | use blocker channel; same channel until a dedicated blocker channel is registered |
| CI failed | yes | `#everos-ops` | include failing surface only, not raw logs |
| High/critical review finding opened or remains open | yes | `#everos-ops` | summarize finding severity and owner need |
| Needs owner decision | yes | `#everos-ops` | use when requirement, permission, or evidence conflict needs human judgment |
| `Ready for Merge` reached | yes | `#everos-ops` | notify once per dedupe key |
| Task started / first commit / synchronize without gate change | no | none | avoid start and commit noise |
| Minor/nit review chatter | no | none | avoid low-signal review spam |

Slack is for attention, not truth. Do not mirror every event.

## Linear Update And Comment Template

Status changes and comments should be compact, evidence-backed, and idempotent.

```text
CAPY_LINEAR_UPDATE
repo: <owner/repo>
pr: <number or none>
state: <Todo | In Progress | In Review | Ready for Merge | Done | Blocked>
reason: <one-line semantic decision>
evidence:
- PR: <state or none>
- Checks: <passing/failing/pending summary>
- Review: <no open high/critical findings | finding summary>
- Commit/sha: <sha>
next_gate: <next evidence gate or none>
```

Comment guidance:

- name the evidence that caused the transition;
- include the next required gate when work is not `Done`;
- keep wording public-safe and sanitized;
- never paste raw payloads, raw transcripts, private screenshots, or credential material.

## Idempotency And Dedupe Keys

Every external write must carry a deterministic dedupe key derived from source evidence.

```text
<owner>/<repo>:<issue-or-pr>:<event-family>:<event-id>
```

Preferred event identifiers:

- PR lifecycle: `pull_request.number` + `action` + `head.sha`
- Check run: `check_run.id`
- Check suite: `check_suite.id`
- Workflow run: `workflow_run.id`
- Review submission: `review.id`
- Review comment created/edited/deleted: action + `pull_request_review_comment.id`
- Merge closeout: PR number + merged commit sha

If a provider requires a single string key, concatenate:

```text
repo + pr/issue + event + action + sha/check_run_id/workflow_run_id/review_id/pull_request_review_comment_id
```

Dedupe rules:

- same dedupe key must not produce duplicate Linear comments or duplicate Slack posts;
- repeated webhook deliveries should be safe to replay;
- a later stronger event may supersede an earlier weaker state without deleting repo evidence.

## Tooling Failure, FLAG, And BLOCK Behavior

If Linear or Slack tooling is unavailable, missing auth, or lacks channel/project permission:

- keep GitHub and repo evidence as the source of truth;
- do not claim external sync succeeded;
- emit `FLAG` when the semantic state is clear but Linear/Slack auth, tooling, or the external write could not be completed;
- missing Linear or Slack adapter permission does not force Linear state `Blocked` unless that permission is also required to read primary evidence or otherwise prevents trustworthy classification;
- emit `BLOCK` when required primary evidence cannot be read, the requirement is unclear, required checks fail, an open high/critical finding remains, or primary evidence conflict prevents a trustworthy state decision;
- keep the failure localized to the external adapter and name the exact unavailable surface.

## Privacy And Safety Rules

Never send to Linear or Slack:

- tokens, secrets, API keys, bearer tokens, passwords, cookies, or OAuth material;
- raw webhook payloads or raw response payloads;
- raw transcripts or private browser traces;
- private screenshots or unrelated private UI;
- merge commands, merge promises, or claims that bypass evidence gates.

Public-safe durable records may include repo name, PR number, sanitized check state, sanitized review status, PASS/FLAG/BLOCK verdicts, and bounded next-action summaries.

## Required Report Block

```text
CAPY_LINEAR_SLACK_SYNC
repo:
event:
candidate_transition:
source_of_truth:
linear_action:
slack_action:
idempotency_key:
privacy_check:
residual_risk:
verdict: PASS | FLAG | BLOCK
```
