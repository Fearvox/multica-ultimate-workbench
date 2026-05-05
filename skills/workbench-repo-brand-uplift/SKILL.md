---
name: workbench-repo-brand-uplift
description: Use when upgrading a public GitHub repository README, repo metadata, docs map, or first-impression brand surface to match the Zonic/Evensong proof-first standard.
---

# Workbench Repo Brand Uplift

Upgrade public GitHub repos into credible, proof-first artifacts. The target is
not prettier prose; it is a first screen that makes the repo's value, proof,
install path, and maturity obvious to a fresh outsider.

## Source Standard

Use the Zonic/Evensong public surface as the design DNA:

- tactical telemetry over marketing copy;
- strong project name, short claim, visible proof, then navigation;
- industrial grid language: sparse sections, tight labels, mono metadata,
  restrained badges, sharp boundaries;
- public/private boundary stated clearly;
- evidence links before long narrative;
- no mascots, lore, fake momentum, private screenshots, raw logs, or internal
  run IDs in public docs.

## When To Use

Use this for:

- README or repo-front-page polish;
- public repo metadata, topics, social-preview, examples, screenshots, or demo
  link updates;
- turning an internal workbench-quality repo into a public adoption surface;
- matching Evensong/Zonic visual and trust quality across multiple repos;
- "senior dev README uplift", "brand design", "make this repo public-ready",
  "adopt zonicdesign.art", or similar requests.

Do not use this to fake traction, invent benchmarks, rewrite unrelated code, or
spray the same template across repos without repo-specific proof.

## Brand Gates

Every uplift should pass these gates:

| Gate | Requirement |
| --- | --- |
| First-screen clarity | Project name, one-line claim, audience, and status visible before scrolling. |
| Proof before prose | Demo, screenshot, CLI output, benchmark, live URL, or PR evidence appears early. |
| Fresh-clone path | Install/run/test commands are current and scoped to this repo. |
| Architecture map | Human and agent can locate main modules, docs, examples, and ownership boundaries. |
| Maturity labels | Stable, experimental, research, internal, or archived surfaces are not mixed. |
| Public safety | No secrets, private IDs, raw transcripts, screenshots, or unreviewed claims. |
| Community path | Issues, contribution route, license, examples, and support boundary are clear. |

## Workflow

1. Inspect live repo state: `pwd`, `git status --short --branch`, `git remote -v`.
2. Read current `README.md`, package metadata, docs map, examples, and public
   assets only as needed.
3. Identify the strongest available proof. If proof is missing, add a clear
   "needs proof" residual risk instead of inventing one.
4. Draft the README around proof, not vibes:
   - name and claim;
   - status badges only if accurate;
   - public screenshot/demo/CLI evidence;
   - quickstart;
   - architecture map;
   - examples;
   - maturity and safety boundary;
   - contribution path.
5. Update adjacent public surfaces when relevant: package description, topics
   recommendation, docs links, examples, and public image references.
6. Run touched-path checks. At minimum: `git diff --check`, link/file existence
   checks for local docs, and repo-specific build/test commands if README
   quickstart changed.
7. If this is part of Workbench public docs or skill sync, route the patch
   through `workbench-hermes-docs-sync`.

## Zonic GitHub Pattern

Use this shape unless the repo has a stronger native convention:

````markdown
# PROJECT NAME

> One sentence: what it is, who uses it, and why it matters.

[status badges]

## Public Proof

- Live demo:
- Screenshot / CLI output:
- Latest verified command:

## Quickstart

```bash
...
```

## System Map

| Surface | Path | Purpose |
| --- | --- | --- |

## Maturity

| Surface | State | Notes |
| --- | --- | --- |

## Contributing / License
````

Keep the top compact. A README that needs a tour guide has already failed the
landing-page job.

## Verdict Contract

Return:

```text
REPO_BRAND_UPLIFT
repo:
brand_dna_source:
target_audience:
public_surfaces_checked:
proof_used:
changed:
metadata_recommendations:
verification:
residual_risk:
next_repo_or_next_action:
VERDICT: PASS | FLAG | BLOCK
```

Use `PASS` only when the repo is materially clearer to a fresh outsider and all
new public claims have evidence. Use `FLAG` when the README is improved but
needs screenshot, live demo, CI, metadata, or maintainer action. Use `BLOCK`
when public claims would mislead users or leak private/internal material.
