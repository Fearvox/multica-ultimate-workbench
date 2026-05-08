# Mirage VFS Tool Lane

Mirage is an optional virtual-filesystem tool layer for Workbench agents. It can
mount services and data sources behind one shell-addressable tree, so an agent
can use ordinary file and pipeline commands instead of learning a separate API
for every backend.

This lane absorbs Mirage as a candidate tool, not as a new source of truth.
Git, GitHub, Linear, CI, Multica issue evidence, and reviewed Workbench docs
remain authoritative for closeout claims.

## Source Snapshot

Observed 2026-05-08 UTC:

- Upstream: `strukto-ai/mirage`
- Latest release: `v0.0.1`, first public release, published 2026-05-06
- Package surface: `mirage-ai` on PyPI and `@struktoai/mirage-*` packages on npm
- Runtime requirements: Python 3.12+ for Python/CLI, Node.js 20+ for TypeScript,
  macOS or Linux for FUSE mounts
- License: Apache-2.0
- Declared integrations: OpenAI Agents SDK, Vercel AI SDK, LangChain,
  Pydantic AI, CAMEL, OpenHands, Mastra, Pi Coding Agent, Claude Code, and Codex
- Declared mount targets include local RAM/disk plus services such as S3,
  Google Drive, Slack, Gmail, GitHub, Linear, Notion, databases, and SSH

Release note risk: Mirage is in the `0.0.x` line. Treat APIs, CLI flags, daemon
behavior, FUSE mount behavior, and package names as unstable until a later
version proves compatibility.

## Workbench Fit

Use Mirage when the work needs a bounded, shell-native staging surface across
multiple resources:

- non-git project folders or design folders that need temporary agent access;
- public-safe evidence bundle staging before publishing a review artifact;
- Research Vault or dataset snapshots that should be mounted read-only for a
  one-run verifier;
- cross-service triage where GitHub, Linear, docs, and local evidence need the
  same command vocabulary;
- sandbox-style experiments where a RAM or disk mount makes rollback cheap.

Do not use Mirage just to read a normal repository. Native Git checkout,
`gh`, `multica`, and repo-local scripts are lower-risk and easier to audit.

## Authority Boundary

Mirage output is supporting evidence unless a task explicitly defines a Mirage
workspace artifact as the target deliverable.

Mirage must not:

- replace issue, PR, CI, or repo evidence in PASS/FLAG/BLOCK closeouts;
- turn private operator panes, local absolute paths, raw hosts, SSH targets, or
  token-bearing files into public docs;
- silently mount write-capable cloud or remote resources in routine Workbench
  runs;
- leak provider auth, OAuth material, cookies, or raw request payloads through
  mounted files, snapshots, tarballs, or command transcripts;
- be inherited by cloud-safe mention bots unless its profile is explicitly
  configured without local-only mounts and without `stdio`-only dependencies.

## Adoption Path

1. **Scout**: verify the current release, package names, requirements, license,
   install commands, and known breaking-change warnings from upstream.
2. **Read-only smoke**: use RAM or a local temp directory first. Do not mount
   external services or remote hosts for the first test.
3. **Tool card**: record the workspace mount plan, mode (`read-only` or
   `write`), data policy, and teardown path before any issue receives Mirage
   access.
4. **Verifier**: prove the exact commands that read/write the mounted surface.
   Store only sanitized command summaries and public-safe artifacts.
5. **Promotion**: promote from candidate to active Workbench tool only after a
   bounded task shows Mirage improved throughput without weakening evidence.

## Mirage Tool Card

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

Rules:

- `workspace_mode=write` is Heavy Path when it touches external services,
  remote machines, credentials, public evidence, or durable repo state.
- First-party Workbench evidence should name capability and health, not raw
  private location.
- Snapshots and tarballs require the same secret scan as any public artifact.
- If Mirage and the native tool disagree, native source-of-truth evidence wins
  until the discrepancy is investigated.

## First Candidate Pilots

- Mount a local temp folder plus RAM resource and run a no-secret CLI smoke.
- Stage a public-safe review bundle from already-sanitized docs.
- Compare a native `gh` + file workflow against a Mirage-mounted GitHub/Linear
  workflow on a read-only issue triage.

The first pilot should end `FLAG` unless it proves install, mount, command,
teardown, and public-safety behavior on the exact runtime that will use it.
