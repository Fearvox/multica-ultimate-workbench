# GitHub Repo Brand Uplift Goal

Use this template when a repo should be lifted to the Zonic/Evensong public
standard.

```text
/goal
GOAL_MODE: yes
STANDARD_PATH: yes
SELF_AWARENESS_REQUIRED: yes if repo ownership or public surface is ambiguous
```

## RAW_REQUIREMENT

Upgrade `<repo>` so its README and adjacent public GitHub surfaces make the
actual value obvious to a fresh outsider. Adopt the Zonic/Evensong standard:
brand-first, proof-first, public-safe, installable, and evidence-backed.

## SCOPED_EVIDENCE

Read only as needed:

- `README.md`
- package metadata (`package.json`, `pyproject.toml`, `Cargo.toml`, etc.)
- docs/examples linked from README
- public assets/screenshots already in repo
- current GitHub metadata if available
- `docs/repo-brand-uplift-lane.md`
- `skills/workbench-repo-brand-uplift/SKILL.md`
- `skills/workbench-hermes-docs-sync/SKILL.md` when Workbench public docs or
  skill surfaces change

## NON_NEGOTIABLES

- Do not invent proof, benchmarks, adoption, or maintainer approval.
- Do not include secrets, OAuth material, raw transcripts, private screenshots,
  live IDs, or raw request payloads.
- Do not rewrite unrelated code.
- Do not batch unrelated repos unless a Goal Mode v2 conductor explicitly
  scopes them.
- Do not make README a run log.

## SUCCESS_METRIC

A fresh outsider can understand and trust the repo in two minutes:

1. first screen states what it is, who it is for, and current maturity;
2. proof appears before long prose;
3. quickstart is current or explicitly marked unavailable;
4. architecture map points to real files;
5. public/private boundary is clear;
6. contribution/license path is visible;
7. touched-path validation passes.

## REQUIRED_CLOSEOUT

```text
REPO_BRAND_UPLIFT_CLOSEOUT
repo:
before_score:
after_score:
proof_added:
first_screen_changed:
quickstart_verified:
public_surfaces_checked:
metadata_recommendations:
docs_sync_review:
residual_risk:
next_repo_or_next_action:
VERDICT: PASS | FLAG | BLOCK
```
