# Remote Agent Pattern

Remote agents are execution cells, not new orchestrators. They are useful for
long-running builds, repo checks, VM/browser work, and batch research when the
local laptop should stay responsive.

## Public Role Shape

| Role | Runtime Family | Max Concurrency | Use |
| --- | --- | ---: | --- |
| Remote Codex Builder | Codex | 2 | Long repo tasks, builds, benchmarks, verified implementation. |
| Remote Hermes Researcher | Hermes | 3 | Long-context research and batch knowledge synthesis. |
| Remote Ops Mechanic | Codex | 1 | Remote daemon, disk, dependency, and runtime hygiene. |
| Remote VM Runner | Codex | 1 | Bounded remote VM/browser/sandbox execution. |

## Rules

- Use the GitHub repo resource as the primary repo anchor.
- Treat laptop `file://` paths as invalid unless explicitly mounted.
- Keep remote evidence in temp or private storage by default.
- Never publish remote device names, direct IPs, tokens, screenshots, or raw run
  payloads in Git.
- Report repo-anchor failures as `FLAG` or `BLOCK`; do not silently use a
  different checkout.
- For `/goal` or `GOAL_MODE: yes`, follow `skills/workbench-goal-mode/SKILL.md` and
  keep remote evidence in temp or private issue comments unless explicitly
  approved for durable storage.
- For `L2_PRESSURE: yes`, `RV_PRESSURE: required`, HarnessMax, remote evolve,
  or leaderboard-pressure work, follow `skills/workbench-l2-pressure-gate/SKILL.md`.
- For remote Hermes review of Claude-authored public docs, skills, install maps,
  role docs, templates, or speed-match writeups, follow
  `skills/workbench-hermes-docs-sync/SKILL.md`.
- Remote Research Vault access is read-only until proven otherwise. Prefer
  `vault_status`, `vault_search`, `vault_taxonomy`, and `vault_get`; route to RV
  MCP Remote Preflight if those tools are not available.
