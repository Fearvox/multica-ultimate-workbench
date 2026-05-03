# AGENTS.md

Guidance for agents working in this repository.

This file is the internal operating manual. The public overview lives in [README.md](README.md). Do not turn the README into a run log; keep operational evidence in the files listed below.

## Read Order

Read only as deep as the task requires:

1. [README.md](README.md) - public overview and navigation.
2. [SYNTHESIS.md](SYNTHESIS.md) - current strategy, architecture, risks, and live operating model.
3. [DECISIONS.md](DECISIONS.md) - durable decisions and rationale.
4. [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) - flight recorder and token/context review contract.
4b. [docs/agent-communication-profile.md](docs/agent-communication-profile.md) - session communication profile; apply at startup before emitting user-facing output.
5. [docs/self-awareness-infra-layer.md](docs/self-awareness-infra-layer.md) - capability discovery, repo anchor, risk, and routing bootstrap.
6. [skills/workbench-self-awareness-infra/SKILL.md](skills/workbench-self-awareness-infra/SKILL.md) - executable bootstrap block and verdict rules.
7. [docs/skill-curator.md](docs/skill-curator.md) - skill lifecycle, stale/archive/pin review protocol.
8. [docs/multica-021-workflow.md](docs/multica-021-workflow.md) - project-bound repo, Quick Capture, fresh rerun, Mermaid, and runtime config rules.
8b. [docs/codex-workbench-runtime-profile.md](docs/codex-workbench-runtime-profile.md) - lean Codex per-run profile and cache guard contract.
8c. [docs/runtime-hygiene-lane.md](docs/runtime-hygiene-lane.md) - disk/swap/cache/session cleanup boundaries.
8d. [docs/windburn-cognitive-cache-direction.md](docs/windburn-cognitive-cache-direction.md) - Windburn memory-native direction and .learning trust model.
8e. [docs/windburn-cognitive-cache-dispatch.md](docs/windburn-cognitive-cache-dispatch.md) - Windburn cognitive-cache MVP dispatch and review contract.
8f. [docs/windburn-divergence-gated-trust-research.md](docs/windburn-divergence-gated-trust-research.md) - Windburn v0.3 divergence-gated trust-promotion research packet.
9. [skills/workbench-goal-mode/SKILL.md](skills/workbench-goal-mode/SKILL.md) - `/goal` and goal-persistence closeout contract.
9b. [skills/workbench-goal-mode-v2/SKILL.md](skills/workbench-goal-mode-v2/SKILL.md) - Two-layer autonomous conductor with decision packets and dedupe controls.
10. [skills/workbench-l2-pressure-gate/SKILL.md](skills/workbench-l2-pressure-gate/SKILL.md) - Research Vault pressure gate for remote/HarnessMax work.
11. [docs/remote-rv-mcp.md](docs/remote-rv-mcp.md) - read-only remote Research Vault MCP contract.
12. [docs/capy-process-check-lane.md](docs/capy-process-check-lane.md) - Brave/Computer Use observation for Capy task and PR state.
13. [skills/workbench-capy-process-check/SKILL.md](skills/workbench-capy-process-check/SKILL.md) - Capy process check report contract.
14. [CLAUDE.md](CLAUDE.md) - Claude-compatible compact bridge for external tools.
15. [.capy/CAPTAIN.md](.capy/CAPTAIN.md) - Capy routing and task-splitting rules.
16. [.capy/BUILD.md](.capy/BUILD.md) - Capy implementation loop and closeout format.
17. [.capy/REVIEW.md](.capy/REVIEW.md) - Capy review stance and verdict format.
18. [.capy/settings.json](.capy/settings.json) - Capy MCP and project settings.
19. [docs/sanity-unified-context-lane.md](docs/sanity-unified-context-lane.md) - Sanity context registry boundary.
20. [skills/workbench-sanity-context/SKILL.md](skills/workbench-sanity-context/SKILL.md) - Sanity schema and data-policy rules.
21. [docs/agent-install-unifier-lane.md](docs/agent-install-unifier-lane.md) - agent-install sync boundary.
22. [skills/workbench-agent-install-unifier/SKILL.md](skills/workbench-agent-install-unifier/SKILL.md) - agent-install report contract.
23. [docs/flue-agent-harness-lane.md](docs/flue-agent-harness-lane.md) - deployable Flue agent harness lane.
24. [skills/workbench-flue-agent-harness/SKILL.md](skills/workbench-flue-agent-harness/SKILL.md) - Flue scaffold contract and report rules.
25. [skills/README.md](skills/README.md) - workspace skill map and attachments.
26. [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) - role and runtime expectations.
27. [WORKBENCH_LOG.md](WORKBENCH_LOG.md) - historical evidence only when needed.

## Repository Role

This repository is the durable operating memory for the Multica Ultimate Workbench. Multica owns live collaboration: agents, issues, comments, direct chat, runtimes, skills, and autopilots. This repo owns the reviewable source of truth around that live layer: role definitions, templates, safety rules, decisions, helper scripts, and synthesis.

Do not treat this repo as the Multica runtime itself.

## Codex App Supervisor Session

A Codex Desktop thread can be designated as the human-side supervisor for
Multica. That session is a control room, not proof of its shell current working
directory.

When supervising Multica from Codex Desktop:

- Treat this repository as the logical repo anchor even if the shell starts in a
  different project.
- Use explicit `workdir` or `git -C <LOCAL_WORKBENCH_REPO>` for every repo
  claim, edit, check, commit, or status read.
- Do not write migration notes, handoffs, or operational artifacts into the
  accidental startup repository.
- Keep sanitized supervisor notes in this repo, Multica issue comments, or
  linked review artifacts. Keep raw transcripts, private screenshots, tokens,
  and request payloads out of Git.
- Discord, Superconductor, Capy, and browser-visible state are observation
  surfaces. Final truth still comes from repo files, GitHub, CI, Multica issue
  evidence, and explicit review verdicts.

## Operating Rules

- Route every request through the Friction Tier Router before adding workflow
  ceremony. Low-risk work should stay light; high-risk work keeps the hard
  gates.
- Apply [docs/agent-communication-profile.md](docs/agent-communication-profile.md)
  at session init. Tone: human, direct, bilingual, pushback-ok. Use the profile
  for output style only; do not treat its model notes as runtime proof.
- Do not modify Multica daemon, Desktop UI, or core runtime unless the human explicitly asks.
- Do not store secrets, OAuth material, private tokens, raw request payloads, or raw run transcripts.
- Do not claim completion without evidence.
- Cloud, repo-reply, GitHub, and Copilot bot surfaces must use a cloud-safe MCP
  profile with no `stdio` servers. Do not let mention-triggered bots start
  local-only tools such as Playwright MCP; if a reply path requires browser
  automation, route it to an explicitly local interactive runtime instead.
- Normal Workbench Codex runs must use a lean per-run profile or an equivalent
  `--ignore-user-config` launcher path. Do not copy full user Codex
  `[marketplaces.*]` or `[plugins.*]` tables into per-run `codex-home` unless
  the issue explicitly needs a named plugin capability.
- Prefer the `Ultimate Workbench` Multica Project and its GitHub repo resource before guessing repository context.
- From a Multica runtime, use the issue's project-bound GitHub repo resource first.
- The `file://<LOCAL_WORKBENCH_REPO>` checkout is laptop-local only. Remote runtimes such as `<REMOTE_MULTICA_DEVICE>` must not rely on it; if repo checkout resolves to that path remotely, report `FLAG` or `BLOCK` and name the repo-anchor fix.
- Use `scripts/collect-flight-recorder.sh <issue-id>` for review summaries when relevant.
- Use [skills/workbench-self-awareness-infra/SKILL.md](skills/workbench-self-awareness-infra/SKILL.md) when the Friction Tier Router selects Heavy Path, when repo/runtime ownership is ambiguous, or when Standard Path evidence depends on current runtime capability.
- Use [docs/skill-curator.md](docs/skill-curator.md) before proposing stale/archive/pin changes to skills.
- Use [docs/windburn-cognitive-cache-direction.md](docs/windburn-cognitive-cache-direction.md) and [docs/windburn-cognitive-cache-dispatch.md](docs/windburn-cognitive-cache-dispatch.md) when a task touches Windburn cognitive cache, `.learning`, future-self memory, belief/perception/continuity state, or behavior-changing memory.
- Use [skills/workbench-goal-mode/SKILL.md](skills/workbench-goal-mode/SKILL.md) when an issue contains `/goal` or `GOAL_MODE: yes` for simple single-agent persistence.
- Use [skills/workbench-goal-mode-v2/SKILL.md](skills/workbench-goal-mode-v2/SKILL.md) when the issue also contains `GOAL_MODE_V2: yes` or the objective spans multiple agents and evidence cycles — the two-layer conductor produces decision packets, dispatches bounded issues, monitors, reviews, and archives until a real blocker appears.
- Use [skills/workbench-l2-pressure-gate/SKILL.md](skills/workbench-l2-pressure-gate/SKILL.md) when a task asks for HarnessMax, remote evolution, remote Hermes, remote VM, leaderboard pressure, or Research Vault grounding.
- Use [skills/workbench-capy-process-check/SKILL.md](skills/workbench-capy-process-check/SKILL.md) when a task asks to inspect Capy live state through Brave, Computer Use, a Capy thread, a Capy task, or a Capy PR panel.
- Use [.capy/CAPTAIN.md](.capy/CAPTAIN.md), [.capy/BUILD.md](.capy/BUILD.md), [.capy/REVIEW.md](.capy/REVIEW.md), and [.capy/settings.json](.capy/settings.json) as the Capy project context pack; these files make Capy use repo, PR, CI, and review evidence before self-reporting success.
- Use [skills/workbench-sanity-context/SKILL.md](skills/workbench-sanity-context/SKILL.md) when a task touches Sanity schema, Studio, MCP, or the shared context registry.
- Use [skills/workbench-agent-install-unifier/SKILL.md](skills/workbench-agent-install-unifier/SKILL.md) when a task uses `agent-install` to sync skills, MCP definitions, or AGENTS.md sections across coding agents.
- Use [skills/workbench-flue-agent-harness/SKILL.md](skills/workbench-flue-agent-harness/SKILL.md) when an issue declares `FLUE_AGENT_CONTRACT` or asks to package a workflow as a deployable Flue agent.
- Autopilots create issues; they do not silently perform high-risk work.
- Outer Ring agents do not assign work to each other.
- Preserve `Workbench Max` unless the human explicitly asks to modify it.
- Prefer compact handoffs before broad history reads.
- Keep public-facing docs clean; put internal run evidence in `WORKBENCH_LOG.md` or linked review comments.

## Workbench Workflow

Use the two-ring model.

| Ring | Roles | Behavior |
| --- | --- | --- |
| Inner Ring | Workbench Admin, Workbench Supervisor, Workbench Synthesizer | Route work, review evidence, preserve memory, and keep the system coherent. |
| Outer Ring | Developer, Researcher, Architect, Docs, QA, Ops, Curator | Execute bounded specialist work. Do not take over orchestration unless assigned. |
| Remote Cell | NYC Codex Builder, NYC Hermes Researcher, NYC Ops Mechanic, NYC VM Runner | Execute longer tasks on `<REMOTE_MULTICA_DEVICE>`. Treat laptop file paths as invalid unless explicitly verified on that host. |
| Special | Workbench Max | Preserved private workbench. Use only when the human explicitly assigns it. |

Direct chat is for fuzzy thought. Issues are for executable work. Mentions are for narrow review or advice. Autopilots create recurring review issues. The Friction Tier Router decides whether the work is Fast, Standard, or Heavy before additional gates are applied. Heavy work and ambiguous repo/runtime work require `SELF_AWARENESS_BOOTSTRAP` so role, repo, tool/MCP, memory, risk, route, and success metric are explicit. The Auto Review Sweeper is the automatic `in_review` handoff: Workbench Supervisor scans completed agent work on a schedule, posts `AUTO_REVIEW`, and may close PASS targets to `done`. The Remote HarnessMax Evolve Sweeper is the high-rate pressure controller for remote Hermes, remote VM, and Research Vault grounded routing; it creates issues and routes evidence, but does not silently mutate runtime state.

### Friction Tier Router

Workbench Admin chooses the tier at intake. Workbench Supervisor enforces the
chosen tier during review and may upgrade the tier when evidence shows higher
risk. Do not downgrade a task to avoid evidence gates.

```text
FAST_PATH:
- for reading docs, summarizing, copy edits, small README text, link cleanup,
  ACKs, empty scaffolds, lightweight classification, and other work with no
  code, no secrets, and no runtime surface
- no SELF_AWARENESS_BOOTSTRAP unless repo/runtime ownership is ambiguous
- no Temporal Pincer before send
- no Research Vault pressure check
- no broad issue history scan
- max 20 minutes
- output only: Done Sentence / Changed / Verified / Next one action
- if it spawns a new lane, mark FLAG
```

```text
STANDARD_PATH:
- for ordinary code or documentation patches, prototype demos, tests, PR prep,
  and page visual fixes
- require issue anchor or explicit local task
- require evidence expectations before execution
- verify only the touched path
- closeout requires Changed / Verified / Residual risk / Next one action
- after 70% complete: no new architecture names and no new integrations
```

```text
HEAVY_PATH:
- for runtime, agent/autopilot, deploy, payment, OAuth, secrets, branch/merge,
  public proof, daemon/Desktop/core, and remote VM work
- require SELF_AWARENESS_BOOTSTRAP
- require GOAL_LOCK if the objective spans turns
- require full evidence gate before PASS
- require Temporal Pincer for PASS/done/ready-to-merge
- correctness risk = BLOCK
- permission, secret, payment, or runtime mutation = human approval
```

```text
COMPLETION_COOLING:
- 75%: only verify, commit, or hand off; no new scope
- 85%: publish/reviewable means stop editing and collect feedback only
- 90%: merged/accepted means max one POST_MERGE_NOTE
- 100%: no follow-up lane for 24h unless an external blocker appears
```

```text
PARKING_LOT:
Any new idea during active work gets one line only:
Idea:
Trigger:
Earliest revisit:
No agent assignment, issue, or doc expansion for 24h.
```

The Flue Agent Harness Lane is a packaging outlet. It turns a mature workflow
into a deployable HTTP, CI, Node, Cloudflare, or sandbox-backed agent only after
the issue has a complete `FLUE_AGENT_CONTRACT` and normal review gates remain in
force.

The Capy Process Check Lane is an observation outlet. It uses Brave and
Computer Use to inspect live Capy task, thread, PR, and review state, then
compares that UI state with GitHub CLI, git, CI, or repo evidence. Capy UI is
supporting evidence, not source of truth.

The Sanity Unified Context Lane is a structured context registry. It stores
sanitized agent, runtime, skill, evidence, decision, handoff, and Capy check
records for cross-CLI lookup. It must not store secrets, OAuth material, raw
logs, request payloads, private screenshots, or full transcripts.

The Agent-Install Unifier Lane distributes reviewed skills, MCP definitions,
and AGENTS.md sections across coding agents. It requires readback, rollback,
scoped targets, and a secrets policy before config mutation.

## Multica 0.2.21 Protocol

Use [docs/multica-021-workflow.md](docs/multica-021-workflow.md) when a task touches new Multica workflow surfaces.

- Project-bound repo: issues should name or attach `Ultimate Workbench` when this repo is the target.
- Quick Capture intake: preserve the literal request before enrichment or SDD interpretation.
- Fresh rerun: use a new run when context is stale, poisoned, or bound to the wrong repo/branch.
- Mermaid: use compact diagrams for routing, handoff, and state flows when they reduce ambiguity.
- Runtime config: prefer Multica `--model`, `--custom-env-file`, or `--custom-env-stdin` over prompt text for agent-specific runtime configuration.
- Codex profile: use [docs/codex-workbench-runtime-profile.md](docs/codex-workbench-runtime-profile.md) and [config/multica-workbench-codex-profile.example.toml](config/multica-workbench-codex-profile.example.toml) for normal Workbench Codex runs; `scripts/multica-codex-cache-janitor.sh` is a completed-run cache guard, not a launcher fix.

## Self-Awareness Protocol

Use Self-Awareness when the Friction Tier Router selects Heavy Path, when
repo/runtime ownership is ambiguous, or when Standard Path depends on current
runtime capability:

```text
SELF_AWARENESS_BOOTSTRAP
runtime_identity:
role_boundary:
repo_anchor:
tool_envelope:
mcp_envelope:
memory_sources_checked:
current_state_proof:
risk_envelope:
routing_decision:
success_metric:
operator_call_conditions:
verdict: READY | FLAG | BLOCK
```

Rules:

- Current issue, repo, branch, run, and tool evidence beats historical memory.
- Missing tools or MCP surfaces must be labeled missing, not inferred from another runtime.
- The bootstrap may route to SDD, Goal Mode, L2 Pressure, VM lane, child issues, inline execution, QA, or Supervisor review.
- Public docs must not contain raw env dumps, secrets, live IDs, request payloads, or raw transcripts.
- `READY` means proceed; `FLAG` means proceed with a named caveat; `BLOCK` means a real external blocker must be fixed first.

See [docs/self-awareness-infra-layer.md](docs/self-awareness-infra-layer.md), [skills/workbench-self-awareness-infra/SKILL.md](skills/workbench-self-awareness-infra/SKILL.md), and [issue-templates/self-awareness-bootstrap.md](issue-templates/self-awareness-bootstrap.md).

## SDD Protocol

For work that the Friction Tier Router sends to SDD, use the SDD comment
pipeline:

```text
Raw Requirement -> Product Design -> Technical Design -> Task List -> Execution And Verification
```

Rules:

- Keep issue statuses coarse: `todo`, `in_progress`, `in_review`, `done`, `blocked`.
- Put stage detail in structured comments, not custom statuses.
- Start from compact handoffs and exact evidence IDs before reading full history.
- Use [issue-templates/sdd-workflow.md](issue-templates/sdd-workflow.md) when the work needs the full SDD path.
- Quick fixes may bypass full SDD only when the risk is low and the evidence path is still clear.
- For `/goal` work, Task List must include `GOAL_LOCK`, closeout gates, and operator-call conditions before execution starts.

## Review Protocol

Reviewer output must be evidence-backed.

- End with exact `PASS`, `FLAG`, or `BLOCK` when the issue asks for a review verdict.
- Auto-review comments must include `AUTO_REVIEW`, `TARGET`, `VERDICT`, `VERDICT_SUMMARY`, `EVIDENCE`, `STATUS_ACTION`, and `NEXT_ACTION`.
- If the task asks for a scaffold, use: `What was verified / Evidence or proposed evidence / Residual risk / Next action`.
- `PASS` means the goal is achieved and residual risk is acceptable.
- `FLAG` means the path is usable but has a concrete risk or missing proof.
- `BLOCK` means the work should not proceed or close.
- Do not accept a done claim that lacks commands, files, IDs, screenshots, logs, or other concrete evidence.

## Flight Recorder Protocol

Use the flight recorder for compact issue review:

```bash
scripts/collect-flight-recorder.sh <issue-id>
```

Default mode prints `RUN_DIGEST` to stdout and writes no persistent files.

Optional artifact mode:

```bash
scripts/collect-flight-recorder.sh <issue-id> --artifact-dir "${TMPDIR:-/tmp}/workbench-flight-recorder/<issue-id>"
```

Artifact mode writes summary files only. Do not store raw issue descriptions, full comment bodies, run-message transcripts, screenshots, traces, OAuth material, private tokens, or request payloads.

Token fields may be absent from Multica CLI run JSON. Treat that as an INFO residual risk and use UI/API billing evidence when quota attribution matters.

## L2 Pressure Protocol

Use L2 Pressure before high-pressure remote or HarnessMax routing:

```text
RV_PRESSURE_CHECK
objective:
owner:
vault_source:
queries_or_indexes_checked:
relevant_prior_failures:
proven_patterns:
l2_pressure_applied:
not_applied_and_why:
next_best_action:
verdict: PASS | FLAG | BLOCK
```

Remote Research Vault access is read-only by default. Allowed tools are
`vault_status`, `vault_search`, `vault_taxonomy`, and `vault_get`. Do not enable
vault writes, ingest, delete, maintenance, or broad raw export without a separate
issue, approval, and Supervisor review.

## Flue Agent Harness Protocol

Use Flue only when the issue is creating or reviewing a deployable agent
harness. Required block:

```yaml
FLUE_AGENT_CONTRACT:
  purpose:
  project_directory:
  workspace_layout:
  agent_file:
  deploy_target:
  model_id:
  sandbox_mode:
  trigger:
  secrets_policy:
  validation_command:
  public_artifact_policy:
```

Rules:

- Existing non-empty repositories use `.flue/agents/` and `.flue/roles/`.
- New or empty projects use `agents/` and `roles/`.
- Model ID must be exact and explicitly passed to `init({ model })`.
- Secrets stay in environment variables or trusted host command definitions.
- Do not use a Flue scaffold issue to mutate live Multica runtimes or bindings.

See [docs/flue-agent-harness-lane.md](docs/flue-agent-harness-lane.md),
[skills/workbench-flue-agent-harness/SKILL.md](skills/workbench-flue-agent-harness/SKILL.md),
and [issue-templates/flue-agent-scaffold.md](issue-templates/flue-agent-scaffold.md).

## Capy Process Check Protocol

Use this protocol when live Capy state matters:

```text
CAPY_PROCESS_CHECK
target:
browser_app:
capy_surface:
observed_state:
ui_evidence:
cli_evidence:
repo_evidence:
source_of_truth:
action_taken:
residual_risk:
verdict: PASS | FLAG | BLOCK
```

Rules:

- Read Capy UI through the approved browser/computer surface.
- Confirm PR, merge, branch, and CI claims with GitHub CLI or git state.
- Treat Capy UI as supporting evidence.
- Do not copy private thread URLs, screenshots, raw logs, cookies, OAuth codes,
  tokens, or unrelated private UI into public docs.
- Do not click OAuth, merge, publish, permission, or destructive controls unless
  the human explicitly approves that exact action.

See [docs/capy-process-check-lane.md](docs/capy-process-check-lane.md),
[skills/workbench-capy-process-check/SKILL.md](skills/workbench-capy-process-check/SKILL.md),
and [issue-templates/capy-process-check.md](issue-templates/capy-process-check.md).

## Sanity Context Protocol

Use this protocol when touching Sanity schemas, Studio, MCP, or the cross-CLI
context registry:

```text
SANITY_CONTEXT_REPORT
project:
dataset:
schema_types:
data_policy:
files_changed:
validation:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

Rules:

- Store sanitized summaries and pointers only.
- Do not store secrets, OAuth material, raw payloads, screenshots, cookies,
  tokens, or full transcripts.
- Current repo and issue evidence beats Sanity memory.
- Schema changes must build or validate locally before closeout.

See [docs/sanity-unified-context-lane.md](docs/sanity-unified-context-lane.md),
[skills/workbench-sanity-context/SKILL.md](skills/workbench-sanity-context/SKILL.md), and
[issue-templates/sanity-context-schema.md](issue-templates/sanity-context-schema.md).

## Agent-Install Unifier Protocol

Use this protocol when syncing skills, MCP definitions, or AGENTS.md sections
across coding agents:

```yaml
AGENT_INSTALL_SYNC_CONTRACT:
  operation:
  source:
  target_agents:
  config_scope:
  secrets_policy:
  dry_run_first:
  readback_required:
  rollback_plan:
```

Rules:

- Prefer readback and dry-run before mutation.
- Prefer project-local config over global user config unless the task names a
  global sync.
- Non-local, mention-triggered, repo-reply, GitHub, Copilot, and Codex Cloud
  agents must read back `stdio_policy: deny` before receiving MCP config.
  `playwright` and other local browser MCP servers are allowed only for an
  explicitly local interactive runtime and must not be inherited by cloud-safe
  profiles.
- Never place token values, OAuth material, cookies, passwords, or private keys
  in command examples or durable docs.
- Report changed config paths and rollback plan.

See [docs/agent-install-unifier-lane.md](docs/agent-install-unifier-lane.md),
[skills/workbench-agent-install-unifier/SKILL.md](skills/workbench-agent-install-unifier/SKILL.md),
and [issue-templates/agent-install-unifier.md](issue-templates/agent-install-unifier.md).

## Skill Curator Protocol

Use the skill curator for maintenance of workbench skills, prompts, and role bindings:

```text
active -> stale -> archived
```

Rules:

- Treat v1 as review-only. Propose changes; do not silently delete or rewrite skills.
- Respect pinned/canonical items. If a pinned item looks wrong, propose a human-approved patch issue.
- Check local source before live state: `skills/README.md`, relevant `skills/*.md`, relevant `agents/**/*.md`, then `SYNTHESIS.md` and `DECISIONS.md`.
- Use live `multica skill list` or `multica agent skills list` only when the issue asks for live verification.
- Curator output should include `CATALOG_STATE`, `OVERLAPS`, `DRIFT`, `TOKEN_RISK`, `PATCH_PLAN`, `LIVE_SYNC_NEEDED`, `RESIDUAL_RISK`, and a final `PASS` / `FLAG` / `BLOCK`.

See [docs/skill-curator.md](docs/skill-curator.md), [autopilots/skill-curator.md](autopilots/skill-curator.md), and [issue-templates/curator-review.md](issue-templates/curator-review.md).

## File Map

| Need | File |
| --- | --- |
| Public project overview | [README.md](README.md) |
| Current architecture and strategy | [SYNTHESIS.md](SYNTHESIS.md) |
| Durable decisions | [DECISIONS.md](DECISIONS.md) |
| Rollout history | [WORKBENCH_LOG.md](WORKBENCH_LOG.md) |
| Flight recorder contract | [WORKBENCH_METRICS.md](WORKBENCH_METRICS.md) |
| Flight recorder usage | [docs/flight-recorder.md](docs/flight-recorder.md) |
| Agent communication profile | [docs/agent-communication-profile.md](docs/agent-communication-profile.md) |
| Self-awareness protocol | [docs/self-awareness-infra-layer.md](docs/self-awareness-infra-layer.md) |
| Self-awareness skill | [skills/workbench-self-awareness-infra/SKILL.md](skills/workbench-self-awareness-infra/SKILL.md) |
| Multica 0.2.21 workflow rules | [docs/multica-021-workflow.md](docs/multica-021-workflow.md) |
| Codex Workbench runtime profile | [docs/codex-workbench-runtime-profile.md](docs/codex-workbench-runtime-profile.md) |
| Lean Codex profile example | [config/multica-workbench-codex-profile.example.toml](config/multica-workbench-codex-profile.example.toml) |
| Codex cache janitor | [scripts/multica-codex-cache-janitor.sh](scripts/multica-codex-cache-janitor.sh) |
| Runtime hygiene lane | [docs/runtime-hygiene-lane.md](docs/runtime-hygiene-lane.md) |
| Runtime hygiene skill | [skills/workbench-runtime-hygiene/SKILL.md](skills/workbench-runtime-hygiene/SKILL.md) |
| Windburn cognitive-cache direction | [docs/windburn-cognitive-cache-direction.md](docs/windburn-cognitive-cache-direction.md) |
| Windburn cognitive-cache dispatch | [docs/windburn-cognitive-cache-dispatch.md](docs/windburn-cognitive-cache-dispatch.md) |
| Windburn divergence-gated trust research | [docs/windburn-divergence-gated-trust-research.md](docs/windburn-divergence-gated-trust-research.md) |
| Windburn divergence gate goal template | [issue-templates/windburn-divergence-gate-goal.md](issue-templates/windburn-divergence-gate-goal.md) |
| Windburn time-awareness goal template | [issue-templates/windburn-time-awareness-goal.md](issue-templates/windburn-time-awareness-goal.md) |
| Goal-persistence execution (v1) | [skills/workbench-goal-mode/SKILL.md](skills/workbench-goal-mode/SKILL.md) |
| Goal Mode v2 conductor | [skills/workbench-goal-mode-v2/SKILL.md](skills/workbench-goal-mode-v2/SKILL.md) |
| Goal Mode v2 issue template | [issue-templates/goal-mode-v2.md](issue-templates/goal-mode-v2.md) |
| Goal conductor autopilot | [autopilots/goal-conductor.md](autopilots/goal-conductor.md) |
| L2 pressure execution | [skills/workbench-l2-pressure-gate/SKILL.md](skills/workbench-l2-pressure-gate/SKILL.md) |
| Remote Research Vault MCP | [docs/remote-rv-mcp.md](docs/remote-rv-mcp.md) |
| Capy process check lane | [docs/capy-process-check-lane.md](docs/capy-process-check-lane.md) |
| Capy process check skill | [skills/workbench-capy-process-check/SKILL.md](skills/workbench-capy-process-check/SKILL.md) |
| Sanity context lane | [docs/sanity-unified-context-lane.md](docs/sanity-unified-context-lane.md) |
| Sanity context skill | [skills/workbench-sanity-context/SKILL.md](skills/workbench-sanity-context/SKILL.md) |
| Agent-install unifier lane | [docs/agent-install-unifier-lane.md](docs/agent-install-unifier-lane.md) |
| Agent-install unifier skill | [skills/workbench-agent-install-unifier/SKILL.md](skills/workbench-agent-install-unifier/SKILL.md) |
| Flue agent harness lane | [docs/flue-agent-harness-lane.md](docs/flue-agent-harness-lane.md) |
| Flue scaffold skill | [skills/workbench-flue-agent-harness/SKILL.md](skills/workbench-flue-agent-harness/SKILL.md) |
| Skill curator protocol | [docs/skill-curator.md](docs/skill-curator.md) |
| Agent roster | [agents/AGENT_ROSTER.md](agents/AGENT_ROSTER.md) |
| Remote agent cell | [agents/remote/nyc-remote-agents.md](agents/remote/nyc-remote-agents.md) |
| Workspace skills | [skills/README.md](skills/README.md) |
| Issue templates | [issue-templates/](issue-templates/) |
| Autopilot specs | [autopilots/](autopilots/) |
| Helper scripts | [scripts/](scripts/) |

## Safety Boundaries

- No destructive cleanup without explicit human confirmation.
- No hidden live-state mutation during read-only verification.
- No broad refactor when a small doc or script patch solves the task.
- No rewriting working routes, autopilots, or agent bindings casually.
- No copying secrets or raw payloads into durable docs.
- No deleting evidence artifacts unless the task explicitly asks for cleanup and the evidence has a preserved summary.

## Validation Commands

Run these before closing documentation changes:

```bash
git diff -- README.md AGENTS.md
```

```bash
for path in AGENTS.md SYNTHESIS.md DECISIONS.md WORKBENCH_LOG.md WORKBENCH_METRICS.md docs/agent-communication-profile.md docs/self-awareness-infra-layer.md docs/multica-021-workflow.md docs/codex-workbench-runtime-profile.md docs/runtime-hygiene-lane.md docs/windburn-cognitive-cache-direction.md docs/windburn-cognitive-cache-dispatch.md docs/windburn-divergence-gated-trust-research.md docs/skill-curator.md docs/capy-process-check-lane.md docs/sanity-unified-context-lane.md docs/agent-install-unifier-lane.md docs/flue-agent-harness-lane.md config/multica-workbench-codex-profile.example.toml scripts/multica-codex-cache-janitor.sh skills/workbench-self-awareness-infra/SKILL.md skills/workbench-goal-mode/SKILL.md skills/workbench-goal-mode-v2/SKILL.md skills/workbench-runtime-hygiene/SKILL.md skills/workbench-capy-process-check/SKILL.md skills/workbench-sanity-context/SKILL.md skills/workbench-agent-install-unifier/SKILL.md skills/workbench-flue-agent-harness/SKILL.md skills/README.md agents/AGENT_ROSTER.md issue-templates/goal-mode-v2.md issue-templates/capy-process-check.md issue-templates/sanity-context-schema.md issue-templates/agent-install-unifier.md issue-templates/flue-agent-scaffold.md issue-templates/windburn-divergence-gate-goal.md issue-templates/windburn-time-awareness-goal.md; do
  test -f "$path" || exit 1
done
echo "link-targets-ok"
```

```bash
(rg -n -i 'sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|Authorization:[[:space:]]*Bearer|api[_-]?key|oauth|private token' README.md AGENTS.md || true)
```

```bash
(rg -n '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|run `|comment `' README.md || true)
```

Expected:

- Link targets exist.
- README exposes no internal UUIDs, run IDs, comment IDs, private tokens, or long history.
- AGENTS.md may contain generic safety terms such as `OAuth material` or `private tokens`, but no real secret values.
