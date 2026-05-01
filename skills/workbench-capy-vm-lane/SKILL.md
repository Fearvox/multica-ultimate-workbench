---
name: workbench-capy-vm-lane
description: Controlled VM/Computer execution lane for GUI, browser, sandbox, and screenshot-backed tasks.
---

# Workbench Capy VM Lane

Use this skill only when an issue declares `EXECUTION_TARGET: capy-vm` or asks for isolated GUI/browser/sandbox execution.

## Required Checks

Before execution:

1. Confirm the issue has `VM_LEASE`.
2. Confirm `secrets_policy`.
3. Confirm `network_policy`.
4. Confirm `ARTIFACTS_REQUIRED`.
5. Confirm `TEARDOWN`.

If any field is missing, return `BLOCKED` with the smallest missing field list.

## Default Policy

- `secrets_policy: none`
- `network_policy: localhost-only` for smoke tests
- `TEARDOWN: destroy`
- artifact root: local temp by default; set `CAPY_VM_ARTIFACT_DIR` explicitly for durable review evidence

## Computer API Pattern

The local smoke path uses a Scrapybara-compatible Computer API:

```bash
curl -fsS -X POST "http://127.0.0.1:${CAPY_API_PORT}/computer" \
  -H "Content-Type: application/json" \
  -d '{"action":"take_screenshot"}'
```

The response must be saved before summarizing.

## Report Contract

Always report:

- issue id,
- owner agent,
- execution target,
- lease fields,
- commands and exit codes,
- artifact paths,
- whether raw artifacts were kept outside Git,
- teardown state,
- residual risks,
- `VERDICT: PASS / FLAG / BLOCK`.

Never paste base64 screenshots, raw cookies, OAuth codes, private tokens, API keys, or unrelated screen content into comments.
