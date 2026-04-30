# Workbench Debug Investigate

Use this skill for bugs, regressions, suspicious runtime behavior, failed automations, and "this should not happen" reports.

## Investigation Loop

1. State the exact symptom and expected behavior.
2. Collect the smallest real evidence: command output, log line, screenshot, issue ID, run ID, or file path.
3. Identify the owner layer: user workflow, Multica issue/comment, agent runtime, local repo, CLI wrapper, gateway/API, or external vendor.
4. Form one mechanism hypothesis and test it on the smallest real path.
5. Patch only after the mechanism is supported by evidence.
6. If two attempts fail, stop and report what is known instead of guessing harder.

## Evidence Rules

- Prefer live runtime state over stale UI state.
- Separate dashboard symptoms from backend/request evidence.
- Do not use destructive reset or broad cleanup as a diagnostic shortcut.
- Do not expose secrets, tokens, OAuth material, raw private prompts, or account identifiers.
- If the issue may involve billing or quota, report fresh input, output, cache read, cache write, model, and request attribution separately when available.

## Output Contract

Return:

- `SYMPTOM`: observed failure and expected behavior.
- `EVIDENCE`: exact files, commands, logs, screenshots, issue/comment/run IDs checked.
- `MECHANISM`: most likely root cause or "not established".
- `FIX`: patch made, or smallest proposed next test.
- `VERIFICATION`: real-path check result.
- `RESIDUAL RISK`: what may still be wrong.
