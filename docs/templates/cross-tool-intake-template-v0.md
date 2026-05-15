# Cross-Tool Intake Template v0

Use this template to capture an inbound item from a cockpit, mailbox, or
upstream tool **before** deciding whether it should become a MUW issue, a
comment, a PR thread, or get dropped. This is a triage form, not an issue
body. The output of one capture can later seed an issue using
`issue-templates/implementation.md` or a similar contract.

## Scope (v0)

Supported sources:

- **Tanka** (cockpit / mailbox summarizer)
- **GitHub** (issues, PRs, comments, diffs, commits)
- **Linear** (issues, comments, project notes)

Out of scope for v0:

- Gmail, Slack, Discord, calendar, personal/comms intake.
- Any source that requires raw OAuth, signed URLs, or private host/IP refs to identify.

## Why This Exists

External cockpits like Tanka surface a lot of leads. Most of them are
*summaries*, not *source truth*. This template forces three things up front:

1. Tell the source-of-truth surface apart from the cockpit summary.
2. State the repo relation explicitly, so we never PASS without a verifiable
   GitHub association or an explicit no-repo-change rationale.
3. Redact the seven forbidden categories before the capture is filed.

## Required Checks

- Confirm `source_type` is one of `Tanka | GitHub | Linear`. Anything else: BLOCK.
- If `source_type = Tanka`, treat the captured text as `cockpit_summary` by
  default. A live read of the underlying GitHub / Linear surface is required
  before PASS unless the item is explicitly classified as `no_repo_change`.
- Fill `github_association`. If `requires_repo_change = yes`, the
  `repo_path` and at least one of `branch_or_sha | pr_or_issue` must be
  present. If `requires_repo_change = no`, fill
  `no_repo_change_rationale` instead.
- Run the redaction scan. The seven forbidden categories are:
  1. Raw OAuth tokens, API keys, session cookies, refresh tokens.
  2. Signed URLs (S3 presigned, time-limited download links, signed asset URLs).
  3. Raw screenshots, private screen captures, raw browser traces.
  4. Private channel or thread IDs (Slack/Discord IDs, group chat IDs, Tanka
     private thread IDs, Linear private team slugs).
  5. Credential file paths, env var values, `.env` snippets, keychain refs.
  6. Private host / IP / SSH / tmux targets, internal hostnames, private DNS.
  7. Full private payloads — raw API responses, raw transcripts, raw mailbox
     bodies, raw private docs.
  Any hit downgrades to FLAG (redact and proceed) or BLOCK (cannot safely capture).
- Decide `becomes_muw_issue` explicitly. `needs_triage` is allowed; silent
  unspecified is not.
- End with `verdict: PASS | FLAG | BLOCK` and concrete evidence refs.

## Contract

```yaml
CROSS_TOOL_INTAKE_V0:
  captured_at:           # RFC3339, e.g. 2026-05-13T22:30:00Z
  captured_by:           # agent or operator name (no private IDs)

  source_type:           # Tanka | GitHub | Linear
  source_truth_kind:     # source_truth | cockpit_summary

  source_identity:
    # Fill exactly one block matching source_type.
    tanka:
      thread_or_summary_label:   # short opaque label, no private thread ID
      tanka_link:                # link if public; otherwise "n/a"
    github:
      repo:                       # owner/name, public ref only
      ref:                        # pr_number | issue_number | branch | sha
      ref_kind:                   # pr | issue | comment | commit | branch
    linear:
      issue_key:                  # e.g. EVE-123 (sanitized)
      team_or_project_label:      # public-facing label, not internal slug

  repo_relation:
    primary_repo:                 # in_workspace | external_known | unknown_or_new
    target_repo:                  # owner/name or "n/a"
    requires_repo_change:         # yes | no

  github_association:
    repo_path:                    # full repo URL or "n/a"
    branch_or_sha:                # branch name, sha, or "n/a"
    pr_or_issue:                  # PR# / issue# / "n/a"
    no_repo_change_rationale:     # required if requires_repo_change = no

  privacy_level:                  # public | shared_with_workspace | private_operator_only

  redaction_scan:
    forbidden_kinds_checked:
      - raw OAuth tokens / API keys / cookies
      - signed URLs (S3, presigned, time-limited)
      - raw screenshots / private screen captures
      - private channel / thread IDs (Slack, Discord, Tanka private)
      - credential paths / env values
      - private host / IP / SSH / tmux targets
      - full private payloads (raw API responses, raw transcripts)
    result:                       # PASS | FLAG | BLOCK
    redactions_applied:           # list what was stripped/replaced
    block_reason:                 # required if result = BLOCK

  cockpit_vs_source_truth:
    captured_from:                # live_read | cockpit_digest | mention_paste | other
    if_cockpit_required_live_check:
      checked:                    # yes | no | not_applicable
      live_evidence_ref:          # GitHub URL, Linear issue key, etc. — or "n/a"

  intent_summary:
    one_liner:                    # plain text, what this capture is about
    proposed_action:              # open MUW issue | comment on existing issue | PR thread | noop | needs_triage

  becomes_muw_issue:              # yes | no | needs_triage
  reasoning_for_decision:         # one-paragraph rationale

  acceptance_evidence:
    - # concrete refs justifying verdict (URLs, issue keys, commit shas)

  verdict:                        # PASS | FLAG | BLOCK
```

## Verdict Rules

- **PASS** requires:
  - `source_type` is one of the three supported values.
  - All five classification fields are filled
    (`source_type`, `repo_relation`, `privacy_level`,
    `github_association` or explicit no-repo-change rationale,
    `becomes_muw_issue`).
  - `redaction_scan.result = PASS`.
  - For `source_truth_kind = cockpit_summary`, a live check is recorded with a
    concrete `live_evidence_ref` — unless `requires_repo_change = no` and the
    rationale explicitly says no live check is needed.
  - At least one entry in `acceptance_evidence`.

- **FLAG** when:
  - Redactions were applied but the capture is otherwise complete.
  - Live check is pending but the item is low-risk and the operator has been
    asked to confirm.
  - Classification is best-effort because the upstream surface is ambiguous.

- **BLOCK** when:
  - The item cannot be captured without leaking a forbidden category.
  - `source_type` is outside the v0 scope.
  - Required GitHub association is missing and no rationale is given.

## Examples

### Example A — Tanka cockpit summary about an upstream PR

```yaml
CROSS_TOOL_INTAKE_V0:
  captured_at: 2026-05-13T23:10:00Z
  captured_by: Workbench Admin

  source_type: Tanka
  source_truth_kind: cockpit_summary

  source_identity:
    tanka:
      thread_or_summary_label: ev-upstream-digest-week-19
      tanka_link: n/a

  repo_relation:
    primary_repo: external_known
    target_repo: EverMind-AI/EverOS
    requires_repo_change: no

  github_association:
    repo_path: https://github.com/EverMind-AI/EverOS
    branch_or_sha: n/a
    pr_or_issue: n/a
    no_repo_change_rationale: |
      Cockpit digest says upstream merged a refactor we already track via our
      fork's mirror. No MUW-side change. Filing as a lead, not a task.

  privacy_level: shared_with_workspace

  redaction_scan:
    forbidden_kinds_checked:
      - raw OAuth tokens / API keys / cookies
      - signed URLs
      - raw screenshots
      - private channel / thread IDs
      - credential paths / env values
      - private host / IP / SSH / tmux targets
      - full private payloads
    result: FLAG
    redactions_applied:
      - "Stripped Tanka private thread ID; replaced with opaque label
        ev-upstream-digest-week-19."
      - "Stripped one screenshot link from the digest; kept the plain-text
        summary only."
    block_reason: n/a

  cockpit_vs_source_truth:
    captured_from: cockpit_digest
    if_cockpit_required_live_check:
      checked: yes
      live_evidence_ref: https://github.com/EverMind-AI/EverOS/commits/main

  intent_summary:
    one_liner: "Upstream EverOS merged a refactor; verify our fork mirror is current."
    proposed_action: noop

  becomes_muw_issue: no
  reasoning_for_decision: |
    Source truth (upstream main commit history) confirms the merge but does
    not require any MUW-side action. The Tanka digest is a lead, not a task.
    Filed as captured intake for audit only.

  acceptance_evidence:
    - https://github.com/EverMind-AI/EverOS/commits/main (live read, 2026-05-13)
    - Fearvox/EverOS fork mirror reports the same head sha

  verdict: FLAG
```

### Example B — GitHub PR comment that should become a MUW issue, with Linear cross-ref

```yaml
CROSS_TOOL_INTAKE_V0:
  captured_at: 2026-05-13T23:42:00Z
  captured_by: Workbench Admin

  source_type: GitHub
  source_truth_kind: source_truth

  source_identity:
    github:
      repo: Fearvox/multica-ultimate-workbench
      ref: 481
      ref_kind: pr

  repo_relation:
    primary_repo: in_workspace
    target_repo: Fearvox/multica-ultimate-workbench
    requires_repo_change: yes

  github_association:
    repo_path: https://github.com/Fearvox/multica-ultimate-workbench
    branch_or_sha: feature/intake-template-v0
    pr_or_issue: PR#481
    no_repo_change_rationale: n/a

  privacy_level: public

  redaction_scan:
    forbidden_kinds_checked:
      - raw OAuth tokens / API keys / cookies
      - signed URLs
      - raw screenshots
      - private channel / thread IDs
      - credential paths / env values
      - private host / IP / SSH / tmux targets
      - full private payloads
    result: PASS
    redactions_applied: []
    block_reason: n/a

  cockpit_vs_source_truth:
    captured_from: live_read
    if_cockpit_required_live_check:
      checked: not_applicable
      live_evidence_ref: n/a

  intent_summary:
    one_liner: |
      Reviewer asked to add redaction-scan coverage for signed URLs to the
      intake template. Linear issue EVE-123 tracks the same theme on the
      upstream side.
    proposed_action: open MUW issue

  becomes_muw_issue: yes
  reasoning_for_decision: |
    Direct read of the PR comment thread (source truth) shows a concrete
    request scoped to a repo file under our control. Linear EVE-123 is a
    parallel upstream lead, recorded for cross-ref but not the action driver.

  acceptance_evidence:
    - https://github.com/Fearvox/multica-ultimate-workbench/pull/481#discussion (live read)
    - Linear EVE-123 (cross-reference only, not source of action)

  verdict: PASS
```

## Source Truth vs Cockpit Summary

| Field                       | source_truth                                     | cockpit_summary                                  |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Where it came from          | Direct read of GitHub diff / PR / comment, Linear issue body | Tanka digest, mailbox summary, mention paste     |
| Required live check         | Already a live read                              | Yes, with a concrete `live_evidence_ref`          |
| Counts as evidence by itself | Yes                                              | No — needs a paired source-truth ref before PASS |

Tanka captures are **always** `cockpit_summary` in v0. GitHub and Linear
captures are `source_truth` only when the capture is a direct read of the
underlying artifact; pastes from a digest are `cockpit_summary` even if the
upstream surface is GitHub or Linear.

## Closeout

```text
CROSS_TOOL_INTAKE_REVIEW
source_type:
source_identity:
repo_relation:
github_association:
privacy_level:
redaction_scan_result:
cockpit_vs_source_truth:
becomes_muw_issue:
acceptance_evidence:
residual_risk:
verdict: PASS | FLAG | BLOCK
```
