# NYC Remote Burn-In Evidence

Generated for `DAS-98` and child probes `DAS-99` through `DAS-102`.
Follow-up repo-anchor evidence lives in `artifacts/nyc-repo-anchor-probe/20260501T0430Z/README.md` for `DAS-105`, `DAS-107`, and `DAS-108`.

## Outcome

| Issue | Target | Result | Status |
| --- | --- | --- | --- |
| `DAS-98` | Parent aggregate | BLOCK | `blocked` |
| `DAS-99` | NYC Codex Builder | FLAG | `blocked` |
| `DAS-100` | NYC VM Runner | FLAG | `in_review` |
| `DAS-101` | NYC Ops Mechanic | PASS | `done` |
| `DAS-102` | NYC Hermes Researcher | PASS | `done` |

## Findings

- Remote task dispatch worked for all four NYC agents.
- All four remote agents returned to `idle` after the run.
- No repo edits, daemon mutation, destructive commands, container starts, browser launches, VM sessions, raw env dumps, or credential material were used.
- Remote pressure looked acceptable: disk was about 60% used with about 31G available, and runtime checks reported about 1.7Gi available memory during the wave.
- `DAS-99` confirmed the remote Codex lane still needs repo-anchor repair: checkout resolves to stale laptop-local `file://` metadata instead of the GitHub project resource.
- `DAS-105` confirmed the mechanism: the `.git` GitHub URL is not configured, while the no-`.git` GitHub URL matches workspace metadata that still points at the laptop-local `/Users/0xvox/...` repo.
- `DAS-107` confirmed fresh remote workdirs receive `.multica/project/resources.json` with the GitHub project resource.
- `DAS-108` confirmed adding a canonical `.git` GitHub project resource plus `default_branch_hint=codex/nyc-remote-agents` does not fix the stale backing store: both GitHub URL variants still sync against `file+Users+0xvox+multica-ultimate-workbench.git`.
- `DAS-100` confirmed the remote VM lane is not ready for actual VM/browser smoke: Docker and browser binaries were absent, and full lease fields were not declared.
- `DAS-101` noted tmux still had sessions, including an attached Hermes-named session; no cleanup was attempted.

## Files

- `das-98-*`: parent controller issue, comments, and runs.
- `das-99-*`: NYC Codex Builder probe.
- `das-100-*`: NYC VM Runner dry-lease probe.
- `das-101-*`: NYC Ops Mechanic pressure probe.
- `das-102-*`: NYC Hermes Researcher synthesis probe.
- `agents-after.json`: final NYC agent status.
- `runtimes-after.json`: final NYC runtime status.
