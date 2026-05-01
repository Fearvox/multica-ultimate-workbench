# NYC Repo Anchor Probe Evidence

Generated for `DAS-105`, `DAS-107`, and `DAS-108`, follow-up child probes under `DAS-98`.

## Outcome

| Issue | Target | Result | Status |
| --- | --- | --- | --- |
| `DAS-105` | NYC Codex Builder GitHub URL checkout variants | FLAG | `blocked` |
| `DAS-107` | NYC Ops Mechanic project resource injection probe | PASS | `done` |
| `DAS-108` | NYC Codex Builder canonical `.git` resource retest | BLOCK | `blocked` |

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

## Checkout Results

| Command | Result | Mechanism |
| --- | --- | --- |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git` | failed | The `.git` URL did not match any configured workspace repo. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench` | failed | The URL matched configured repo metadata, but that metadata resolved to laptop-local `/Users/0xvox/multica-ultimate-workbench`. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench.git` after adding `.git` project resource | failed | The URL became configured, but still resolved to the stale `file+Users+0xvox+multica-ultimate-workbench.git` sync target. |
| `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench` after adding `.git` project resource | failed | Same stale laptop-local `file+Users+0xvox+multica-ultimate-workbench.git` sync target. |

## Finding

The remote failure is not an agent execution failure and not a proven GitHub auth failure. The remote runtime can receive tasks and run commands, and fresh task workdirs receive `.multica/project/resources.json` with the GitHub project resources. A canonical `.git` GitHub project resource with `default_branch_hint=codex/nyc-remote-agents` was added and observed by the remote task, but `multica repo checkout` still consumed a stale workspace repo backing store anchored to the laptop `file://` path.

## Next Action

Fix or invalidate the stale workspace repo sync anchor from `file:///Users/0xvox/multica-ultimate-workbench` to the GitHub remote, then rerun the same two checkout variants. `DAS-98`, `DAS-99`, `DAS-105`, and `DAS-108` are blocked until remote checkout succeeds from the GitHub anchor.
