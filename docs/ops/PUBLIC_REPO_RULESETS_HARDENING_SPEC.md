# Public Repo Rulesets Hardening Spec

Status: proposed
Generated: 2026-05-08
Scope:

- `Fearvox/project-windburn`
- `Fearvox/multica-ultimate-workbench`

## Why Now

Both public repos are receiving clone traffic that is much larger than their
visible page traffic. That is a real public-surface signal: assume automated
indexers, agents, and security scanners are already pulling the repos.

The current GitHub guardrails are too thin for that exposure.

## Live Baseline

Checked with GitHub API on 2026-05-08:

| Repo | Repository rulesets | `main` branch protection | Secret scanning | Push protection | Non-provider patterns |
| --- | --- | --- | --- | --- | --- |
| `Fearvox/project-windburn` | none | not protected | enabled | enabled | disabled |
| `Fearvox/multica-ultimate-workbench` | none | not protected | disabled | disabled | disabled |

Notes:

- `gh api repos/<owner>/<repo>/rulesets` returned `[]` for both repos.
- `gh api repos/<owner>/<repo>/branches/main/protection` returned
  `Branch not protected` for both repos.
- Both repos currently expose all merge methods: merge commit, squash, and
  rebase.
- Both repos have auto-merge enabled.
- Both repos have branch deletion after merge disabled.
- Neither repo currently has local `.github/workflows` CI files in the checked
  local working copies, so required status checks must be a v1 step after a
  stable workflow exists.

## Goals

1. Prevent direct mutation of `main` outside pull-request flow.
2. Block force pushes and branch deletion on protected refs.
3. Keep agent shipping velocity: do not require unavailable CI checks.
4. Make public-surface safety an explicit merge gate, not a reviewer vibe.
5. Enable GitHub-native secret and push-protection features for both repos.
6. Preserve traceability from PR -> issue -> evidence -> merge commit.

## Non-Goals

- Do not rewrite history.
- Do not expose private host identifiers, SSH targets, local absolute paths, or
  credential locations in public docs.
- Do not block all emergency maintainer action before a human backup reviewer
  exists.
- Do not require signed commits yet; current agent runtimes may not sign.
- Do not require required status checks until the repos have stable Actions
  workflows with predictable check names.

## Ruleset V0: Main Protection

Create one active repository ruleset in each repo:

```text
name: main-protect-v0
target: branch
enforcement: active
include refs: refs/heads/main
exclude refs: none
```

Required rules:

| Rule | Setting |
| --- | --- |
| Restrict deletion | enabled |
| Block force pushes / non-fast-forward updates | enabled |
| Require pull request before merge | enabled |
| Required approving reviews | `0` for v0, raise to `1` after backup reviewer exists |
| Dismiss stale reviews on push | enabled once reviews are required |
| Require review thread resolution | enabled once reviews are required |
| Require code owner review | disabled until `CODEOWNERS` exists |
| Require signed commits | disabled for v0 |
| Require linear history | disabled for v0 |
| Required status checks | none for v0 |

Rationale:

- Required PR flow stops accidental direct pushes while preserving the current
  fast PR merge muscle memory.
- Approval count starts at `0` because these repos are still mostly
  operator/agent driven. Requiring one review before a real reviewer lane exists
  would turn the ruleset into theater or deadlock.
- Linear history is intentionally not required yet because recent history uses
  merge commits as useful PR traceability.

Bypass policy:

- Allow owner/admin emergency bypass only.
- Use bypass sparingly and write a 4-field closeout comment in the linked issue
  afterward:

```text
CHANGED:
VERIFIED:
REMAINING:
PRS / LINKS:
VERDICT:
```

No GitHub App or agent account gets bypass in v0.

## Ruleset V0: Release Tag Protection

Create a second active repository ruleset in each repo:

```text
name: release-tags-protect-v0
target: tag
enforcement: active
include refs: refs/tags/v*
exclude refs: none
```

Required rules:

| Rule | Setting |
| --- | --- |
| Restrict deletion | enabled |
| Block force pushes / non-fast-forward updates | enabled |

Rationale:

- Release tags are public trust anchors.
- Even if releases are rare, protecting `v*` is low-risk and prevents accidental
  retagging after external clones already exist.

## Repository Settings V0

Apply these repo settings outside rulesets.

| Setting | Windburn | MUW | Desired |
| --- | --- | --- | --- |
| Secret scanning | enabled | disabled | enabled |
| Push protection | enabled | disabled | enabled |
| Non-provider secret patterns | disabled | disabled | enabled if available |
| Secret validity checks | disabled | disabled | enabled if available |
| Dependabot security updates | enabled | enabled | enabled |
| Delete head branches on merge | disabled | disabled | enabled |
| Rebase merge | enabled | enabled | disable |
| Squash merge | enabled | enabled | keep enabled |
| Merge commit | enabled | enabled | keep enabled for traceability |
| Auto-merge | enabled | enabled | keep enabled |

Rationale:

- MUW needs immediate secret scanning parity with Windburn.
- Rebase merge should be disabled because it weakens PR-boundary traceability.
- Keep merge commits for now because they make public PR history easy to audit.
- Enable delete-branch-on-merge to reduce stale agent branches.

## Public-Surface Merge Gate

Every PR that changes public docs, generated evidence, runtime fixtures,
screenshots, browser previews, or repo-root entry docs must include a public
surface scan in its closeout.

Minimum gate:

```sh
git diff --check origin/main...HEAD
git diff --unified=0 origin/main...HEAD \
  | rg '^\+[^+]' \
  | rg -i '(token|secret|password|bearer|api[_-]?key|private[_-]?key|ssh|identity|credential|public ip|raw host|localhost|/Users/|/home/)'
```

The second command is intentionally an added-lines scan, not a whole-repo scan.
Whole-repo scans create false positives from old docs and make agents ignore the
signal.

Public docs must use redacted labels for:

- public host or IP values;
- SSH or tmux targets;
- local absolute paths;
- credential file paths;
- raw provider tokens or auth payloads;
- operator-only commands that would reveal private runtime topology.

## Repo-Specific Required Checks V1

Do not enable required status checks until each repo has a checked-in workflow
with stable check names.

Windburn candidate workflow:

```text
name: windburn-check
required command set:
  - scripts/superconductor-codex-intake.sh
  - scripts/check.sh
  - git diff --check origin/main...HEAD
  - scripts/research-appliance-smoke.sh
```

MUW candidate workflow:

```text
name: muw-check
required command set:
  - repo anchor proof
  - project check script, when present
  - git diff --check origin/main...HEAD
  - closeout/verdict preservation validator
  - added-lines public-surface scan
```

After those workflows exist and run green on at least three normal PRs, update
`main-protect-v0`:

```text
required_status_checks:
  strict_required_status_checks_policy: true
  required checks:
    - windburn-check / check
    - muw-check / check
```

Use the actual GitHub check names, not guessed names from this spec.

## PR Closeout Contract

Rulesets protect refs. They do not protect meaning. For these repos the closeout
format is part of the safety layer:

```text
CHANGED:
- ...

VERIFIED:
- ...

REMAINING:
- ... or (none)

PRS / LINKS:
- ...

VERDICT: PASS | FLAG | BLOCK
```

Hard rule:

- Never rewrite `VERDICT: FLAG` as `Verdict: PASS, moving to Done`.
- If one closeout affects multiple issues, copy the `REMAINING` section to each
  issue that depends on it.
- A merged PR can still leave a related issue in `In Review` if validation is
  incomplete.

## Implementation Order

1. Enable MUW secret scanning and push protection.
2. Enable non-provider secret patterns and validity checks where GitHub exposes
   them for these repositories.
3. Create `main-protect-v0` on Windburn.
4. Create `main-protect-v0` on MUW.
5. Create `release-tags-protect-v0` on both repos.
6. Enable delete-head-branches-on-merge on both repos.
7. Disable rebase merge on both repos.
8. Open one tiny PR per repo to prove the normal PR path still works.
9. Land checked-in CI workflows.
10. After three clean PRs per repo, add required status checks to the ruleset.

## Verification

Rulesets are the source of truth. Branch protection may still report 404 when
rulesets are used.

Check rulesets:

```sh
gh api repos/Fearvox/project-windburn/rulesets \
  --jq '[.[] | {name,target,enforcement,rules:[.rules[]?.type],conditions}]'

gh api repos/Fearvox/multica-ultimate-workbench/rulesets \
  --jq '[.[] | {name,target,enforcement,rules:[.rules[]?.type],conditions}]'
```

Check security settings:

```sh
gh api repos/Fearvox/project-windburn \
  --jq '.security_and_analysis'

gh api repos/Fearvox/multica-ultimate-workbench \
  --jq '.security_and_analysis'
```

Check merge settings:

```sh
gh api repos/Fearvox/project-windburn \
  --jq '{allow_auto_merge,allow_merge_commit,allow_squash_merge,allow_rebase_merge,delete_branch_on_merge}'

gh api repos/Fearvox/multica-ultimate-workbench \
  --jq '{allow_auto_merge,allow_merge_commit,allow_squash_merge,allow_rebase_merge,delete_branch_on_merge}'
```

Acceptance criteria:

- Both repos have active `main-protect-v0`.
- Both repos have active `release-tags-protect-v0`.
- `main` cannot be deleted or force-pushed.
- Normal PR merge still works.
- MUW secret scanning and push protection are enabled.
- Windburn keeps secret scanning and push protection enabled.
- Rebase merge is disabled.
- Delete branch on merge is enabled.
- Public-surface scan appears in PR closeout for public docs/evidence changes.

## Rollback

If a ruleset blocks normal PR merges unexpectedly:

1. Change enforcement from `active` to `evaluate`.
2. Do not delete the ruleset.
3. Capture the blocked PR URL, rule name, and exact blocked action.
4. Patch this spec if the rule was too strict.
5. Re-enable `active` after a successful tiny PR.

Emergency rollback verdict shape:

```text
CHANGED:
- Set <ruleset> from active to evaluate.

VERIFIED:
- Captured blocked PR/action.
- Normal PR path restored.

REMAINING:
- Tighten or split the blocking rule before reactivating.

PRS / LINKS:
- ...

VERDICT: FLAG
```
