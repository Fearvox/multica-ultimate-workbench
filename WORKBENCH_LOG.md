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
| Capy Process Check | Added a Brave/Computer Use observation lane for Capy task and PR status with primary evidence readback. |
| Sanity Context | Added a structured context-registry lane for sanitized cross-CLI records. |
| Agent-Install Unifier | Added a distribution lane for skills, MCP configs, and AGENTS.md sections across coding agents. |
| Flue Harness Lane | Added a deployable agent-harness outlet for mature HTTP, CI, Node, Cloudflare, and sandbox-backed workflows. |
| Public Sanitization | Removed tracked raw artifacts and private execution plans from public Git, parameterized live scripts, and prepared a sanitized public snapshot. |
| Codex App Supervisor Session | Added a repo-anchor rule for Codex Desktop supervising Multica from a different startup directory. |

## Codex App Supervisor Session

The workbench now treats a designated Codex Desktop chat as a human-side
Multica supervisor session. The session may start from another repository, but
all workbench claims, edits, checks, and handoffs must explicitly anchor back to
this workbench source repo.

Verification shape:

- the workbench repo was confirmed clean and synced with `origin/main`;
- supervisor routing was documented in `AGENTS.md` and the Claude-compatible
  bridge;
- no local absolute paths, raw transcripts, private screenshots, tokens, or
  request payloads were added.

Residual risk: the Codex Desktop app may still show the old startup directory in
its environment context. Agents must rely on explicit `workdir` / `git -C`
routing until the app session itself is restarted from the workbench repo.

## 2026-05-01 - Capy, Sanity, And Agent-Install Lanes

The workbench added three infra lanes:

- `Capy Process Check`: observes live Capy thread, task, PR, and review state
  through Brave/Computer Use, then compares it with GitHub CLI and repo
  evidence.
- `Sanity Unified Context`: defines the sanitized context registry shape for
  agent profiles, runtime surfaces, skill contracts, evidence events,
  decisions, handoffs, and Capy checks.
- `Agent-Install Unifier`: records the sync contract for using `agent-install`
  to distribute skills, MCP definitions, and AGENTS.md sections across coding
  agents.

Verification shape:

- Capy PR #3 was observed live as clean and merge-ready, then merged through
  GitHub CLI.
- Local workbench state was stashed, fast-forwarded, and restored without
  conflict.
- Sanity Studio schema was prepared as a separate local project update.

Residual risk: live Sanity MCP authorization and live multi-agent config sync
remain operational actions that should be reported with readback after they run.

## 2026-05-01 - Flue Harness Lane

The workbench adopted Flue as a deployable agent harness lane, not as a
replacement for Multica or the existing governance layers.

Source added:

- `docs/flue-agent-harness-lane.md`
- `skills/workbench-flue-agent-harness/SKILL.md`
- `issue-templates/flue-agent-scaffold.md`

The lane requires `FLUE_AGENT_CONTRACT` before scaffold work: purpose, project
directory, workspace layout, agent file, deploy target, exact model ID, sandbox
mode, trigger, secrets policy, validation command, and public artifact policy.

Verification shape:

- skill frontmatter check passed;
- required link targets exist;
- diff whitespace check passed;
- public safety scan found only generic safety-rule mentions, not real secrets.

Residual risk: no live Multica skill sync or actual Flue app scaffold was run in
this source-only pass. Live sync and first pilot should be separate reviewed
issues.

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
