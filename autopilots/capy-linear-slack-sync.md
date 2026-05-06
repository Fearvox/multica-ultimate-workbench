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
6. Write Linear and Slack only when the required tool surface exists, auth is valid, permissions allow the write, and the dedupe key has not already been applied.
7. Emit `CAPY_LINEAR_SLACK_SYNC` every run, even when no external write occurs.

## State Classification Rules

Use this exact state machine:

- `Todo` -> `In Progress` when Captain or Build work starts.
- `In Progress` -> `In Review` when a PR opens or ready-for-review evidence exists.
- `In Review` -> `Ready for Merge` only when a PR exists, required checks are passing, and no open high/critical review findings remain.
- `Ready for Merge` -> `Done` only when the PR is merged.
- Any state -> `Blocked` when CI fails, permission is missing, requirement is unclear, a high/critical review finding is open, or source-of-truth evidence conflicts.

If evidence conflicts, prefer durable GitHub/repo evidence over chat or memory and return `FLAG` or `BLOCK` instead of pretending certainty.

## External Write Rules

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
- review: repo + PR number + `review.id`
- merge closeout: repo + PR number + merged sha

Never emit duplicate Linear comments or Slack posts for the same dedupe key.

## Safety Boundary

- No auto-merge. Capy must never merge unless a human explicitly asks for that exact PR merge.
- Do not mutate repo settings, branch protection, secrets, or OAuth state.
- Do not send tokens, cookies, OAuth material, raw payloads, raw transcripts, private screenshots, private traces, or unrelated private UI to Linear or Slack.
- Do not claim sync succeeded when the adapter/tooling was unavailable.

## Failure Handling

- If the semantic state is clear but Linear or Slack tooling is unavailable, emit `FLAG` and keep GitHub/repo evidence as source of truth.
- If permission or evidence conflict prevents a trustworthy state decision, emit `BLOCK`.
- Name the exact missing tool or permission surface.

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
