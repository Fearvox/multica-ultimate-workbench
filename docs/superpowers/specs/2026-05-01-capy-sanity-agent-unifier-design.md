# Capy, Sanity, And Agent-Install Unifier Design

## Goal

Make three new workbench surfaces explicit without collapsing their boundaries:
Capy/Brave real-time process checking, Sanity as a cross-CLI context registry,
and agent-install as the multi-agent config distribution layer.

## Design

The first shipped feature is `Capy Process Check`. It uses the human desktop
and Brave accessibility state as a live observation window for Capy threads and
PR panels. The output is a compact `CAPY_PROCESS_CHECK` block. It may report
what the UI currently says, but GitHub CLI, repo state, CI, and review evidence
remain the source of truth for merge, done, or release claims.

The second surface is `Sanity Unified Context`. Sanity stores structured,
sanitized workbench context for CLIs that otherwise drift apart: agent profiles,
runtime surfaces, skills, evidence events, decisions, and handoffs. It must not
store secrets, raw logs, OAuth material, raw request payloads, full transcripts,
or private screen captures.

The third surface is `agent-install Unifier`. It packages and syncs skills,
MCP server definitions, and AGENTS.md sections across supported coding agents.
It is a distribution layer, not an authority layer: Multica and the workbench
still own routing, review gates, SDD, Goal Mode, L2 Pressure, and final
acceptance.

## Boundaries

- Capy UI observation is allowed evidence only when labeled as UI observation.
- Sanity records are sanitized indexes and handoffs, not raw telemetry.
- agent-install may write native config files only from reviewed source.
- OAuth and cloud-account grants remain explicit approval events.
- Public repo docs must not include live IDs, tokens, raw payloads, or private
  machine details.

## Verification

- Workbench docs and skills have valid links and public-safe wording.
- Sanity Studio has at least one document type and can build locally.
- PR/merge status is verified with GitHub CLI plus Capy UI observation.
- `git diff --check` passes.

