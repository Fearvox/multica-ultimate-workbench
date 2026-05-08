---
name: workbench-mirage-vfs-tool
description: Scout, pilot, or review Mirage virtual-filesystem tool use for Workbench agents while preserving source-of-truth and public-safety boundaries.
---

# Workbench Mirage VFS Tool

Use this skill when a task asks to evaluate, install, pilot, absorb, or review
Mirage as a virtual-filesystem tool for Workbench agents.

Mirage is a candidate tool layer. It does not replace Git, GitHub, Linear, CI,
Multica issue evidence, or reviewed Workbench docs as source of truth.

## Required Reads

Read only what the task needs:

1. `docs/mirage-vfs-tool-lane.md`
2. The current upstream Mirage release or package metadata
3. The issue, PR, repo, or runtime surface that will consume the mounted files

## Router

- **Scout**: source-check Mirage version, package names, runtime requirements,
  license, install commands, and breaking-change warnings.
- **Pilot**: run a bounded RAM or local temp-directory smoke first. Do not mount
  external services until the temp smoke passes.
- **Review**: verify the `MIRAGE_VFS_TOOL_CARD`, command evidence, teardown,
  and public-safety scan before accepting the result.
- **Promote**: require a real task where Mirage improves throughput without
  weakening evidence or leaking private surfaces.

## Guardrails

- Prefer native repo, `gh`, `multica`, and project scripts for normal Git work.
- Treat write-capable external mounts as Heavy Path.
- Do not expose raw local paths, hosts, SSH targets, tokens, cookies, OAuth
  material, request payloads, or private panes in public artifacts.
- Do not allow cloud-safe mention bots to inherit Mirage profiles with local
  FUSE, `stdio`, or private mounts.
- Secret-scan Mirage snapshots and tarballs before publishing.
- If Mirage disagrees with a native source-of-truth tool, return `FLAG` or
  `BLOCK` and investigate before using Mirage output for closeout.

## Output Contract

```text
MIRAGE_VFS_TOOL_CARD
purpose:
upstream_version:
install_surface:
workspace_mode: read-only | write | ram-only | temp-disk
mounts:
data_policy:
secret_policy:
public_artifact_policy:
commands_to_verify:
teardown:
source_of_truth:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

Close with:

```text
CHANGED:
- ...

VERIFIED:
- ...

REMAINING:
- ... or (none)

VERDICT: PASS | FLAG | BLOCK
```
