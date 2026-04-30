---
name: workbench-code-review
description: Findings-first review discipline for code, diffs, task plans, live workflow changes, and implementation evidence.
---

# Workbench Code Review

Use this skill for reviewing code, diffs, task plans, live workflow changes, and implementation evidence before merge or closure.

## Review Stance

- Findings first. Do not lead with praise or a broad summary.
- Order findings by severity and user impact.
- Tie every finding to a file, command, issue/comment ID, run ID, or observable behavior.
- Prefer concrete repro or blast-radius evidence over style opinions.
- If no issues are found, say that clearly and name remaining test gaps.

## Severity

- `P0`: security, data loss, irreversible action, or broken primary workflow.
- `P1`: likely user-facing regression or unsafe automation.
- `P2`: correctness gap, missing edge case, or weak verification.
- `P3`: maintainability, clarity, or low-risk cleanup.

## Checklist

- Does the implementation match the promised objective?
- Are owner boundaries preserved?
- Are live mutations backed up and reversible?
- Are commands, IDs, and paths reproducible?
- Are tests or real-path checks sufficient for the blast radius?
- Did the change avoid unrelated refactors and hidden policy changes?

## Output Contract

For findings:

- `SEVERITY`
- `LOCATION`
- `ISSUE`
- `WHY IT MATTERS`
- `REQUIRED FIX`

For a clean review:

- `VERDICT: PASS`
- `EVIDENCE CHECKED`
- `TEST GAPS`
- `RESIDUAL RISK`
