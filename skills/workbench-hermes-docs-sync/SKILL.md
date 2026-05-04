---
name: workbench-hermes-docs-sync
description: Use when Hermes reviews Claude-authored writeups, public docs, skill changes, README/agent/issue-template changes, or upstream speed-match documentation before syncing or publishing.
---

# Workbench Hermes Docs Sync

Hermes is the second-pass reviewer for public-facing workbench documentation.
Claude Code writes the first draft or patch. Hermes reviews it for coverage,
consistency, public safety, and installability before sync or publish.

## Core Rule

**Claude writes. Hermes reviews. Supervisor accepts.**

Hermes should not turn a docs-sync review into a rewrite unless the existing
draft is materially wrong. Its job is to find every related public surface that
must change, then return a bounded patch plan or PASS/FLAG/BLOCK verdict.

## When To Use

Use this for:

- skill additions, renames, removals, or registry-facing skill-map changes;
- public README, docs map, agent roster, issue-template, autopilot, or install
  instruction changes;
- Super.engineering/Hermes upstream speed-match docs;
- any change that says "sync this everywhere", "public-facing", "skills.sh",
  "all Hermes", or "docs-sync";
- release notes or PR text that must remain evidence-backed and public-safe.

Do not use this for private scratch notes, raw run logs, uncommitted screenshots,
or live runtime mutation.

## Public Surface Sweep

Hermes must check all potentially related public surfaces, not only the touched
file:

- `README.md`: install count, public overview, docs map, runtime model, Chinese
  overview when relevant.
- `AGENTS.md`: read order, operating rules, file map, validation command list.
- `SYNTHESIS.md`: current strategy when the change alters operating model.
- `DECISIONS.md`: durable rationale for behavior-changing workflow changes.
- `skills/README.md`: registry-facing skill list and install instructions.
- `skills/*/SKILL.md`: affected skill contracts and cross-skill references.
- `docs/*.md`: lane docs, public contracts, public-safe evidence boundaries.
- `agents/**/*.md`: Hermes, Claude, Codex, remote, or reviewer role bindings.
- `issue-templates/` and `autopilots/`: reusable entry points affected by the
  new workflow.

If a surface is checked and not changed, name it in the review with "no change
needed" and the reason.

## Review Loop

1. Read the Claude-authored diff first.
2. Identify the behavior or public promise that changed.
3. Sweep the public surfaces above using file search and direct reads.
4. Flag stale install counts, dead links, missing skill-map rows, inconsistent
   role binding, or private/internal evidence leaking into public docs.
5. Recommend the smallest patch set.
6. Return a verdict. Do not silently mutate live Multica/Hermes runtime config.

Useful commands:

```bash
git diff --name-only
git diff --check
rg -n "skill-name|lane-name|Hermes|Claude Code|skills.sh|install" README.md AGENTS.md SYNTHESIS.md DECISIONS.md docs skills agents issue-templates autopilots
```

## Verdict Contract

Return:

```text
HERMES_DOCS_SYNC_REVIEW
source_author: Claude Code | other
changed_behavior:
public_surfaces_checked:
required_patches:
no_change_needed:
public_safety:
installability:
verification:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

Use `PASS` only when every related public surface is either updated or
explicitly judged unchanged. Use `FLAG` when publishable but missing optional
proof. Use `BLOCK` when stale public instructions, broken install paths, private
data exposure, or role-binding drift would mislead future users or agents.

## Common Failure Modes

- Only updating `skills/README.md` and forgetting README install count.
- Adding a workflow doc without a decision record.
- Adding a skill but not binding it to the Hermes role that should use it.
- Treating Discord/terminal screenshots as public proof.
- Updating AGENTS read order but forgetting the file map or validation list.
- Letting Hermes rewrite the whole doc instead of reviewing the Claude draft.
