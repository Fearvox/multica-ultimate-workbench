# Capy Process Check Lane

The Capy Process Check Lane is a dumb but solid observation path for checking
live Capy progress through Brave and Computer Use. It exists because Capy can
show useful real-time state before the same state is easy to recover from Git or
CLI tools.

It is an observation lane, not a source of authority. GitHub CLI, repository
state, CI, and review artifacts still decide whether a PR is mergeable, a task
is done, or a claim is accepted.

## When To Use It

Use this lane when a task needs live Capy state:

- checking whether a Capy task is still running, finished, or waiting;
- reading Capy thread summaries, task panels, PR panels, or review status;
- confirming whether Capy reports a PR as clean, mergeable, or reviewed;
- comparing Capy UI state with GitHub CLI or local repo state;
- diagnosing a stale Capy panel before rerun or handoff.

Do not use it for ordinary repo inspection, CI truth, secret-bearing pages, or
actions that require credentials unless the human explicitly approves the
specific destination and action.

## Evidence Ranking

| Evidence | Strength | Notes |
| --- | --- | --- |
| GitHub CLI / git state | primary | merge, checks, branches, commits, diff |
| Repo files and local commands | primary | changed files, tests, build, status |
| Capy UI through Brave | supporting | live progress and agent self-report |
| Screenshots | supporting | keep private unless separately approved |
| Chat memory | weak | use only as orientation |

## Required Block

```text
CAPY_PROCESS_CHECK
target:
browser_app:
capy_surface:
observed_state:
ui_evidence:
cli_evidence:
repo_evidence:
source_of_truth:
action_taken:
residual_risk:
verdict: PASS | FLAG | BLOCK
```

## Action Policy

- Reading Capy UI through Computer Use is allowed after the task asks for it.
- Clicking an OAuth authorization, cloud permission, merge button, publish
  button, or other state-changing control requires explicit approval at the
  action point.
- A Capy `ready` label is not enough to merge. Confirm with GitHub CLI or repo
  state first.
- If Capy and GitHub disagree, report `FLAG` and name the mismatch.
- If a page exposes secrets or unrelated private UI, stop and report `BLOCK`.

## Public Artifact Rules

Public docs may include sanitized summaries:

- Capy task state;
- public PR number if relevant;
- check counts;
- file counts;
- verdict labels;
- residual risks.

Public docs must not include:

- private thread URLs;
- live workspace IDs;
- raw screenshots;
- OAuth tokens or codes;
- cookies;
- raw request/response payloads;
- full action transcripts.

