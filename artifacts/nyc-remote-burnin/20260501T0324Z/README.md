# NYC Remote Burn-In Evidence

Generated for `DAS-98` and child probes `DAS-99` through `DAS-102`.
Follow-up repo-anchor evidence lives in `artifacts/nyc-repo-anchor-probe/20260501T0430Z/README.md` for `DAS-105`, `DAS-107`, and `DAS-108`.

## Outcome

| Issue | Target | Result | Status |
| --- | --- | --- | --- |
| `DAS-98` | Parent aggregate | FLAG_WITH_REPO_PATH_FIXED | `in_review` |
| `DAS-99` | NYC Codex Builder | SUPERSEDED_PASS | `done` |
| `DAS-100` | NYC VM Runner | FLAG | `in_review` |
| `DAS-101` | NYC Ops Mechanic | PASS | `done` |
| `DAS-102` | NYC Hermes Researcher | PASS | `done` |
| `DAS-108` | NYC canonical `.git` checkout retest | PASS_WITH_NOTE | `done` |
| `DAS-111` | NYC deploy key bootstrap | PASS | `done` |
| `DAS-112` | NYC HTTPS-to-SSH rewrite bootstrap | PASS | `done` |
| `DAS-113` | NYC post-checkout branch probe | PASS | `done` |

## Findings

- Remote task dispatch worked for all four NYC agents.
- All four remote agents returned to `idle` after the run.
- No repo edits, daemon mutation, destructive commands, container starts, browser launches, VM sessions, raw env dumps, or credential material were used.
- Remote pressure looked acceptable: disk was about 60% used with about 31G available, and runtime checks reported about 1.7Gi available memory during the wave.
- `DAS-99` originally confirmed the remote Codex lane needed repo-anchor repair: checkout resolved to stale laptop-local `file://` metadata instead of the GitHub project resource. It was later closed as `SUPERSEDED_PASS` after `DAS-108` and `DAS-113` proved the corrected repo path.
- `DAS-105` confirmed the mechanism: the `.git` GitHub URL is not configured, while the no-`.git` GitHub URL matches workspace metadata that still points at the laptop-local `/Users/0xvox/...` repo.
- `DAS-107` confirmed fresh remote workdirs receive `.multica/project/resources.json` with the GitHub project resource.
- `DAS-108` confirmed adding a canonical `.git` GitHub project resource plus `default_branch_hint=codex/nyc-remote-agents` does not fix the stale backing store: both GitHub URL variants still sync against `file+Users+0xvox+multica-ultimate-workbench.git`.
- Multica Desktop `Settings -> DASH -> Repositories` was used to replace the workspace repo anchor with `https://github.com/Fearvox/multica-ultimate-workbench.git`.
- The post-replacement `DAS-108` rerun confirmed the stale file anchor was cleared; checkout targeted the GitHub bare repo cache path but initially blocked on non-interactive private-repo authentication.
- `DAS-111` generated a remote ed25519 deploy key on `hermes-nyc1` and reported only public key plus fingerprint. GitHub deploy key id `150180111` was added read-only.
- `DAS-112` installed a managed SSH config plus narrow Git rewrites for only the two Ultimate Workbench HTTPS URLs. Both URL forms passed `git ls-remote` through the deploy key. Broad `https://github.com/` rewrites were checked as `0`.
- The final `DAS-108` rerun proved `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git` succeeds from a fresh NYC task workdir, resolving to `git@github.com:Fearvox/multica-ultimate-workbench.git` rather than the stale laptop-local file repo.
- `DAS-113` proved the branch-specific flow: after checkout, explicit `git fetch origin codex/nyc-remote-agents` and `git switch --detach origin/codex/nyc-remote-agents` reaches commit `6b74f77de13dfc2c2f5220edecccaca37b0e5fe7`, where `agents/remote/nyc-remote-agents.md` is present.
- `DAS-100` confirmed the remote VM lane is not ready for actual VM/browser smoke: Docker and browser binaries were absent, and full lease fields were not declared.
- `DAS-101` noted tmux still had sessions, including an attached Hermes-named session; no cleanup was attempted.

## NYC Repo Entry Sequence

Use this for repo-backed work on the active PR branch until Multica checkout supports a branch flag or the branch is merged/default:

```bash
multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git
cd multica-ultimate-workbench
git fetch origin codex/nyc-remote-agents
git switch --detach origin/codex/nyc-remote-agents
git rev-parse HEAD
```

Expected HEAD for this batch: `6b74f77de13dfc2c2f5220edecccaca37b0e5fe7`.

The parent remains `FLAG_WITH_REPO_PATH_FIXED` only because VM/browser tooling is a separate remaining lane. Repo-safe NYC Codex execution is no longer the blocker.

## Files

- `das-98-*`: parent controller issue, comments, and runs.
- `das-99-*`: NYC Codex Builder probe.
- `das-100-*`: NYC VM Runner dry-lease probe.
- `das-101-*`: NYC Ops Mechanic pressure probe.
- `das-102-*`: NYC Hermes Researcher synthesis probe.
- `agents-after.json`: final NYC agent status.
- `runtimes-after.json`: final NYC runtime status.
