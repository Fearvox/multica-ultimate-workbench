# Decisions

## 2026-05-03 - Record Danfei Xu Human Data Insights As Workflow Cross-Analysis

Decision: add `docs/danfei-xu-human-data-workflow-insights.md` as a cross-analysis of Danfei Xu's robotics/human data research philosophy against the Multica workbench operating model. Ten insights mapped from research principles to concrete workflow improvements.

Key findings: SDD is validated as systems-first thinking (not overhead); Heavy Path enables safe uncertainty-seeking; Goal Mode decision packets should record rejected alternatives as structured taste; token/context discipline maps directly to behavior-cloning context adequacy; flight recorder should track decision-packet lifecycle as workbench training data.

Rationale: the workbench's multi-agent coordination model shares deep structural parallels with full-stack robotics — integration depth, system-over-algorithm thinking, and taste-driven direction-setting all apply. Recording these cross-pollinations strengthens the operating model's theoretical foundation.

## 2026-05-02 - Adopt Goal Mode v2 Two-Layer Autonomous Conductor

Decision: add `workbench-goal-mode-v2` as the two-layer persistent conductor
for multi-agent autonomous goals.

Goal Mode v1 (`/goal` persistence wrapper) remains for simple single-agent work.
Goal Mode v2 (`GOAL_MODE_V2: yes`) activates the full two-layer conductor:

- Design / Decision Layer: continuously refines intent, constraints, and
  product judgment, then produces a `DECISION_PACKET` — a scoped routing
  artifact, not raw execution spam.
- Dispatch / Operations Layer: converts decision packets into bounded Multica
  issues with one owner each, monitors active/in_review/blocked/done states,
  harvests evidence, archives noise, and re-routes only when new evidence
  appears.

The state machine is `GOAL_CAPTURED → DESIGNING → DECISION_PACKET →
DISPATCHING → OBSERVING → REVIEWING → BLOCKER_CLASSIFIED →
LEARNING/ARCHIVING → NEXT_GOAL_OR_DONE`.

Noise prevention (per DAS-741/DAS-743 findings): dedupe keys before issue
creation, cooldown timers between sweeps, max-active caps per goal, cancel
noise issues on sight, and a self-cancel condition when the conductor is the
only active issue left.

The initial delivery (DAS-768) adds `skills/workbench-goal-mode-v2/SKILL.md`,
`issue-templates/goal-mode-v2.md`, and `autopilots/goal-conductor.md` as
design contracts. The goal-conductor autopilot is NOT deployed live until a
separate approval issue with dogfood pass and rollback plan.

Rationale: the zero-idle pass (DAS-185/DAS-740) worked but blurred design and
dispatch — one supervisor kept switching, monitoring, and routing manually.
Splitting the two concerns into cooperating layers, and adding dedupe/cooldown/
archive controls, makes "auto forever" a durable control loop rather than
endless new sweep issues.

## 2026-05-02 - Add Friction Tier Router To Workbench Routing

Decision: Workbench Admin and Workbench Supervisor must route work through a
three-tier friction model before applying governance ceremony.

Fast Path covers reading, summaries, copy edits, small README text, link
cleanup, ACKs, empty scaffolds, lightweight classification, and work with no
code, secrets, or runtime surface. It skips Self-Awareness, Temporal Pincer,
Research Vault pressure checks, and broad issue scans unless repo/runtime
ownership is ambiguous. It has a 20-minute ceiling and closes with Done
Sentence / Changed / Verified / Next one action.

Standard Path covers ordinary code or documentation patches, prototype demos,
tests, PR prep, and visual page fixes. It requires an issue anchor or explicit
local task, evidence expectations before execution, touched-path verification,
and Changed / Verified / Residual risk / Next one action closeout. After 70%
complete, no new architecture names or integrations are allowed.

Heavy Path covers runtime, agent/autopilot, deploy, payment, OAuth, secrets,
branch/merge, public proof, daemon/Desktop/core, and remote VM work. It keeps
the hard gates: Self-Awareness, Goal Lock when the objective spans turns, full
evidence before PASS, Temporal Pincer for PASS/done/ready-to-merge, BLOCK on
correctness risk, and human approval for permission, secret, payment, or runtime
mutation.

Completion Cooling adds late-stage scope control: 75% means verify/commit/
handoff only, 85% means publish/reviewable stops editing, 90% means merged or
accepted allows at most one `POST_MERGE_NOTE`, and 100% means no follow-up lane
for 24 hours unless an external blocker appears. New ideas during active work
go to a one-line parking lot only.

Rationale: the prior model protected high-risk work but overtaxed low-risk
tasks with the same ceremony. Chronicle evidence from the overnight Workbench
Decision Runtime work also clarified that Temporal Pincer should be a truth
gate for closeout/PASS claims, not a handbrake before every send. The new
router keeps the iron gates where they matter while letting low-risk work move
without ritual overhead.

## 2026-05-02 - Route Default New Webpage Work To Project Windburn

Decision: treat `Fearvox/project-windburn` as the default landing-zone repo for
new webpage, subpage, landing-page, and microsite work when the human does not
name another repository.

Until repo evidence shows otherwise, `project-windburn` is scaffold-only. Do
not assume an existing app root, shared packages, route tree, build system, or
deployment wiring from the repo name alone. Keep the root for index/routing
documentation, place each child page as a self-contained project under
`project-windburn/<page-name>/`, and require any shared code to be explicit and
reviewed.

Rationale: the current public repo evidence shows a public `main` branch with a
minimal root only. Declaring the scaffold rule prevents agents from inventing
structure while still giving webpage work a stable default repo anchor.

## 2026-05-01 - Add Capy, Sanity, And Agent-Install Infra Lanes

Decision: add three separate workbench lanes:
`Capy Process Check`, `Sanity Unified Context`, and
`Agent-Install Unifier`.

Capy Process Check uses Brave and Computer Use to observe live Capy task, PR,
thread, and review state. Its output is `CAPY_PROCESS_CHECK`. Capy UI is
supporting evidence only; GitHub CLI, git state, CI, and review evidence remain
the source of truth for merge and done claims.

Sanity Unified Context stores sanitized structured records for cross-CLI
context: agent profiles, runtime surfaces, skill contracts, evidence events,
decisions, handoffs, and Capy process checks. It must not store secrets, OAuth
material, raw logs, raw request payloads, private screenshots, or full
transcripts.

Agent-Install Unifier uses `agent-install` to distribute reviewed skills, MCP
definitions, and AGENTS.md sections across coding agents. It requires readback,
rollback, scoped targets, and a secrets policy before config mutation.

Rationale: the workbench now spans Multica, Capy, GitHub, Sanity, local CLIs,
and remote cells. These lanes make the new surfaces useful without letting any
one of them become an unreviewed authority layer.

## 2026-05-01 - Add Capy Git Dialogue Lane As A Public Review Surface

Decision: recognize a `Capy Git Dialogue Lane` for Captain Capy and other
external coding agents.

Commit subjects, PR titles/descriptions, and review comments are valid durable
loop signals when external Git/PR dialogue needs to feed the workbench. Those
signals must stay compact, reviewable, and public-safe: no secrets, raw run
transcripts, live IDs, private payloads, or noisy run logs in committed docs or
review artifacts.

This lane does not replace Multica's live collaboration layer and does not
authorize daemon, Desktop UI, or core runtime mutation. PRs remain proposed
artifacts; human or Supervisor review decides merge and acceptance.

Rationale: the workbench already uses Git for durable memory and review. Naming
the external Git/PR dialogue lane makes commit and PR metadata first-class
signals without collapsing the boundary between live runtime coordination and
public review surfaces.

## 2026-04-29 - Hybrid Workbench Architecture

Decision: Use a Hybrid Multica Two-Ring Workbench.

The Inner Ring owns command, review, and synthesis. The Outer Ring owns bounded specialist execution, narrow analysis, and parallel advice. Direct chat remains available for fuzzy thinking, while issues carry executable work. Autopilots should create issues for scheduled checks rather than silently performing high-risk actions.

Rationale: This keeps collaboration native to Multica while giving the system a durable, versioned operating memory that can be reviewed, updated, and resumed.

## 2026-04-29 - Keep Codex Approval Inside Codex

Decision: Codex command approval and patch approval remain configured through Codex CLI, profiles, and runtime arguments rather than through Multica workbench files.

Rationale: Approval policy belongs to the runtime that enforces it. Keeping Codex approval inside Codex avoids duplicating authority, prevents stale policy drift, and keeps the workbench focused on operating memory instead of pretending to enforce runtime permissions.

## 2026-04-29 - Install Workspace Skill Core Pack

Decision: Add a small high-frequency workspace skill core pack to Multica before optimizing the full SDD/two-ring workflow.

The core pack is `workbench-sdd`, `workbench-conductor`, `workbench-research`, `workbench-review-qa`, `workbench-implementation`, `workbench-design-docs`, and `workbench-memory-synthesis`. The source files live in `skills/`, while the live Multica IDs and attachment map are recorded in `skills/README.md`.

Rationale: The workspace had no skills configured. Installing a compact shared operating layer gives every important agent the same execution grammar without blindly importing every local skill and creating prompt noise.

## 2026-04-29 - SDD Stages Are Comment-Level Milestones

Decision: SDD stages live as structured Multica issue comments, not as issue statuses.

The issue status model remains coarse: `todo`, `in_progress`, `in_review`, `done`, and `blocked`. The SDD pipeline records Raw Requirement, Product Design, Technical Design, Task List, and Execution And Verification as comments with `SDD_STAGE` headers and Supervisor PASS/FLAG/BLOCK gates.

Rationale: Five SDD stages do not map cleanly onto the existing status set. Keeping SDD at the comment layer preserves current routing, autopilot, and review behavior while adding a verifiable planning trail.

## 2026-04-30 - Expand Workbench Skills Through Role-Specific High-Frequency Pack

Decision: Expand the Multica workspace skill pack from 7 core skills to 15 role-specific high-frequency skills during DAS-9.

The added skills are `workbench-debug-investigate`, `workbench-code-review`, `workbench-frontend-design-qa`, `workbench-browser-proofshot-qa`, `workbench-docs-release`, `workbench-token-context-discipline`, `workbench-product-brainstorming`, and `workbench-gsd-tasking`.

The live rollout must remain source-first and reversible: back up current live skills and bindings, patch local source, commit the source batch, synchronize live skills, update bindings by role, verify every binding, and keep `Workbench Max` untouched.

Rationale: The original 7-skill pack gave agents a shared operating grammar, but the workbench now repeatedly needs debugging, code review, visual/browser QA, docs release, context discipline, brainstorming, and tasking behavior. Adding compact role-specific skills gives agents the missing high-frequency habits without importing every local skill or bloating every prompt.

## 2026-04-30 - Compact SDD Handoffs Before Broad Reads

Decision: Every SDD stage should include `HANDOFF_SUMMARY`, `SCOPED_EVIDENCE`, and `ANTI_OVER_READ` fields before the stage body.

Agents must start from the prior handoff and exact evidence IDs before reading wider issue history, full issue lists, full agent rosters, or unrelated docs. If a run reaches evidence-ready state but does not publish an artifact promptly, the conductor may post a clearly labeled proxy artifact from run-message evidence and let Supervisor decide the primary artifact.

Rationale: DAS-11 showed the expanded skill pack works, but first-pass SDD still over-read DAS-9 history and created latency/proxy friction. Compact handoffs preserve enough context for the next owner while reducing repeated full-history scans and token spend.

## 2026-04-30 - Compress Agent Prompts Source-First With Live Smoke

Decision: Active Multica workbench agent prompts may be caveman-compressed, but only through the source-first, reversible path: keep `.original.md` backups, validate compressed files locally, commit source changes, live-sync with `multica agent update --instructions`, verify metadata drift did not occur, and run a fresh live smoke issue.

Rationale: Prompt compression can reduce cache/input overhead, but it changes the exact operating text agents receive. Treat prompt compression like a runtime behavior change: preserve rollback files, keep `Workbench Max` untouched, and require live evidence before calling it done.

## 2026-04-30 - Add A Compact Flight Recorder Before More Automation

Decision: Add `scripts/collect-flight-recorder.sh` and `WORKBENCH_METRICS.md` as the workbench's compact run-review layer before adding heavier dashboards or automatic artifact capture.

The collector defaults to stdout-only `RUN_DIGEST` output. Persistent mode is opt-in and writes only summary JSON plus `run-digest.md`; it must not persist raw issue descriptions, full comment bodies, run-message transcripts, screenshots, traces, OAuth material, private tokens, or request payloads.

Rationale: The workbench needs enough observability to catch missing evidence, failed runs, oversized comments, long run traces, and invisible token attribution without creating a new disk or privacy problem. DAS-15 proved the helper works in a live Multica QA/Supervisor loop while leaving no persistent repo artifacts.

## 2026-04-30 - Adapt Hermes Curator As A Review-Only Skill Curator

Decision: Add a Workbench Skill Curator protocol inspired by Hermes Agent's Curator feature, but keep the first workbench version review-only.

The curator may classify skills and bindings as `active`, `stale`, `archived`, or `pinned`, and may propose patches, consolidation, archive candidates, or live-sync needs. It must not delete local skill files, rewrite live Multica skills, detach skill bindings, or modify preserved agents without explicit human approval and Supervisor review.

Rationale: Hermes Curator's lifecycle, pinning, usage telemetry, recoverable archival, and report pattern match the workbench's skill-bloat problem. The workbench has a stronger safety requirement because its skills and agents are part of a live collaboration system, so v1 should create review evidence and patch plans before any mutation.

## 2026-04-30 - Add Auto Review Sweeper For In-Review Handoffs

Decision: Add a live `Auto Review Sweeper` autopilot assigned to Workbench Supervisor.

The sweeper runs every 30 minutes and creates a high-priority review controller issue. Supervisor scans `in_review` targets, excludes the sweep controller itself, reviews at most three targets per sweep, posts an `AUTO_REVIEW` block on each target, and may set PASS targets to `done`, leave FLAG targets in `in_review`, or set BLOCK targets to `blocked`.

Rationale: Agent execution already moves work into `in_review`, but relying on the human to manually reassign every finished issue makes the review gate a bottleneck. A scheduled sweeper preserves Multica's current autopilot model while turning completed agent work into an automatic Supervisor review queue.

## 2026-04-30 - Harden Workbench Skills For Codex Loading

Decision: Add YAML frontmatter to all local Workbench skill source files and sync the same content to live Multica skills.

`Workbench Max` is also canonicalized as a preserved Special bench rather than a normal Inner or Outer Ring member. The hardening pass does not modify Max instructions, skill bindings, or global Codex MCP OAuth configuration.

Rationale: DAS-16 burn-in showed Codex runtime logs rejecting several workbench skills because their live `SKILL.md` content lacked YAML frontmatter. Frontmatter is a low-risk compatibility fix. Max classification removes routing ambiguity without changing the preserved companion agent.

## 2026-04-30 - Capy VM Lane Is A Capability Lease, Not A Scheduler

Decision: add a controlled VM/Computer execution lane for GUI, browser, sandbox, and screenshot-backed tasks.

Reason: some workbench tasks need disposable desktop state and visual proof, but Multica should remain the routing, review, issue, and evidence source of truth.

Consequence: VM sessions must be declared through SDD fields, owned by one issue and one agent, artifact-backed, and destroyed by default. The lane must not become an autonomous scheduler or a replacement for Multica.

## 2026-04-30 - Adopt Multica 0.2.21 Project-Bound Workflow Rails

Decision: use Multica 0.2.21 features as workbench workflow rails: project-bound repo resources, Quick Capture intake, fresh reruns, Mermaid diagrams, and per-agent runtime config.

The live `Ultimate Workbench` project is the default project anchor for this repo. It binds the GitHub repository resource and is led by Workbench Admin. Non-trivial intake still flows through SDD comments and Supervisor review; the project binding only reduces repo ambiguity.

Runtime-specific choices should move toward Multica agent config (`--model`, `--custom-env-file`, `--custom-env-stdin`) before being duplicated in prompts. Fresh reruns are preferred when a run inherits stale context, wrong repo/branch state, changed auth/runtime configuration, or incomplete evidence publishing.

Rationale: 0.2.21 gives native product support for patterns the workbench had been enforcing manually. Adopting those rails reduces checkout mistakes, stale retries, prompt bloat, and diagram-free ambiguity while preserving the existing source-first and review-first discipline.

## 2026-05-01 - Add NYC Remote Execution Cell

Decision: add four private remote agents on `<REMOTE_MULTICA_DEVICE>`: `NYC Codex Builder`, `NYC Hermes Researcher`, `NYC Ops Mechanic`, and `NYC VM Runner`.

The remote cell extends the Outer Ring. It does not replace Workbench Admin, Supervisor, Synthesizer, local Developer/QA/Ops roles, or preserved `Workbench Max`. Remote agents are for long repo/build/benchmark work, long-context research, remote runtime hygiene, and bounded VM/browser/sandbox tasks.

Runtime config rule: remote Codex agents must not receive laptop-oriented custom args such as `--ask-for-approval`, because `codex app-server` rejected that flag during `DAS-94`. Approval policy stays in issue-level constraints and human gates until Multica exposes a remote-compatible approval surface.

Repo rule: the `Ultimate Workbench` GitHub repo resource is the primary anchor for remote agents. The workspace-level `file://<LOCAL_WORKBENCH_REPO>` repo is laptop-local fallback only and must be treated as invalid on `<REMOTE_MULTICA_DEVICE>` unless explicitly mounted there.

Rationale: the user now has a stable remote Multica daemon that can keep work running off-laptop. A named remote cell gives the workbench real parallel capacity while preserving the existing two-ring governance and evidence discipline.

## 2026-05-01 - Add Goal Mode As The Workbench Persistence Wrapper

Decision: add `workbench-goal-mode` as the shared `/goal` execution contract.

When an issue contains `/goal`, `GOAL_MODE: yes`, or asks an owner to continue until a concrete objective is achieved, the owner must post `GOAL_LOCK`, keep the objective alive across turns and reruns, and close only after the relevant build, test, smoke, docs/report, git-status, and evidence gates are addressed or explicitly marked not applicable.

Goal Mode is not a permission override. It does not bypass approval gates, secrets boundaries, destructive-operation confirmation, repo-resource checks, or Supervisor review. It upgrades persistence and closeout quality, not authority.

Rationale: recent Codex CLI `/goal` behavior matches the workbench's core need: agents should not stop at a local fix when the user asked for a completed outcome. Making this a source-controlled skill gives Codex, Claude Code, Hermes, local agents, and remote cells the same completion contract without embedding a long prompt in every issue.

## 2026-05-01 - Add Remote HarnessMax Evolve Sweeper And L2 Pressure Gate

Decision: add `workbench-l2-pressure-gate`, a Remote HarnessMax Evolve Sweeper autopilot source, remote evolve issue templates, and a read-only remote Research Vault MCP contract.

Remote Hermes, remote VM, HarnessMax, and leaderboard-pressure tasks must post `RV_PRESSURE_CHECK` before routing or claiming the highest-yield path. The pressure check names the vault source, bounded queries, relevant prior failures, proven patterns, how the pressure changed the plan, and a PASS/FLAG/BLOCK verdict.

The Remote HarnessMax Evolve Sweeper runs at a high cadence during active 24h windows. It scans review, blocked, and high-priority in-progress work; identifies missing RV pressure, repo-anchor proof, VM proof, or synthesis; and creates bounded follow-up issues. It is a controller, not an implementer.

Remote Research Vault MCP is read-only by default. The approved first surface is `vault_status`, `vault_search`, `vault_taxonomy`, and `vault_get`. Writes, ingest, deletion, maintenance, or broad raw export require a separate issue, explicit approval, and Supervisor review.

Rationale: remote capacity only compounds if it carries durable memory pressure into every route. The goal is not more agents or more sweeps; it is faster convergence toward the best verified path while preserving safety, repo anchors, and public/private boundaries.

## 2026-05-01 - Add Self-Awareness As The First Workbench Infra Layer

Decision: add `workbench-self-awareness-infra`, `docs/self-awareness-infra-layer.md`, and `issue-templates/self-awareness-bootstrap.md` as the first boot layer before SDD, Goal Mode, L2 Pressure, remote execution, VM routing, or repo-changing work.

Owners must post `SELF_AWARENESS_BOOTSTRAP` with runtime identity, role boundary, repo anchor, tool and MCP envelope, memory sources checked, current-state proof, risk boundary, routing decision, success metric, operator-call conditions, and a `READY` / `FLAG` / `BLOCK` verdict.

Rationale: the workbench now runs across local agents, remote cells, VM lanes, Research Vault grounding, and high-pressure autonomous loops. Capability discovery must happen before ambition. This layer prevents stale memory, wrong checkout, missing MCP/tool assumptions, and "started a job" from being mistaken for verified progress while keeping public artifacts free of secrets, raw logs, live IDs, and private infrastructure details.

## 2026-05-01 - Add Flue As A Deployable Agent Harness Lane

Decision: add `docs/flue-agent-harness-lane.md`,
`skills/workbench-flue-agent-harness/SKILL.md`, and
`issue-templates/flue-agent-scaffold.md` as the Workbench lane for packaging
mature workflows into deployable Flue agents.

Flue is treated as an output layer, not a governance layer. Multica continues to
own live routing, issue state, comments, agents, runtimes, skills, and
autopilots. The workbench still owns SDD, Goal Mode, L2 Pressure, review gates,
public/private boundaries, and durable operating memory. Flue owns the
deployable harness once a workflow is stable enough to become HTTP, CI, Node,
Cloudflare, or sandbox-backed code.

Every Flue scaffold must declare `FLUE_AGENT_CONTRACT`: purpose, project
directory, workspace layout, agent file, deploy target, exact model ID, sandbox
mode, trigger, secrets policy, validation command, and public artifact policy.
Existing non-empty projects use `.flue/`; new or empty projects use root
`agents/` and `roles/`.

Rationale: Flue's `Agent = Model + Harness` model fits the workbench's next
stage: turning proven workflows into callable agents without collapsing live
coordination into another runtime. Keeping it as a lane preserves the current
two-ring governance while giving the system a clean path to deployable agent
products.
