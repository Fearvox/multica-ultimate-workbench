# Decisions

## 2026-05-05 - Add Waking-Up As The Workbench Context Restore Protocol

Decision: add `workbench-waking-up` as the shared wake-report and
session-to-Workbench bridge skill. When an operator asks for recent state,
dropped leads, `gm`, `where are we`, or asks whether a direct-chat discovery
should become Workbench-visible, agents must recall memory leads, verify live
repo/issue/automation/knowledge/runner state, surface drift first, and return a
short evidence-labeled action menu.

Rationale: useful operating changes were being born in direct chat faster than
repo docs or Multica surfaces could absorb them. The workbench needs a low-
friction way to wake itself, detect stale memory, and turn reusable session
outcomes into public-safe durable surfaces without adding a full PM ceremony.

Installed at `skills/workbench-waking-up/SKILL.md`; public maps updated in
`README.md`, `AGENTS.md`, `skills/README.md`, and `agents/AGENT_ROSTER.md`.

## 2026-05-04 - Separate Capy Captain Contracts From Multica Runtime Execution

Decision: formalize a hard boundary between Capy and Multica through the
`multica-runtime-card` protocol. Capy owns the legislative ring (deep-read repos,
understand boundaries, produce Captain contracts). Multica owns the executive
ring (take a runtime card, SSH in, execute within constraints, return evidence).
The interface is a single JSON artifact: the runtime card.

```text
Capy's ring:  deep-read → understand boundaries → produce Captain contracts
Multica's ring: take card → SSH forced-command → wrapper → five actions → evidence back
```

The SSH channel is a secure runtime channel, not a raw shell:

- Dedicated `captain-runtime` user, never root.
- Dedicated SSH key with forced command — no arbitrary shell on connect.
- Default entry into a fixed tmux/session wrapper (`windburn-captain-runtime`).
- Wrapper exposes exactly five actions: `status`, `dispatch`, `read-evidence`,
  `run-safe-check`, `attach-task`. No sixth action.
- All mutations continue through Windburn confirm gates: NixOS rebuild, secret
  sync, provider smoke — Multica never runs these bare.
- Transcript, command, and verdict all land in evidence.
- Public UI only sees redacted status — no raw IP, path, SSH target, or token.
- Capy connects to the runtime endpoint, not to private SSH details in repo.

The runtime card schema (`multica-runtime-card`):

```json
{
  "runtime_id": "...",
  "repo": "...",
  "branch": "...",
  "intent": "...",
  "allowed_actions": ["status", "dispatch", ...],
  "privacy_scope": "...",
  "expected_evidence": "...",
  "verdict_policy": "PASS | FLAG | BLOCK"
}
```

This gives the workbench three reliable entry points:
**FusionChain** (primary, browser-to-agent), **Capy SSH Runtime** (secure
terminal channel with capability cards), **Superconductor** (monitoring
and review surface).

Rationale: the prior architecture risked building an air-traffic control tower
when an SSH door was right there. But the fix is not "open an SSH session and
type commands." The runtime-card protocol makes SSH a *controlled capability
surface* — the card declares what one agent may do in one session, the wrapper
enforces it, and evidence flows back. Capy does not need to know SSH config;
Multica does not need to read Captain contracts. The card is the boundary.
Capy is legislation, Multica is enforcement — two rings, one interface, no
ambiguity.

## 2026-05-04 - Treat Rendered Graphs As Copyable Source Artifacts

Decision: extend the Multica 0.2.22 workflow with a `GRAPH_ARTIFACT` convention.
Rendered diagrams should display as polished cards for humans, while the raw
Mermaid/DOT/source remains canonical and copyable for agents. Exported images
are convenience outputs, not source of truth.

Rationale: graph-heavy research and architecture notes are hard to read as raw
ASCII, but agents still need exact source to copy, edit, and rerender. The
Codex-style pattern solves both: render the graph beautifully, expose `View
source` and `Copy source`, and preserve the raw fenced code if rendering fails.

## 2026-05-04 - Keep Repo Brand Uplift As A Public-Surface Standard

Decision: treat repo-brand uplift as a public-surface standard and a future
lane to define, not an installed lane in this repository today. Public GitHub
first-impression work should keep the same bar — brand signal, proof before
prose, fresh-clone quickstart, architecture map, maturity labels,
public/private discipline, and community path — but must not cite unlanded
docs, skills, or issue templates as if they already exist here.

Rationale: several repos now contain real work but do not make that value
obvious to outsiders. README polish alone is insufficient; public trust comes
from evidence-backed first screens and adjacent metadata/docs consistency. The
standard keeps the work one repo at a time, forbids invented proof, and keeps
this decision log aligned with repo-visible evidence.
Future public-surface changes can still route through Hermes docs-sync review
once the concrete repo-brand-uplift artifacts actually land.

## 2026-05-04 - Make Hermes Docs Sync a Public Skill

Decision: add `workbench-hermes-docs-sync` as the registry-facing skill for
Hermes second-pass documentation review. Claude Code writes public docs,
skills, install maps, and speed-match writeups first; Hermes reviews every
related public surface before sync or publish. The review contract is
PASS/FLAG/BLOCK and must name checked-but-unchanged surfaces.

Rationale: Hermes is strong at automated long-context review. Making it the
second-pass docs-sync runtime prevents stale public-facing files while avoiding
Hermes turning every fuzzy writeup into a broad rewrite. The skill also gives
all Hermes roles the same boundary: review coverage and public safety, not live
runtime mutation.

## 2026-05-04 - Add Super.engineering Speed-Match Lane

Decision: add `docs/super-engineering-speed-match-lane.md` as the operating
contract for matching Super.engineering and Hermes upstream velocity. The lane
has three moves: wrap and dogfood the fast base, contribute focused
evidence-backed upstream PRs, and keep Workbench value in orchestration, trust,
UI taste, and repo-readable memory.

Rationale: upstream is now fixing the same runtime and terminal surfaces the
workbench is dogfooding. The workbench should not rebuild primitives that are
moving quickly upstream. Its leverage is speed-matched adoption plus hardened
truth artifacts and a higher-level control layer.

## 2026-05-04 - Add Windburn Profile as Horizontal Session Overlay

Decision: add `workbench-windburn-profile` as a horizontal skill that modifies
how all other skills execute. The profile inverts the default agent tone:
casual is baseline, structured mode is earned by sustained density signals
(technical term ratio, reference density, sentence length). Explicit switch
words ("spec maxxing""随便聊聊") override auto-detection. UI tasks
auto-inject CommitMono/dot-matrix aesthetic defaults.

Rationale: the 2026-05-03 communication profile defines *what* tone to use.
Windburn profile automates *when* to apply it. Without automation, every
session requires the operator to manually declare mode, which is its own
friction. The skill is deliberately a cheap heuristic, not a classifier —
false positives are acceptable because downgrade from structured to casual
is instant.

Installed at `skills/workbench-windburn-profile/SKILL.md`. Docs at
`docs/windburn-profile.md`.

## 2026-05-03 - Add Windburn Trust Pipeline Bootstrap Scripts

Decision: add deterministic local scripts for Windburn belief write gating and
time-aware momentum decay:

- `scripts/windburn-verify.mjs` remains the zero-model self-consistency gate and
  now supports Rule 9 for stale high exploration momentum.
- `scripts/windburn-belief-write.mjs` is the guarded write path: it runs the
  verifier before copying a candidate belief into its destination.
- `scripts/windburn-momentum-decay.mjs` reports system-clock momentum decay in
  dry-run form without mutating belief files.

Rationale: Windburn trust state, confidence, and exploration momentum are
separate axes. Agents may declare exploration intent and lower confidence, but
only external evidence and Supervisor gates can promote trust or confidence.
The write gate blocks structurally invalid beliefs before they enter durable
memory, while momentum decay stays clock-derived and report-only in this slice.

## 2026-05-03 - Add Windburn Divergence-Gated Trust Promotion Research Packet

Decision: add `docs/windburn-divergence-gated-trust-research.md` and
`issue-templates/windburn-divergence-gate-goal.md` as the v0.3 research lane
for Windburn trust promotion.

The lane tests whether a structurally separate challenger can reduce premature
belief convergence before a `verified` belief becomes `trusted`, while keeping
confidence, source truth, freshness, and trust promotion outside challenger
authority. Grok/xAI may be used as a divergent hypothesis generator, but the
interface stays provider-neutral and all material alternatives require
materiality review plus external verification or Supervisor approval.

Rationale: v0.2 proves the local cognitive-cache substrate. The next risk is
self-reinforcing memory: a plausible belief can become future policy without
enough pressure. Divergence is useful as hypothesis-space expansion, not as a
judge.

## 2026-05-03 - Apply Agent Communication Profile At Conductor Startup

Decision: add `docs/agent-communication-profile.md` as the default session
communication profile for Workbench/Superconductor conductor runs.

Conductor startup should apply:

```text
Apply communication profile docs/agent-communication-profile.md.
Tone: human, direct, bilingual, pushback-ok.
```

The profile controls output behavior only: short exchanges when appropriate,
Chinese logic with English technical terms, willingness to push back, and
explicit self-correction. It is not runtime evidence and must not be used to
claim the current model, tool envelope, or permissions.

Rationale: this removes repeated human steering at session start and keeps
Workbench conductor notes closer to collaborator dialogue than support-script
boilerplate, without weakening evidence or safety gates.

## 2026-05-03 - Record Windburn Cognitive Cache As Memory-Native Direction

Decision: add `docs/windburn-cognitive-cache-direction.md` and
`docs/windburn-cognitive-cache-dispatch.md` as the public-safe direction record
for Windburn's Belief/Perception/Continuity cache.

Windburn should not start as a new base model. It should start as a local,
reviewable `.learning` substrate that turns human-agent interaction, tool
feedback, failures, repo state, and Research Vault evidence into future-self
context. The core loop is `observe reality -> update belief -> choose action ->
verify delta -> preserve learning`.

Key design constraints: separate source truth from hypotheses and parking,
exclude secret-adjacent memory from default context compilation, require trust
promotion before memory becomes shared future policy, keep the first MVP local,
and defer base-model training until the external memory substrate proves
behavior change.

Rationale: Workbench Self-Awareness answers current runtime/repo/tool safety;
L2 Pressure answers which prior Research Vault evidence changes route or risk.
Windburn Cognitive Cache answers what the system learned from prior verified
reality feedback and how that should change the next run.

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

## 2026-05-02 - Route Unspecified New Webpage Work To Project Windburn

Decision: treat `Fearvox/project-windburn` as the default landing-zone repo for
new webpage, subpage, landing-page, and microsite work only when no target repo
is named in the request, attached to the issue or project, or otherwise
established by primary repo evidence.

Until repo evidence shows otherwise, `project-windburn` is scaffold-only. Do
not assume an existing app root, shared packages, route tree, build system, or
deployment wiring from the repo name alone. Keep the root for index/routing
documentation, place each child page as a self-contained project directly under
the checkout as `<project-windburn checkout>/<page-name>/`, do not create a
nested `<project-windburn checkout>/project-windburn/<page-name>/` directory
unless the human asks for it, and require any shared code to be explicit and
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

## 2026-05-03 - Keep Workbench Codex Runs Lean

Decision: normal Multica Workbench Codex runs must not inherit the full user
Codex plugin and marketplace profile. Per-run `codex-home/config.toml` should
come from `config/multica-workbench-codex-profile.example.toml` or an equivalent
launcher path such as `codex exec --ignore-user-config`.

`codex app-server` support must be verified before passing exec-only flags. If
the launcher cannot ignore user config, generate the lean per-run config instead
and omit `[marketplaces.*]` and `[plugins.*]` tables unless the issue explicitly
needs a named plugin capability.

The cache janitor is a guard, not the primary fix. It may prune only
completed-run `*/codex-home/.tmp` directories after dry-run review; it must not
touch workdirs, logs, outputs, config, auth, sessions, active runs, or launchd
without separate approval.

Rationale: full profile inheritance made ordinary Workbench Codex tasks sync
plugin repositories into per-run cache directories even when they only needed
shell and `multica`. A lean profile prevents the bytes from being written, and
the janitor limits residue until Multica exposes a first-class profile hook.
