# Workbench Browser Proofshot QA

Use this skill for browser-based verification, Playwright checks, proof screenshots, local web app dogfooding, and reproducible UI evidence.

## Browser Verification Loop

1. Start or identify the real app URL.
2. Record browser, viewport, account/auth state, and build/commit when available.
3. Exercise the user workflow, not only page load.
4. Capture screenshots or trace artifacts for states that matter.
5. Check console errors, failed network requests, obvious layout breakage, and final persisted state.
6. Report exact repro steps and evidence paths.

## Boundaries

- Do not edit code during report-only QA unless explicitly assigned.
- Do not treat a static screenshot as proof that a workflow works.
- Do not rely on cached authenticated state without saying so.
- Do not include private data in screenshots or copied logs.

## Output Contract

Return:

- `BROWSER_VERDICT`: PASS / FLAG / BLOCK.
- `RUN`: URL, viewport, browser/tool, commit/build if known.
- `STEPS`: concise repro or verification path.
- `EVIDENCE`: screenshot/trace/log paths.
- `FINDINGS`: ordered by severity.
- `FOLLOW-UP`: smallest fix or re-test needed.
