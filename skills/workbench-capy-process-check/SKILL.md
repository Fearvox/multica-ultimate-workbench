---
name: workbench-capy-process-check
description: Use when checking live Capy task or PR state through Brave, Computer Use, or a Capy browser panel.
---

# Workbench Capy Process Check

Use this skill when the task asks to observe Capy in real time through Brave,
Computer Use, or a Capy PR/thread panel.

## Required Reads

1. `docs/capy-process-check-lane.md`
2. Current Capy UI state through the approved browser/computer surface
3. GitHub CLI or git state when the check concerns PR, branch, CI, merge, or
   repository status

## Rules

- Treat Capy UI as supporting evidence, not the source of truth.
- Confirm PR and merge claims with GitHub CLI or repo state.
- Do not click OAuth, merge, publish, permission, or destructive controls unless
  the human explicitly approves that exact action.
- Do not copy private thread URLs, screenshots, raw logs, cookies, OAuth codes,
  tokens, or unrelated private UI into public docs.
- If the browser page asks for credentials or new access, stop unless that exact
  access was approved.

## Report Contract

Always report:

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

`PASS` requires UI state and primary evidence to agree. `FLAG` means the lane is
usable but evidence is incomplete or stale. `BLOCK` means a permission, secret,
wrong target, or evidence mismatch prevents action.

