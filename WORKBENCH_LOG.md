# Workbench Log

This is the public rollout log. Detailed live IDs, raw evidence, screenshots,
runtime payloads, and local machine paths are intentionally excluded from this
repository.

## Milestones

| Stage | Outcome |
| --- | --- |
| Bootstrap | Created the initial workbench repo, agent definitions, issue templates, and operating docs. |
| Pilot | Verified a bounded pilot agent flow before expanding the roster. |
| Two-Ring System | Split orchestration, supervision, synthesis, implementation, research, QA, docs, and ops into explicit roles. |
| SDD Upgrade | Added the raw requirement -> product design -> technical design -> task list workflow. |
| Flight Recorder | Added compact issue/run digest tooling with stdout-first behavior and temp-only artifacts by default. |
| Auto Review Sweep | Added scheduled review-gate guidance for issues waiting in review. |
| Skill Pack | Expanded high-frequency workbench skills while keeping role-specific bindings. |
| VM Lane | Added a bounded VM/browser lane with teardown and temp evidence rules. |
| Remote Runtime Lane | Added a remote execution-cell pattern while keeping repo anchors and local paths explicit. |
| Self-Awareness Layer | Added and live-synced the bootstrap skill for capability, repo, tool/MCP, memory, risk, route, and success-metric checks. |
| Public Sanitization | Removed tracked raw artifacts and private execution plans from public Git, parameterized live scripts, and prepared a sanitized public snapshot. |

## 2026-05-01 - Self-Awareness Live Sync

The `workbench-self-awareness-infra` skill was created in the live Multica
workspace from the source file in `skills/`. It was attached to all active
Workbench agents except the preserved private bench, whose bindings remain
untouched.

Verification shape:

- `multica skill get` confirmed the live skill name, description, YAML
  frontmatter, and non-empty content.
- `multica agent list` confirmed every active non-preserved Workbench agent has
  `workbench-self-awareness-infra` in its skill set.
- A temporary local snapshot of live skills and agent bindings was taken before
  mutation for rollback reference; it is intentionally outside Git.

Residual risk: currently running agent tasks may need a fresh run before the new
skill is visible inside that task context.

## Public Logging Rules

- Keep operational lessons and architecture decisions.
- Exclude live IDs, local paths, private device names, raw payloads, and screenshots.
- Record verification shape, not private evidence payloads.
- Put private command transcripts in ignored local files.
- Put large temporary artifacts under temp directories or private storage.

## Recovery Note

A local backup bundle was created before the public-history rewrite. It is not
part of the public repository and should not be pushed.
