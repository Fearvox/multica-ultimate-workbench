# Bounded Supervisor Review Gate v0 Polish

Status: proposed
Generated: 2026-05-14
Source context:

- DAS-2658: Multica self-optimization packet.
- DAS-2659: Bounded Supervisor Review Gate v0 PASS.
- DAS-2659 evidence comments: `e56d1f32` on DAS-2658 and `42b14640`
  on DAS-2659.

## Purpose

Bounded Supervisor Review Gate v0 exists to review narrow `in_review` work
without reviving broad sweepers or laundering incomplete work into `done`.

This polish tightens the wording around evidence, verdicts, and status actions
so that literal `PASS`, `FLAG`, and `BLOCK` verdicts remain source truth. A
target with red state, unverified repo association, pending live runs, or
remaining blocking risk cannot receive `PASS`.

## Non-Goals

- No skill mutation.
- No autopilot reactivation.
- No schedule or trigger changes.
- No daemon, Desktop, runtime, provider, or agent-config mutation.
- No broad issue sweep.
- No implementation of target work.

## Verdict Contract

Every reviewed target must end with exactly one literal verdict:

```text
VERDICT: PASS | FLAG | BLOCK
```

The verdict is not advisory text. It controls the allowed status action.

| Verdict | Meaning | Required next state |
| --- | --- | --- |
| `PASS` | The target goal is satisfied, required evidence is current, and no required follow-up remains. | May move to `done`, or may stay `in_review` only when an explicit reviewer handoff remains. |
| `FLAG` | The target is useful but still has bounded missing evidence, residual risk, or required follow-up. | Must remain `in_review` with a concrete next action. |
| `BLOCK` | Proceeding is unsafe, externally impossible, or correctness/security evidence is missing. | Must move to `blocked` only when the blocker is real and named; otherwise keep `in_review` with `FLAG`. |

Adapters, agents, and humans must not rewrite `FLAG` or `BLOCK` into `PASS`
based on tone, "LGTM", partial confidence, or unrelated completed work.

## Required Evidence Before Verdict

For every target:

```text
multica issue get <target-id> --output json
multica issue comment list <target-id> --output json
multica issue runs <target-id> --full-id --output json
```

Also required when claimed by the target:

| Claim type | Minimum evidence |
| --- | --- |
| Repo or file change | Repo URL, local path, branch, commit SHA, changed file paths, and `git status --short --branch`. |
| GitHub PR | PR URL or number, head branch, merge/base branch, current state, and check status when checks exist. |
| GitHub issue | GitHub issue URL or number plus the linked Multica issue ID. |
| CI/build/test pass | Exact command, exit status, and relevant summary line. |
| Live run complete | `multica issue runs` proof that the relevant run is complete, failed, or blocked; pending/running is not proof. |
| Public-surface safety | Added-lines scan or explicit not-applicable rationale for secrets, tokens, private paths, host/IP values, raw payloads, and operator-only commands. |
| No repo change | Explicit rationale naming why repo proof is not applicable. |

Evidence must be current to the gate run. Old comments may explain history, but
they do not replace fresh target readback.

## Source-Truth Hierarchy

Use the newest available source at the highest reliable layer:

1. Current Multica target issue JSON, comments, and runs.
2. Current repo state: branch, commit, diff, local file path, GitHub PR/CI when
   applicable.
3. Project-bound resources attached to the Multica project.
4. Explicit operator decisions in current issue comments.
5. Prior gate comments and review summaries.
6. Memory, cockpit summaries, Tanka, Slack/Gmail excerpts, screenshots, and old
   transcripts as leads only.

If a lower layer conflicts with current issue or repo evidence, the current
issue or repo evidence wins and the conflict becomes residual risk.

## Status-Action Mapping

Each target output must include:

```text
STATUS_ACTION: done | kept_in_review | blocked | no_change
NEXT_ACTION:
VERDICT: PASS | FLAG | BLOCK
```

Allowed combinations:

| `STATUS_ACTION` | Allowed verdicts | Notes |
| --- | --- | --- |
| `done` | `PASS` only | Use only when the target goal is satisfied and all required evidence is present. |
| `kept_in_review` | `PASS` or `FLAG` | `PASS` is allowed only for explicit human/Supervisor handoff after evidence passes; `FLAG` requires a bounded next action. |
| `blocked` | `BLOCK` only | The blocker must name the missing external permission, unsafe condition, or impossible dependency. |
| `no_change` | `PASS`, `FLAG`, or `BLOCK` | Use for controller reviews or when the gate intentionally only reports. The target verdict still controls the next action. |

`PASS` with `STATUS_ACTION: no_change` must explain why no status mutation is
being performed.

## No-PASS Examples

### Missing Repo Proof

No `PASS` when a target claims a repo-backed artifact but does not provide repo
URL, branch, commit SHA, changed paths, and current git status.

```text
Finding: target says "doc added" but only links a Multica comment.
Verdict: FLAG
Status action: kept_in_review
Next action: provide repo path, branch, commit SHA, and changed file list.
```

### Live Run Still Pending

No `PASS` when the latest relevant run is still `running`, `queued`, or
`pending`.

```text
Finding: implementation run has not completed; no failure or success result exists.
Verdict: FLAG
Status action: kept_in_review
Next action: wait for run completion, then re-read `multica issue runs`.
```

### Remaining FLAG/BLOCK Risk

No `PASS` when the closeout itself names required follow-up, unresolved
correctness risk, security risk, public-surface risk, or blocked dependencies.

```text
Finding: closeout says public-surface scan remains and CI was not run.
Verdict: FLAG
Status action: kept_in_review
Next action: run the scan or state why it is not applicable.
```

If the remaining item is unsafe or externally impossible to resolve inside the
current issue, use `BLOCK`.

### Unverified GitHub Association

No `PASS` when a target requires GitHub association but lists `pr: none`,
`branch: none`, and `commit: none` without an explicit no-repo-change rationale.

```text
Finding: repo-backed issue has expected Markdown artifact but no branch, commit,
PR, or no-repo-change rationale.
Verdict: FLAG
Status action: kept_in_review
Next action: attach branch/commit proof or explain why no repo artifact exists.
```

## Output Template

Per target:

```text
BOUNDED_SUPERVISOR_REVIEW
TARGET:
TRIGGER:
EVIDENCE_CHECKED:
FINDINGS:
STATUS_ACTION: done | kept_in_review | blocked | no_change
NEXT_ACTION:
VERDICT: PASS | FLAG | BLOCK
```

Run summary:

```text
RUN SUMMARY
TARGETS_SCANNED:
TARGETS_REVIEWED:
PASSED_TO_DONE:
FLAGGED_LEFT_IN_REVIEW:
BLOCKED:
PENDING:
NO_TARGETS:
RESIDUAL_RISK:
VERDICT: PASS | FLAG | BLOCK
```

## Reviewer's Final Check

Before writing `PASS`, answer yes to all applicable questions:

- Did I re-read the target issue, comments, and runs in this gate run?
- If repo-backed, do I have repo URL, branch, commit SHA, paths, and git status?
- If GitHub-backed, do I have PR/issue/check state or a reason it is not
  applicable?
- Are all required runs complete or explicitly failed/blocked?
- Is `REMAINING:` empty or non-blocking?
- Did the public-surface scan pass, or is it explicitly not applicable?
- Does the status action match the literal verdict?

If any answer is no, the verdict is `FLAG` or `BLOCK`, not `PASS`.

## Concrete Evidence For This Draft

- Target file: `docs/ops/bounded-supervisor-review-gate-v0-polish.md`.
- Source context read: DAS-2658 issue/comments; DAS-2659 issue/comment
  `42b14640`; DAS-2663 issue/comment history.
- Scope held: Markdown-only policy draft; no `skills/`, autopilot, runtime,
  daemon, provider, schedule, Desktop, or agent-config mutation.
- Required issue criteria covered: exact evidence requirements, no-PASS
  examples, status-action mapping, source-truth hierarchy, literal
  `PASS`/`FLAG`/`BLOCK` preservation.

VERDICT: PASS
