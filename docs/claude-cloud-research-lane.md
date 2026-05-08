# Claude Cloud Research Lane

The Claude Cloud Research Lane scopes what a Claude Code session running on the
hosted "Claude on the web" surface (claude.ai/code) is allowed to do inside the
Multica Ultimate Workbench, what it should produce, and how it interlocks with
the local Codex Desktop supervisor session, Hermes, Capy, and Goal Mode v2.

This lane is distinct from `docs/claude-workbench-runtime-profile.md`. The
runtime profile owns **model tier policy** (which Claude model id and reasoning
effort a Claude Code launcher should pick). This lane owns **work scope and
artifact contract** (what a cloud-hosted session may research, what files it
may produce, what it must not touch). They may both apply to the same session.

## Why The Lane Exists

A Claude session on the hosted web surface has a different blast radius than a
local Claude Code run. It cannot access the Multica daemon socket, the Capy
project settings, the Sanity dataset, the Multica Desktop UI, or the user's
`~/.claude/settings.json`. It also cannot host stdio MCP servers, run
Playwright MCP, or inherit the user's full plugin/marketplace profile. But it
can read the repo, run zero-dependency scripts in a sandbox, and produce
markdown artifacts on a designated branch.

That asymmetry — narrow blast radius, full repo visibility, durable branch —
is exactly the shape of a research surface. This lane formalises that shape so
the cloud session does not silently drift into work that belongs on the local
Codex supervisor.

## Surface Scope

| Surface | This lane covers |
| --- | --- |
| Claude Code on the web (claude.ai/code) | yes |
| Claude Code CLI launched locally by the user | no — covered by `claude-workbench-runtime-profile.md` |
| Claude Architect / Claude Docs roles inside Codex Desktop | no — those run inside the Codex supervisor session |
| Cloud bot mention-triggered runs (GitHub repo-reply, Copilot, Codex Cloud bot) | no — those need the cloud-safe no-stdio MCP profile, separate doc |

## Hard Boundaries

- No stdio MCP servers. No Playwright MCP. No daemon-attached MCP profiles.
- No mutation of `~/.claude/settings.json`, Multica daemon, Capy project
  settings, Sanity dataset, GitHub repo settings, or any provider auth.
- No writes to `.learning/sessions/`, `.learning/beliefs/`, or
  `.learning/fixtures/` that change confidence, trust state, or source truth.
  This lane may create `.learning/parking/` decision packets (which by
  definition do not promote trust).
- No commit or push without an explicit user instruction in the same session.
  The default is "write to disk, report path, wait."
- No claim of completion that depends on Capy / GitHub / CI evidence the lane
  cannot verify itself. Defer those verdicts to the local Codex supervisor or
  to Capy review.
- No paste of raw browser traces, raw transcripts, private screenshots, OAuth
  material, tokens, cookies, or local user paths that contain identifiers.
  Summaries and pointers only, per `CLAUDE.md` Hard Boundaries.
- No use of cloud-side Heavy Path actions. Heavy Path requires human approval
  and a local runtime to verify; this lane proposes, it does not execute Heavy.

## Allowed Work Shapes

The lane produces durable markdown artifacts. Each shape has a fixed home and
a fixed report contract.

| Shape | Home | Purpose |
| --- | --- | --- |
| Lane doc | `docs/*-lane.md` | Define a workstream, its scope, its outputs |
| Decision packet | `.learning/parking/*.md` | Compare candidate paths, recommend one, no auto-commit to chosen path |
| Gap report | `docs/plans/*-gap.md` or inline reply | Spec-vs-implementation diff for an existing line |
| Research session note | `.learning/sessions/<date>-claude-cloud-<slug>.md` | Snapshot of what was read, what was tried in the sandbox, what the residual risk is |
| Fixture stub | `.learning/fixtures/<area>/proposals/*.md` | Proposed fixture for review; not adopted until a non-cloud surface promotes it |
| Draft skill | `skills/<name>/DRAFT.md` | Skill proposal that does not modify `SKILL.md` until reviewed |

The lane does **not** produce: production source code merged to main, CI
config changes, dependency upgrades, secrets/credentials, executable scripts
shipped to `scripts/` (a draft may live in `.learning/parking/` for review).

## Tier Mapping

This lane maps onto the workbench Friction Tier model from `CLAUDE.md`:

| Tier | What the cloud lane does | Evidence expected |
| --- | --- | --- |
| Fast | Read a few files, answer a question, summarise a thread, produce a short ACK or one-paragraph report | The reply itself, with file paths cited |
| Standard | Produce a lane doc, decision packet, gap report, or research session note; spike a zero-dep script in a sandbox to verify a claim | The artifact path + a brief "what I read, what I ran, residual risk" closeout |
| Heavy | Not in scope. Heavy Path actions (deploy, runtime mutation, daemon ops, branch/merge, signed evidence, OAuth, payment) must be handed off to the local Codex supervisor session or to Capy. The lane may **propose** a Heavy action in a decision packet; it must not execute one. |

## Interlock With Other Surfaces

- **Codex Desktop supervisor session.** When a Codex chat is designated as the
  workbench supervisor, treat it as the source of truth for routing,
  approvals, and execution of Heavy Path actions. The cloud lane writes
  research artifacts; the supervisor decides whether to act on them. If a
  Codex session runs simultaneously, the cloud lane should explicitly state
  which artifacts it is producing so they do not collide with concurrent
  Codex work.
- **Hermes.** Hermes owns the Linear/Slack kanban parity signal
  (`docs/hermes-kanban-parity-signal.md`). The cloud lane does not write
  Linear, Slack, or kanban state directly; it produces artifacts that Hermes
  may then sync.
- **Capy.** Capy owns review (`/`.capy/REVIEW.md`) and the Capy Git Dialogue
  responder (`docs/capy-git-dialogue-responder.md`). The cloud lane does not
  sign off on PRs, does not resolve review threads, and does not respond on
  Capy's behalf. It may produce evidence that Capy then references.
- **Goal Mode v2.** Decision packets produced by this lane are valid input to
  the v2 design layer (`skills/workbench-goal-mode-v2/SKILL.md`). The lane
  does not dispatch a packet itself; it produces the packet and points to it.
- **Sanity context.** The lane may read sanitized Sanity records via
  `docs/sanity-unified-context-lane.md`. It must not write Sanity datasets.
  Decision packets may **describe** desired Sanity record shapes; promotion of
  those records happens elsewhere.
- **Workhorse / NixOS remote runtime** (`docs/windburn-workhorse-runtime-registry.md`).
  The cloud lane does not lease workhorse runtime. If a research artifact
  requires a remote run, the lane proposes the run and lists the inputs the
  workhorse would need; it does not execute it.

## Default Work Loop

1. Read the user's request. Pick a Tier.
2. State the role boundary explicitly: "I'm a cloud research surface. I will
   produce <artifact type> at <path>. I will not commit, push, or mutate
   <named surfaces>."
3. Inspect the relevant repo files. Cite paths with `path:line` where useful.
4. If the task is Standard, draft the artifact. If a sandbox spike is needed,
   run it in `/tmp` or a worktree and paste a redacted summary.
5. Verify on the real path: read back the file written, confirm structure
   matches the lane's expected shape.
6. Report: artifact path, what was read, what (if anything) was run, residual
   risk, and the next surface that should act.

If any field is unknown, the closeout report says `FLAG` and names the missing
evidence, per `CLAUDE.md`.

## Required Report

```text
CLAUDE_CLOUD_RESEARCH_REPORT
work_shape:           lane | decision_packet | gap_report | session_note | fixture_stub | draft_skill | inline_reply
artifact_path:
branch:
read_paths:
ran_in_sandbox:       yes | no  (with one-line description if yes)
boundaries_respected: yes | no  (call out any near-violations)
next_surface:         codex_supervisor | capy_review | goal_mode_v2 | hermes | human
residual_risk:
VERDICT:              PASS | FLAG | BLOCK
```

`PASS` requires the artifact to exist at the named path, the boundaries to
hold, and the next-surface handoff to be unambiguous. `FLAG` is correct when
the artifact landed but a downstream surface still needs to confirm something
before action. `BLOCK` is correct when the lane attempted work outside its
scope (mutation, push without instruction, leaked identifier) and aborted.

## First Applications

These are the seed work units that justified writing this lane. They are not
commitments to deliver — they are examples of the artifact shapes above.

1. **Windburn spec-vs-impl gap report.** A standard-tier read of the
   `docs/windburn-*.md` set against `scripts/windburn-*.mjs` to enumerate
   specs without runners and runners without tests. Output: a short gap doc
   plus a session note. Already partially produced in chat, can be promoted
   to a `docs/plans/windburn-spec-vs-impl-gap.md` if a follow-up wants it
   durable.
2. **Materiality classifier backend decision packet.**
   `.learning/parking/windburn-materiality-backend.md`. Compares local-rule
   expansion vs prompt-based LLM vs two-stage embedding+LLM, recommends a
   path, hands off to Goal Mode v2 for dispatch.
3. **Goal Mode v2 / Conductor handoff contract review.** Read the v2 skill
   plus the conductor skill, produce a one-page contract diff identifying
   any place the dispatch layer's authority overlaps the design layer's. Lane
   doc, not a Heavy Path change to either skill.
4. **Sanity context registry coverage check.** Inventory which workbench
   lanes have a sanitized Sanity record and which do not, produce a
   `docs/plans/sanity-coverage.md` pointing at gaps. Read-only,
   no Sanity writes.

## Non-Goals

- This lane does not replace `claude-workbench-runtime-profile.md`. Tier
  selection (default / xhigh / cheap) for any given run is still that doc's
  call.
- This lane does not replace `docs/codex-workbench-runtime-profile.md`. Codex
  remains the supervisor surface; Claude cloud feeds it research.
- This lane does not introduce a new MCP profile, hook, or settings change.
  Configuration belongs in the runtime profile docs and `update-config` skill.
- This lane does not authorize any Heavy Path action. A decision packet may
  argue for one; execution is elsewhere.

## Safety

- No stdio MCP. No daemon attachment. No Capy / Sanity / GitHub repo settings
  mutation. No secret pasting. No commit/push without explicit instruction.
- If the cloud session loses confidence about a boundary (e.g., it cannot
  tell whether a write to `.learning/` would change trust state), the
  default is to stop and ask, not to proceed.
- If the cloud session and a local Codex supervisor are both active on the
  same task, the cloud session must name its artifacts to avoid collision and
  must yield routing decisions to the supervisor.
