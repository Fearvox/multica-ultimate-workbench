# NYC Repo Anchor Probe Evidence

Generated for `DAS-105`, `DAS-107`, and `DAS-108`, follow-up child probes under `DAS-98`.

## Outcome

| Issue | Target | Result | Status |
| --- | --- | --- | --- |
| `DAS-105` | NYC Codex Builder GitHub URL checkout variants | SUPERSEDED_PASS | `done` |
| `DAS-107` | NYC Ops Mechanic project resource injection probe | PASS | `done` |
| `DAS-108` | NYC Codex Builder canonical `.git` resource retest | PASS_WITH_NOTE | `done` |
| `DAS-111` | NYC deploy key bootstrap | PASS | `done` |
| `DAS-112` | NYC HTTPS-to-SSH rewrite bootstrap | PASS | `done` |
| `DAS-113` | NYC post-checkout branch probe | PASS | `done` |

## Evidence IDs

- Issue: `73a944b5-2b69-42c5-9f67-2332b45673da`
- Run: `77528b91-a3ab-47b6-89c0-04d24f060b3d`
- Agent comment: `30a58f24-69af-44a9-be3a-442ae0dfeee9`
- Runtime: `hermes-nyc1`
- Resource-injection issue: `7b8ff074-1648-48d8-b0a7-1d49b746ee5d`
- Resource-injection comment: `b34763d7-27c1-4329-8d60-5dcd632d1cc9`
- Canonical `.git` project resource: `22921718-f7f6-402f-99c4-7fd84e4ae9a5`
- Retest issue: `4ccaea68-d9df-4763-9959-a538da63799c`
- Retest run: `bad34967-c32e-4509-b730-bb48457515f7`
- Retest comment: `f922e8fc-355b-4366-bfe7-050b6c9cb957`
- Workspace repo anchor replacement: `file:///Users/0xvox/multica-ultimate-workbench` -> `https://github.com/Fearvox/multica-ultimate-workbench.git`
- Post-replacement retest run: `35527292-9597-4ad8-9bc7-02fb0b7d98e8`
- Post-replacement retest comment: `1e6fb45c-58ea-4a39-b75f-4ae5601466e1`
- Deploy key bootstrap issue/comment: `DAS-111` / `a9dc5828-07c9-4d66-85fb-5c7a363245ee`
- GitHub read-only deploy key id: `150180111`
- Deploy key public fingerprint: `SHA256:ANHc19uuqPeTfoAl8dCskjbbBpb+ltT2/RwvP4GnPm4`
- SSH rewrite bootstrap issue/comment: `DAS-112` / `5a728884-bb16-4511-9a1b-bd46736bbb6a`
- Successful checkout retest run/comment: `5e648c96-eb72-4086-b3d4-60e3f3d6e646` / `329cc3c0-e06b-4fa7-831a-5543fe24d371`
- Branch probe issue/comment: `DAS-113` / `b812e801-4a04-4124-a3e2-1a2a0d74c707`
- Orchestrator closeout comment: `66356643-1e67-4fe1-a044-856e92708d11`
- `DAS-105` superseded closeout comment: `351d1cfa-62ad-4601-8649-b90b767df83e`

## Checkout Results

| Command | Result | Mechanism |
| --- | --- | --- |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git` | failed | The `.git` URL did not match any configured workspace repo. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench` | failed | The URL matched configured repo metadata, but that metadata resolved to laptop-local `/Users/0xvox/multica-ultimate-workbench`. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git` after adding `.git` project resource | failed | The URL became configured, but still resolved to the stale `file+Users+0xvox+multica-ultimate-workbench.git` sync target. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench` after adding `.git` project resource | failed | Same stale laptop-local `file+Users+0xvox+multica-ultimate-workbench.git` sync target. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git` after replacing workspace repo anchor | failed | The stale file anchor was cleared; checkout now targets `github.com+Fearvox+multica-ultimate-workbench.git`, but GitHub HTTPS credentials are unavailable in non-interactive mode. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench` after replacing workspace repo anchor | failed | Same GitHub cache path and same disabled HTTPS username prompt. |
| `git ls-remote https://github.com/Fearvox/multica-ultimate-workbench.git HEAD` after deploy key + rewrite | passed | Narrow Git rewrite mapped the repo HTTPS URL to `git@github.com:Fearvox/multica-ultimate-workbench.git`; HEAD resolved to `88eb36a160fdb05ff985d1c7bfede8905e3c964a`. |
| `git ls-remote https://github.com/Fearvox/multica-ultimate-workbench HEAD` after deploy key + rewrite | passed | The no-`.git` URL uses the same narrow rewrite and resolves to the same HEAD. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git` after deploy key + rewrite | passed | Fresh NYC workdir checked out to a GitHub SSH remote on agent worktree branch `agent/nyc-codex-builder/5e648c96`, commit `88eb36a160fdb05ff985d1c7bfede8905e3c964a`. |
| `git fetch origin codex/nyc-remote-agents` + `git switch --detach origin/codex/nyc-remote-agents` after checkout | passed | Explicit post-checkout branch step reached commit `6b74f77de13dfc2c2f5220edecccaca37b0e5fe7`, where `agents/remote/nyc-remote-agents.md` is present. |

## Finding

The remote failure is not an agent execution failure. The remote runtime can receive tasks and run commands, and fresh task workdirs receive `.multica/project/resources.json` with the GitHub project resources. A canonical `.git` GitHub project resource with `default_branch_hint=codex/nyc-remote-agents` was added and observed by the remote task.

The stale laptop-local workspace repo anchor was fixed through Multica Desktop `Settings -> DASH -> Repositories`, replacing `file:///Users/0xvox/multica-ultimate-workbench` with `https://github.com/Fearvox/multica-ultimate-workbench.git`. After the replacement, remote checkout no longer resolved to `file+Users+0xvox+...`; it resolved to the GitHub bare repo cache path.

Private repo authentication was fixed through a human-mediated read-only GitHub deploy key. The private key stays on `hermes-nyc1`; only the public key and fingerprint were reported through Multica. GitHub deploy key id `150180111` was added read-only. NYC then installed a managed SSH config block plus narrow global Git rewrites for only:

- `https://github.com/Fearvox/multica-ultimate-workbench.git`
- `https://github.com/Fearvox/multica-ultimate-workbench`

Both rewrite inputs map to `git@github.com:Fearvox/multica-ultimate-workbench.git`. Broad `https://github.com/` rewrites were explicitly checked as `0`.

The final `DAS-108` rerun proved `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git` now succeeds from a fresh NYC task workdir. The remaining note is branch targeting: `multica repo checkout` currently starts from GitHub default branch/main and exposes no branch flag. Branch-specific NYC work on this PR must explicitly run `git fetch origin codex/nyc-remote-agents` and `git switch --detach origin/codex/nyc-remote-agents` after checkout. `DAS-113` verified this reaches commit `6b74f77de13dfc2c2f5220edecccaca37b0e5fe7` and makes `agents/remote/nyc-remote-agents.md` available.

## Next Action

Use this explicit NYC repo entry sequence for PR-branch tasks until Multica checkout supports branch targeting or the branch is merged/default:

```bash
multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git
cd multica-ultimate-workbench
git fetch origin codex/nyc-remote-agents
git switch --detach origin/codex/nyc-remote-agents
git rev-parse HEAD
```

Optional hygiene follow-up: resolve the non-blocking `known_hosts` persistence warning observed in `DAS-112`. It did not block `git ls-remote` or `multica repo checkout`.
