# Capy Linear Slack Sync Automation

Mode: webhook responder
Trigger source: GitHub

Purpose: Classify PR, check, workflow, and review evidence into the approved Linear/Slack sync state machine without turning Linear or Slack into a source of truth.

## Trigger Surface

React only to these GitHub events:

- `pull_request` with `opened`, `reopened`, `ready_for_review`, `synchronize`, `closed`
- `check_run.completed`
- `check_suite.completed`
- `workflow_run.completed`
- `pull_request_review.submitted`
- `pull_request_review_comment.created`
- `pull_request_review_comment.edited`
- `pull_request_review_comment.deleted`

## Required Execution Order

1. Resolve payload `owner/repo` first.
2. Treat the payload repo as the source repo; do not assume `Fearvox/multica-ultimate-workbench` unless the payload says so.
3. Read repo-local policy and registry before classifying state:
   - `.capy/CAPTAIN.md` when present
   - `.capy/BUILD.md` when present
   - `.capy/REVIEW.md` when present
   - `AGENTS.md` when present
   - `CLAUDE.md` when present
   - `.capy/settings.json`
   - `config/capy-linear-slack-sync.json`
   - `docs/capy-linear-slack-sync-lane.md`
4. Inspect the current PR, commit, required checks, workflow conclusions, review state, and open high/critical findings.
5. Classify the highest-confidence allowed transition from primary evidence.
6. Respect repo enablement first: this lane ships disabled in the registry until an operator explicitly enables it after verifying Linear/Slack auth, channel/project permissions, and rollout intent.
7. Write Linear and Slack only when the registry is enabled for that deployment, the required tool surface exists, auth is valid, permissions allow the write, and the dedupe key has not already been applied.
8. Emit `CAPY_LINEAR_SLACK_SYNC` every run, even when no external write occurs.

## State Classification Rules

Use this exact state machine:

- `Todo` -> `In Progress` when Captain or Build work starts.
- `In Progress` -> `In Review` when a PR opens or ready-for-review evidence exists.
- `In Review` -> `Ready for Merge` only when a PR exists, required checks are passing, and no open high/critical review findings remain.
- `Ready for Merge` -> `Done` only when the PR is merged.
- Any state -> `Blocked` only when required CI/check evidence fails, the requirement is unclear or missing, a high/critical review finding is open, or an owner/external permission blocker prevents work from proceeding.

Precedence:

- The semantic state and the external sync verdict are separate outputs.
- Classify semantic state from primary GitHub/repo evidence first, and use the canonical source-of-truth tokens `git`, `github`, `ci`, and `review-comments` in machine-readable config or reports.
- Keep semantic state and verdict separate: required CI/check failure and open high/critical review findings require `Blocked` plus `BLOCK`, while unclear/missing requirements and owner/external permission blockers remain `Blocked` semantic-state conditions unless a separate `BLOCK` evidence trigger also exists.
- Use `PASS` when the semantic state is trustworthy, no actionable work blocker requires `Blocked` plus `BLOCK`, and required external writes succeeded or no external write was required.
- If the semantic state is clear but Linear/Slack auth, tooling, channel/project permission, or write availability fails, keep that semantic state, emit `FLAG`, and do not claim the external sync succeeded.
- If durable GitHub/repo evidence resolves a mismatch against chat, memory, Linear, Slack, or another supporting surface, keep that semantic state and emit `FLAG` naming the mismatch.
- If required CI/check evidence fails or a high/critical review finding is open, emit `Blocked` semantic state and `BLOCK` verdict.
- If the requirement is unclear or missing, or an owner/external permission blocker prevents work from proceeding, emit `Blocked` semantic state and evaluate the verdict separately from readable primary evidence and external write outcome.
- If required primary evidence cannot be read, required primary-evidence read permission or evidence for semantic classification is missing, or primary GitHub/CI/review evidence conflicts enough to prevent a trustworthy state decision, emit `BLOCK` verdict and do not claim a semantic state transition succeeded.
- Do not force the semantic state to `Blocked` solely because Linear/Slack auth, tooling, channel/project permission, or write availability is unavailable.
- Prefer durable GitHub/repo evidence over chat or memory whenever evidence sources disagree.

## External Write Rules

Linear and Slack writes require explicit deployment enablement plus valid auth and project/channel permission checks.

Linear:

- Linear is the durable external work ledger.
- Captain makes the semantic decision; the adapter writes status/comments idempotently.
- Build agents must not write Linear directly.

Slack:

- Slack is a human coordination and notification surface only.
- Immediate notifications are limited to `Blocked`, CI failed, high/critical review finding, needs owner decision, and `Ready for Merge`.
- Do not post task-start, commit-push, or minor-nit noise.
- Default operational channel is `#everos-ops` (`C0ASVU15ZDY`).
- Keep the blocker channel the same until a dedicated blocker channel is registered.
- Exclude `#社交` (`C0ASM56QYUW`) from automation posting.

## Idempotency

Generate a dedupe key from repo identity plus event identity. Preferred identifiers:

- PR transition: repo + PR number + action + head sha
- check run: repo + PR/branch + `check_run.id`
- check suite: repo + PR/branch + `check_suite.id`
- workflow run: repo + PR/branch + `workflow_run.id`
- review submission: repo + PR number + `review.id`
- review comment change: repo + PR number + `pull_request_review_comment.id` + action + `comment.updated_at` when present
- merge closeout: repo + PR number + merged sha

Never emit duplicate Linear comments or Slack posts for the same dedupe key.

## Safety Boundary

- No auto-merge. Capy must never merge unless a human explicitly asks for that exact PR merge.
- Do not mutate repo settings, branch protection, secrets, or OAuth state.
- Do not send tokens, cookies, OAuth material, raw payloads, raw transcripts, private screenshots, private traces, or unrelated private UI to Linear or Slack.
- Do not claim sync succeeded when the adapter/tooling was unavailable.

## Failure Handling

- If the semantic state is clear but Linear or Slack auth, tooling, channel/project permission, or write availability is unavailable, emit `FLAG` and keep GitHub/repo evidence as source of truth.
- Missing Linear or Slack adapter permission does not force semantic state `Blocked` unless it is the owner/external permission blocker that stops the work itself from proceeding.
- If required CI/check evidence fails or a high/critical review finding is open, emit `Blocked` semantic state and `BLOCK` verdict.
- If the requirement is unclear or missing, or an owner/external permission blocker prevents work from proceeding, emit `Blocked` semantic state and evaluate the verdict separately from readable primary evidence and external write outcome.
- If required primary evidence cannot be read, required primary-evidence read permission or evidence for semantic classification is missing, or primary evidence conflict prevents a trustworthy state decision, emit `BLOCK` and do not claim a Linear state transition succeeded.
- Name the exact missing tool, auth, permission, or primary-evidence surface.

## Required Output

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
