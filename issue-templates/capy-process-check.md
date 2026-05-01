# Capy Process Check Issue Template

Use this when an agent needs to check a Capy thread, task, PR panel, or review
state through Brave and Computer Use.

```text
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:

EXECUTION_TARGET: human-desktop-browser
CAPY_PROCESS_CHECK_REQUEST:
  target:
  browser_app: Brave Browser
  capy_surface: thread | task | pull_request | review_panel
  allowed_actions: observe-only
  primary_evidence_required:
    - github-cli
    - git-status
  public_artifact_policy: summaries-only

Required output:

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

