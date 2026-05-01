# NYC Remote Agents

This file records the remote execution-cell configuration for `hermes-nyc1-multica`.

## Runtime Cell

| Runtime | ID | Provider | Device |
| --- | --- | --- | --- |
| NYC Codex | `950bed98-fc63-406d-b1cf-51c54f1c6b25` | `codex` | `hermes-nyc1-multica` |
| NYC Hermes | `cac02d4a-3372-48b5-8867-9d5649db7448` | `hermes` | `hermes-nyc1-multica` |

## Agents

| Agent | ID | Runtime | Max Tasks | Purpose |
| --- | --- | --- | ---: | --- |
| NYC Codex Builder | `0c567b7b-34dd-4026-a390-251f2d713086` | NYC Codex | 2 | Long repo tasks, builds, benchmarks, verified implementation. |
| NYC Hermes Researcher | `1d473c40-8bbe-47ee-8420-441ec75a9c0e` | NYC Hermes | 3 | Long-context research and batch knowledge synthesis. |
| NYC Ops Mechanic | `7a5ee651-22bb-48a5-9c2b-48e6cb1f1328` | NYC Codex | 1 | Remote daemon, disk, dependency, and runtime hygiene. |
| NYC VM Runner | `3ab94250-5f2f-4d24-9acc-35ba4f5bf019` | NYC Codex | 1 | Bounded remote VM/browser/sandbox execution. |

## Operating Notes

- Remote agents are Outer Ring execution cells, not orchestrators.
- Remote Codex agents use empty `custom_args`; `DAS-94` proved `codex app-server` rejects laptop-style `--ask-for-approval`.
- Remote agents must not store or print Multica tokens, OAuth material, API keys, cookies, or private credentials.
- The `Ultimate Workbench` GitHub repo resource is the primary repo anchor.
- The laptop `file:///Users/0xvox/multica-ultimate-workbench` path is invalid on `hermes-nyc1-multica` unless explicitly mounted there.
- Evidence lives under `artifacts/nyc-remote-agents/20260501T0215Z`.

## Smoke Status

| Issue | Target | Result | Note |
| --- | --- | --- | --- |
| `DAS-94` | NYC Codex Builder | FLAG | Remote Codex task execution worked after clearing custom args; repo checkout still needs remote-safe repo anchor reconciliation. |
| `DAS-95` | NYC Hermes Researcher | PASS | Remote Hermes task execution, issue read/comment/status operations, and runtime identity checks passed. |
