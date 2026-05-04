# Super.engineering Speed-Match Lane

Generated: `2026-05-04`

## Purpose

The workbench should match Super.engineering and Hermes upstream speed without
trying to replace their runtime team. The winning posture is to dogfood their
fast-moving base, contribute hardened evidence where we see a real edge, and
keep our own value layer in orchestration, trust, UI taste, and repo-readable
memory.

This lane turns that posture into an operating spec.

## Three-Lane Contract

### 1. Wrap And Dogfood The Fast Base

Use upstream runtime improvements as soon as they reduce real friction.

Trigger:

- Nightly or upstream release changes PTY, worktree, hook, diff, watcher,
  runtime, or terminal behavior.
- Local dogfood hits the same surface within the last 48 hours.

Action:

- Update in a controlled window, not mid-ship.
- Snapshot before and after with version, branch, dirty state, and smoke output.
- Add thin wrappers only when they preserve a route or improve operator clarity.

Evidence:

- Version before and after.
- Relevant release-note bullet or upstream PR number.
- Local smoke command and result.
- Residual risk if local changes were stashed, skipped, or restored.

Do not:

- Fork the primitive unless upstream is blocked.
- Rebuild runtime behavior that upstream is visibly fixing.
- Restore generated local lockfiles blindly after update.

### 2. Upstream Hardened Truth

When local dogfood finds a real bug or missing affordance, contribute evidence
instead of vibes.

Trigger:

- We have a reproducible failure, friction point, or UX gap in upstream-adjacent
  Hermes/Super.engineering behavior.
- The fix is small enough to be reviewed without asking maintainers to absorb
  the entire workbench worldview.

Action:

- Open one focused PR or issue.
- Include repro steps, expected/actual behavior, local version, platform, and
  proof commands.
- Keep private screenshots, tokens, raw transcripts, and internal IDs out of
  public artifacts.

Evidence:

- Minimal patch or repro.
- Test, smoke command, or screenshot when the surface is visual.
- Maintainer-facing summary that separates fact from proposal.

Do not:

- Stack unsolicited dashboard/schema/follow-up PRs before maintainer signal.
- Treat Discord approval as merge proof.
- Use public PRs as workbench run logs.

### 3. Keep The Workbench Value Layer

When upstream catches up on primitives, the workbench should move higher, not
duplicate lower-level machinery.

Owner surface:

- Orchestration: Goal Mode, Kanban parity, issue routing, remote cell dispatch.
- Trust: Windburn belief gates, divergence packets, verifier/momentum decay.
- UI taste: Fusion terminal, stream-card clarity, CommitMono/dot-matrix overlay.
- Operating memory: decisions, skills, templates, review contracts, evidence
  paths.

Trigger:

- Upstream release removes a local workaround.
- A dogfood insight changes how agents should coordinate or report evidence.
- A PR is accepted or rejected in a way that updates our operating model.

Action:

- Convert the insight into a doc, skill, template, or decision record.
- Keep implementation minimal until a real workflow needs automation.
- Prefer grep-friendly route handles over long narrative transcripts.

Evidence:

- Source path changed.
- Verification command or review evidence.
- Clear residual risk and next owner action.

Do not:

- Move strategy into README run logs.
- Add a new automation lane because a fuzzy thought sounds promising.
- Hide behavior-changing memory in chat only.

### Docs Sync Review

For any speed-match writeup that changes public-facing docs, skills, install
instructions, agent roles, templates, or README/SYNTHESIS/DECISIONS shape:

1. Claude Code writes the first patch.
2. Hermes reviews with `skills/workbench-hermes-docs-sync/SKILL.md`.
3. Supervisor accepts only after every related public surface is updated or
   explicitly marked "no change needed."

This keeps Hermes in the role it is good at: automated long-context coverage
review, not first-pass public copywriting.

## Intake Checklist

Use this before acting on a fast upstream update:

```text
SPEED_MATCH_INTAKE
upstream_surface:
local_dogfood_signal:
same_surface_evidence:
lane: wrap_dogfood | upstream_pr | workbench_value
dirty_state:
version_before:
version_after:
operator_risk:
smallest_next_action:
verdict: GO | PARK | BLOCK
```

## Default Decisions

- If upstream is fixing a primitive now, wrap and observe before rebuilding it.
- If the local finding is upstream-actionable, produce one focused hardened PR.
- If the insight is workbench-specific, preserve it as repo-readable operating
  memory before opening a new execution lane.
- If the only evidence is excitement, park it for 24 hours.

## Current Application

Super.engineering nightly `2026-05-04` shipped fixes around inline diff counts,
macOS PTY lifecycle, invisible worktree watchers, and API chat-session handling.
Those overlap directly with the current workbench dogfood surface:

- stream-card clarity for hook and model-state noise,
- Fusion chat bridge read-only runtime state,
- Windburn profile as a horizontal session overlay,
- repo-clean ship behavior with explicit untracked artifact handling.

Immediate route:

1. Treat upstream runtime fixes as the base.
2. Keep Fusion/Windburn as the operator layer.
3. Upstream only the small, evidence-backed improvements that maintainers can
   review without importing the whole workbench system.
