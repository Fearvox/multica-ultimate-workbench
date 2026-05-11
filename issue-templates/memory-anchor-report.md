# Memory Anchor Report

Use this template when routing a human-readable report as a context anchor for
future sessions. The report can help an operator resume quickly, but it does
not replace Git, CI, issue comments, runtime logs, PR review, or other source
evidence.

## Contract

```yaml
MEMORY_ANCHOR_REPORT:
  title:
  report_type: "html | markdown | pdf | other"
  source_ref:
    repo:
    commit_or_pr:
    issue_or_thread:
  evidence_refs:
    - ""
  inference_boundary:
  source_truth_boundary:
  freshness:
    as_of:
    freshness_status: "current | stale | partial | unknown"
    stale_after:
  open_loops:
    - ""
  next_session_bootstrap:
    objective:
    first_reads:
      - ""
    first_checks:
      - ""
  public_safety_scan:
    checked_for:
      - "local absolute paths"
      - "private host or IP values"
      - "SSH or tmux targets"
      - "provider tokens or auth payloads"
      - "raw secrets"
      - "private screenshots or raw transcripts"
    result: "PASS | FLAG | BLOCK"
  publish_scope:
    branch_or_pr:
    included_files:
      - ""
    excluded_files:
      - ""
  verdict: "PASS | FLAG | BLOCK"
```

## Required Checks

- Re-read the source artifact directly.
- Confirm the publish branch excludes unrelated local commits and untracked
  artifacts.
- Run `git diff --check` on the scoped diff.
- Scan touched files for local absolute paths, host or IP values, SSH or tmux
  targets, provider tokens, credential paths, raw secrets, private screenshots,
  and raw transcripts.
- State the source-truth boundary explicitly.

## Closeout

```text
MEMORY_ANCHOR_REPORT_REVIEW
source_ref:
artifact:
publish_scope:
evidence_checked:
public_safety:
source_truth_boundary:
remaining_risk:
verdict: PASS | FLAG | BLOCK
```
