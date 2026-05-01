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
| Public Sanitization | Removed tracked raw artifacts and private execution plans from public Git, parameterized live scripts, and prepared a sanitized public snapshot. |

## Public Logging Rules

- Keep operational lessons and architecture decisions.
- Exclude live IDs, local paths, private device names, raw payloads, and screenshots.
- Record verification shape, not private evidence payloads.
- Put private command transcripts in ignored local files.
- Put large temporary artifacts under temp directories or private storage.

## Recovery Note

A local backup bundle was created before the public-history rewrite. It is not
part of the public repository and should not be pushed.
