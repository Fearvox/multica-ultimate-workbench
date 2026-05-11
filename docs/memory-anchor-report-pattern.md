# Memory Anchor Report Pattern

Memory-anchor reports are human-readable HTML or Markdown artifacts that help an
operator resume context quickly. They are allowed to summarize evidence,
surface open loops, and generate next-session prompts. They are not source of
truth and must not promote stale or unverified claims.

This pattern came from the Windburn HTML memory-anchor route in DAS-2657 and
the scoped publication of `project-windburn` PR #22. The useful part is the
shape: a compact report that anchors review without dragging private local state
into public surfaces.

## Use When

Use a memory-anchor report when an agent or operator needs to resume a
multi-session thread and the raw evidence is spread across issues, commits,
comments, PRs, or local notes.

Good fits:

- A public-safe summary of a completed research or dogfood pass.
- A next-session bootstrap for a long-running issue.
- A compact map of evidence, assumptions, open loops, and freshness.
- A visual or editorial report that helps humans orient faster.

Poor fits:

- Replacing Git, CI, Multica issue evidence, or PR review.
- Promoting unverified claims into durable truth.
- Storing raw transcripts, private screenshots, private payloads, secrets, or
  host-specific operator details.
- Hiding missing verification behind good visual presentation.

## Required Fields

```yaml
MEMORY_ANCHOR_REPORT:
  title: ""
  report_type: "html | markdown | pdf | other"
  source_ref:
    repo: ""
    commit_or_pr: ""
    issue_or_thread: ""
  evidence_refs:
    - ""
  inference_boundary: ""
  source_truth_boundary: ""
  freshness:
    as_of: "YYYY-MM-DD"
    freshness_status: "current | stale | partial | unknown"
    stale_after: "YYYY-MM-DD | none"
  open_loops:
    - ""
  next_session_bootstrap:
    objective: ""
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
    branch_or_pr: ""
    included_files:
      - ""
    excluded_files:
      - ""
  verdict: "PASS | FLAG | BLOCK"
```

## Trust Boundary

The report may say:

- "This is what the evidence appeared to show as of this date."
- "Start the next session by checking these issues, commits, and PRs."
- "These claims still need fresh verification."

The report must not say or imply:

- "This claim is true because the report says so."
- "This HTML artifact resets staleness."
- "This visual summary can replace PR, CI, issue, or runtime evidence."
- "Unreviewed local files are safe to publish because they are adjacent."

## Publication Rule

Publish from a scoped branch whenever the source repository has unrelated local
commits or untracked artifacts. The publish branch should include only the
report artifact and any directly required repo-relative support files.

Do not publish an ahead local branch wholesale just to land a report.

For Windburn-style HTML reports, the safe path is:

1. Re-read the source commit and artifact directly.
2. Create a branch from the public base branch.
3. Restore only the report artifact.
4. Run `git diff --check`.
5. Scan touched files for public-surface leaks.
6. Open and merge a scoped PR only when the branch compare is clean.

## Review Verdicts

`PASS` means the report is scoped, public-safe, and clearly labels source truth
and freshness boundaries.

`FLAG` means the report is useful but publication, freshness, or source-truth
proof is incomplete.

`BLOCK` means the artifact leaks private material, includes unrelated local
state, or presents unverified claims as durable truth.
