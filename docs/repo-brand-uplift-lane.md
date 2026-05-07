# Repo Brand Uplift Lane

Generated: `2026-05-04`

## Purpose

The workbench has real artifacts, but a repo that looks like internal operating
memory will not earn public trust quickly. This lane turns each selected GitHub
repository into a proof-first public surface with Zonic/Evensong-level clarity:
brand signal, evidence, install path, architecture map, maturity boundary, and
community route.

This is distribution infrastructure, not cosmetic copy editing.

## Design DNA

Adopt the public Zonic surface without blindly copying its website layout:

- **Tactical telemetry**: short labels, version/status facts, proof links, and
  current verification beat long intros.
- **Industrial grid**: sparse sections, sharp boundaries, tight badges, and
  tables that help scanning.
- **Proof-first**: screenshot, demo, CLI output, benchmark, package, or PR
  evidence appears before narrative.
- **Public/private discipline**: private systems, raw logs, internal IDs,
  credentials, and unreviewed screenshots stay out.
- **Maturity honesty**: stable, experimental, research, internal, and archived
  surfaces are labeled instead of blended.

## Operating Model

```text
repo inventory
  -> proof inventory
  -> README first-screen redesign
  -> adjacent public metadata/doc sweep
  -> touched-path verification
  -> Hermes docs-sync review when workbench public surfaces change
```

## Scope Rules

- Work one repo at a time unless a Goal Mode v2 conductor explicitly batches
  independent repos.
- Do not rewrite code just to make the README story cleaner.
- Do not invent proof. Missing proof becomes residual risk or a follow-up issue.
- Do not reuse a generic README template without repo-specific screenshots,
  commands, architecture paths, and maturity labels.
- Do not treat Discord/community interest as merge, install, or adoption proof.

## Required Public Surfaces

For each repo, inspect and update only when relevant:

| Surface | Check |
| --- | --- |
| `README.md` | first screen, proof, quickstart, architecture map, maturity, contribution path |
| package metadata | description, keywords, homepage, repository link |
| GitHub metadata | description, topics, social preview recommendation, pinned demo link |
| docs/examples | links from README resolve and match current repo shape |
| screenshots/media | public-safe, current, not private UI or raw transcript |
| license/contributing | visible enough for outside users |

## Scorecard

Use a 0-2 score per dimension:

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| First screen | unclear | recognizable | compelling and scoped |
| Proof | absent | claimed | linked or reproducible |
| Quickstart | stale/missing | partial | fresh-clone runnable |
| Architecture | hidden | partial | scannable map |
| Maturity | mixed | implied | explicit labels |
| Brand | generic | styled copy | distinct, repo-specific surface |
| Public safety | risky | manually checked | clean and documented |

Target: no `0`, at least four `2`s, and no public-safety risk.

## Closeout

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

`PASS` means a fresh outsider can understand and trust the repo in two minutes.
`FLAG` means the repo is clearer but still lacks proof, metadata update, or
maintainer action. `BLOCK` means the public surface would mislead or expose
private/internal material.
