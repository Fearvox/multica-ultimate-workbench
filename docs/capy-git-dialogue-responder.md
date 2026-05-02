# Capy Git Dialogue Responder

The Capy Git Dialogue Responder is the webhook-backed entry point for the `Capy Git Dialogue Lane`. It is whole-access and payload-scoped: when GitHub delivers an eligible event, the responder must inspect the payload and treat the payload `owner/repo` as the source repo instead of assuming the current workbench repository.

It is a public review surface, not a control plane. GitHub repo state, PR state, issue state, check state, workflow state, review artifacts, CI, and local verification remain the source of truth for implementation and merge decisions.

## Trigger Surface

| Surface | Event | Expected behavior |
| --- | --- | --- |
| Issues | `issues` with `opened`, `reopened`, `edited`, `assigned` | inspect payload repo and respond only when the event clearly summons or routes Capy |
| Issue comments | `issue_comment.created` | inspect payload repo and reply only when Capy is explicitly addressed or directly asked to act |
| Pull requests | `pull_request` with `opened`, `reopened`, `ready_for_review`, `synchronize` | inspect payload repo and post at most one concise route/review comment when appropriate |
| Review comments | `pull_request_review_comment.created` | inspect payload repo and reply only when Capy is explicitly addressed or directly asked to act |
| Review submissions | `pull_request_review.submitted` | inspect payload repo and reply only when the review text explicitly calls for Capy follow-up |
| Checks | `check_suite.completed` | inspect payload repo and comment only when Capy is already involved or explicitly waiting on the result |
| Workflows | `workflow_run.completed` | inspect payload repo and comment only when Capy is already involved or explicitly waiting on the result |

## Payload-Scoped Repo Handling

The responder must read the webhook payload before acting. At minimum it should resolve:

- payload `owner/repo`;
- event family and action;
- branch or ref when relevant;
- issue, PR, comment, review, check, or workflow state that triggered the event.

Once the payload repo is known, that repo becomes the instruction anchor for the response. If present, follow the repo-local instruction pack in this order:

1. `.capy/CAPTAIN.md`
2. `.capy/BUILD.md`
3. `.capy/REVIEW.md`
4. `AGENTS.md`
5. `CLAUDE.md`

If local instructions are absent or disagree with durable repo evidence, prefer the repo's reviewable source of truth and keep the mismatch explicit.

## Reply Policy

Avoid spam. The responder should stay silent unless at least one of these is true:

- the comment explicitly addresses `Capy`, `CAPY`, or `Captain Capy`;
- the comment contains `/capy`;
- the event reflects a Captain review or Captain action request;
- the event is a direct AI-agent action request;
- the event assigns work to Capy;
- a non-draft PR `opened`, `reopened`, `ready_for_review`, or `synchronize` event clearly benefits from one compact route/review note and no recent Capy route comment already covers it;
- a `check_suite.completed` or `workflow_run.completed` event finishes work Capy is already involved in or explicitly waiting on.

When it does respond, keep the reply concise, repo-anchored, and reviewable. Do not turn webhook delivery into a chat transcript.

## Safety Boundary

The responder must not:

- assume `Fearvox/multica-ultimate-workbench` unless the payload actually names that repo;
- merge or auto-merge unless a human explicitly asks for that exact PR or comment action;
- mutate repo settings, branch protection, webhooks, secrets, or deploy credentials without explicit approval at the action point;
- mutate Multica daemon, Desktop UI, core runtime, live skills, agent bindings, or OAuth state without explicit approval at the action point;
- publish or persist live automation IDs, webhook endpoints, secret material, raw payloads, raw transcripts, or private screenshots in public docs or review artifacts;
- treat a webhook event as proof that a repo change, review outcome, check result, or workflow result is valid.

## Evidence Ranking

| Evidence | Strength | Notes |
| --- | --- | --- |
| Payload-derived `owner/repo` plus repo state, git history, checks, workflows, and local verification | primary | determines the correct repo anchor and acceptance truth |
| GitHub comments, issues, PRs, and review artifacts | primary | durable dialogue and explicit operator requests |
| Webhook event receipt | supporting | proves a trigger arrived, not that the underlying state is correct |
| Capy or Multica self-report | supporting | useful routing context only |
| Chat memory | weak | orientation only |

If the payload, repo state, and review state disagree, report `FLAG` and keep the contradiction explicit.

## Public Artifact Rules

Safe durable records may include:

- responder purpose and trigger classes;
- payload-scoped repo-handling rules;
- bounded reply policy;
- sanitized verification shape;
- commit subjects, issue comments, PR comments, and review comments when they are already public repo artifacts;
- PASS / FLAG / BLOCK style verdicts and residual risk summaries.

Do not publish automation UUIDs, endpoint URLs, webhook secrets, raw delivery payloads, internal run transcripts, or private UI captures.
