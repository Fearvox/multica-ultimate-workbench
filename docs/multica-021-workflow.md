# Multica 0.2.21 Workflow Upgrade

This document records the workbench rules enabled by Multica 0.2.21. It is the operating bridge between new Multica product surface area and this repo's existing SDD, review, skill, and VM-lane protocols.

Source: [Multica changelog](https://multica.ai/changelog).

## Live Project

| Field | Value |
| --- | --- |
| Project | `Ultimate Workbench` |
| Project ID | private deployment detail |
| Status | `in_progress` |
| Lead | `Workbench Admin` |
| GitHub repo resource | `https://github.com/Fearvox/multica-ultimate-workbench` |
| Resource ID | private deployment detail |
| Evidence | private temp evidence, not tracked in Git |

## Intake Flow

Use Quick Capture or a human-created issue for fuzzy input. Use the Project
binding to anchor the correct repository before any agent claims file evidence.
Use the Friction Tier Router first, then apply SDD comments when the selected
tier calls for them.

```mermaid
flowchart LR
  A["Raw request or Quick Capture"] --> B["Project: Ultimate Workbench"]
  B --> C["Repo resource: GitHub source"]
  C --> D["Workbench Admin: Raw Requirement"]
  D --> E["Product Design"]
  E --> F["Technical Design"]
  F --> G["Task List"]
  G --> H["Execution owner"]
  H --> I["Supervisor PASS / FLAG / BLOCK"]
```

## Project-Bound Repo Rule

When a Multica issue belongs to this workbench, the issue should attach or name the `Ultimate Workbench` project. Agents should prefer the project-bound GitHub repo resource before guessing a checkout path.

Primary repo anchor:

```text
Ultimate Workbench project -> https://github.com/Fearvox/multica-ultimate-workbench
```

If repo files are needed inside a laptop-local runtime workdir and the project-bound resource is unavailable, use the local path only as an explicit fallback:

```bash
multica repo checkout file://<LOCAL_WORKBENCH_REPO>
```

Then label the evidence as local fallback and verify the branch or commit before citing file evidence.

Remote runtimes such as `<REMOTE_MULTICA_DEVICE>` must not rely on that `file://` path. If `multica repo checkout https://github.com/Fearvox/multica-ultimate-workbench` fails because workspace repo metadata still points at the laptop path, the agent should report `FLAG` or `BLOCK` and request a repo-anchor fix rather than silently switching to unrelated files.

## Fresh Rerun Rule

Use a fresh rerun when a task shows signs of stale context, poisoned resume state, repeated tool failure, or unclear ownership. A rerun is preferred over extending a polluted run when:

- the agent read the wrong repo or branch;
- the run inherited stale issue state;
- tool auth or runtime state changed during execution;
- an execution reached evidence-ready state but did not publish a comment;
- a Supervisor retry should review current artifacts rather than old context.

The rerun must cite the old run ID as context, then start from the latest `HANDOFF_SUMMARY` and `SCOPED_EVIDENCE`.

## Run Finalization Rule

Issue status and run status must not drift silently. If an issue reaches
`in_review`, `done`, or `blocked`, related runs must be terminal or explicitly
marked for reconciliation before a reviewer treats the lane as settled.

Watch for these signals:

- issue is `in_review`, `done`, or `blocked` while a run is still `running`,
  `in_progress`, `active`, `pending`, or `queued`;
- a run message stream already contains `PASS`, `FLAG`, or `BLOCK` while the run
  remains active;
- a foreground issue/comment command timed out and a retry could duplicate the
  result comment;
- exact duplicate comment bodies appear on the issue;
- token, credit, wall-clock, tool-call, or message-count fields are missing
  while efficiency is part of the claim.

Use [docs/run-finalization-reconciliation-lane.md](run-finalization-reconciliation-lane.md)
and [issue-templates/run-finalization-reconciliation.md](../issue-templates/run-finalization-reconciliation.md)
for the reconciliation contract. The flight recorder surfaces these signals
without storing raw payloads.

## Mermaid Rule

Use Mermaid diagrams for routing, ownership, state machines, and execution lanes when text would be ambiguous. Keep diagrams small enough to fit in one issue comment.

Preferred diagram types:

- `flowchart` for SDD and issue routing.
- `sequenceDiagram` for agent handoffs.
- `stateDiagram-v2` for review state.

## Graph Artifact Rule

Rendered diagrams should be first-class Multica artifacts, not screenshots
buried in prose. The raw source is canonical; the rendered graph is a derived
human view.

When an issue comment, stage artifact, or handoff includes a diagram, prefer a
`GRAPH_ARTIFACT` block:

````text
GRAPH_ARTIFACT
title:
language: mermaid | dot | ascii
render_target: inline_card | expandable_card | static_svg
copy_source: required
source:
```mermaid
flowchart TD
  A["Raw requirement"] --> B["Design"]
  B --> C["Patch"]
  C --> D["Verification"]
```
````

UI expectation:

- show a polished rendered graph card by default;
- include `Copy source` for the raw fenced code so agents can reuse it exactly;
- include `View source` for humans reviewing the underlying graph;
- include `Copy image` or export only as a convenience, never as the source of
  truth;
- if rendering fails, preserve and display the raw source with the error.

Rendering rules:

- Mermaid is the default for issue routing, state machines, and handoffs.
- DOT/Graphviz is allowed for dense dependency or topology graphs.
- ASCII diagrams are acceptable only as fallback or when terminal fidelity is
  itself the point.
- Keep labels short; move explanation into prose below the graph.
- Do not embed secrets, private IDs, raw logs, or unreviewed screenshots in
  graph source.

This mirrors the Codex-style preview pattern: beautiful rendered graph for the
human, canonical raw code for the agent.

## Runtime Config Rule

Use Multica agent config for runtime-specific behavior before duplicating it in prompts.

| Need | Preferred surface |
| --- | --- |
| Model selection | `multica agent update <id> --model <model>` |
| Runtime secrets | `--custom-env-file` or `--custom-env-stdin` |
| Non-secret CLI flags | `--custom-args` only when `--model` is not enough |
| Codex Workbench profile | Lean per-run `codex-home/config.toml` from `config/multica-workbench-codex-profile.example.toml` |
| Approval policy | Runtime-native config, not workbench prose |

Never put secret values in repo docs, issue comments, shell history, or command transcripts.

### Codex Profile Guard

Normal Workbench Codex tasks need shell, Git, and `multica`; they should not
inherit the full user Codex plugin or marketplace profile. Use
[docs/codex-workbench-runtime-profile.md](codex-workbench-runtime-profile.md)
for the launcher contract, verification report, and completed-run cache guard.

If Multica launches `codex exec`, prefer `--ignore-user-config` plus explicit
model/context overrides. If Multica launches `codex app-server`, generate a
lean per-run profile instead; do not assume `app-server` accepts
`--ignore-user-config`.

## Create-Issue-By-Agent Rule

If an agent creates or drafts an issue from a raw request, the first durable comment must preserve the literal request and declare:

```text
INTAKE_SOURCE:
PROJECT:
REPO_RESOURCE:
URL_CONTEXT:
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:
```

If URL enrichment was used, include the URL and the small extracted fact set. Do not paste full pages or raw private content.

## Review Gate

Supervisor should check:

1. The issue is attached to or names the correct Project.
2. Repo evidence came from the project-bound repo or an explicit checkout.
3. SDD comments include compact handoff fields.
4. Reruns cite the stale/failed prior run and start fresh.
5. Runtime model/env changes are recorded with IDs and verification evidence.

Final review still ends with `PASS`, `FLAG`, or `BLOCK`.
