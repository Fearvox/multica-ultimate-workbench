# LICENSING.md — Definitive Directory Mapping

This document maps every directory in the repository to its applicable
license. When in doubt, this file is authoritative. See `LICENSE` for
the three-tier overview and rationale.

## Tier 1: Workbench Protocols — Apache 2.0

**What**: Schema contracts, interface definitions, protocol formats.
These are the interchange layer. Anyone may implement these
specifications freely, with patent grant.

**License file**: `LICENSE-APACHE`
**SPDX identifier**: `Apache-2.0`

| Directory / File | Notes |
|------------------|-------|
| `runtime-registry/` | Registry card format, schema_version |
| `issue-templates/` | Template contracts (SDD stage card, adapter contract, run record) |
| `manifests/` | Agent manifest schemas, sandbox configs |
| `app/dashboard/` schema contracts | The data shapes, not the CSS/JS |
| `WORKBENCH_METRICS.md` | Metric schema definitions |
| Contract YAML blocks within lane docs | `HERMES_SANDBOX_RUN_RECORD`, `WORKBENCH_SANDBOX_RUN_RECORD` |

Any file whose primary purpose is defining a schema, contract, or
protocol format falls under Tier 1 regardless of location.

---

## Tier 2: Workbench Implementation — Apache 2.0

**What**: Executable code, reference implementation, dashboards, skills,
autopilots, CLI tools, server modules. Free to fork, adapt, embed,
and deploy commercially.

**License file**: `LICENSE-APACHE`
**SPDX identifier**: `Apache-2.0`

| Directory / File | Notes |
|------------------|-------|
| `scripts/` | All `.sh` and `.mjs` files |
| `app/` | Dashboard HTML, CSS, JS (implementation code) |
| `autopilots/` | All autopilot definitions |
| `skills/` | All skill definitions (SKILL.md included — skills are executable knowledge) |
| `agents/` | Agent roster and agent definitions |
| `prototypes/` | Prototype implementations |
| `docs/codex-workbench-runtime-profile.md` | Runtime config |
| `docs/windburn-profile.md` | Runtime config |
| `docs/superconductor-pi-harness-config.md` | Config |
| `docs/agent-communication-profile.md` | Config |
| `docs/agent-install-unifier-lane.md` | Implementation guide |
| `*.json` | Configs, manifests (except protocol schemas in Tier 1) |
| `.capy/` | Capy project configuration |
| `.gitignore`, `.gitattributes` | Repo configuration |
| `.vscode/`, `.github/` | CI/CD and editor config |

---

## Tier 3: Workbench Learnings — CC BY-SA 4.0

**What**: Lane documents, friction patterns, parked specs, belief epics,
learning sessions, architectural decisions, synthesis records.
Attribution + ShareAlike. Commercial use allowed, but derivatives
must stay CC BY-SA.

**License file**: `LICENSE-CC-BY-SA`
**SPDX identifier**: `CC-BY-SA-4.0`

| Directory / File | Notes |
|------------------|-------|
| `.learning/` | Entire directory — failures, parking, sessions, beliefs, fixtures |
| `docs/` | All lane docs (except config/profile docs in Tier 2) |
| `DECISIONS.md` | Architectural decision record |
| `SYNTHESIS.md` | Synthesis and synthesis history |
| `AGENTS.md` | Agent operating instructions (operational knowledge) |
| `CLAUDE.md` | Claude-specific operating instructions |
| `README.md` | Project overview and narrative |
| `AGENT_ROSTER.md` | Agent topology and design rationale |
| `docs/flight-recorder.md` | Operational knowledge |
| `docs/multica-021-workflow.md` | Operational knowledge |
| `docs/repo-brand-uplift-lane.md` | Lane doc |
| `docs/run-finalization-reconciliation-lane.md` | Lane doc |
| `docs/runtime-hygiene-lane.md` | Lane doc |
| `docs/sanity-unified-context-lane.md` | Lane doc |
| `docs/super-engineering-speed-match-lane.md` | Lane doc |
| `docs/hermes-openai-sandbox-adapter-lane.md` | Lane doc |
| `docs/workbench-vercel-open-agents-integration-lane.md` | Lane doc |
| `docs/capy-process-check-lane.md` | Lane doc |
| `docs/capy-vm-lane.md` | Lane doc |
| `docs/flue-agent-harness-lane.md` | Lane doc |
| `docs/project-windburn-scaffold-lane.md` | Lane doc |
| `WORKBENCH_METRICS.md` | Split: schema definitions → Tier 1, narrative content → Tier 3 |

---

## Edge Cases and Mixed-Content Files

### Lane docs with YAML contracts

Lane documents (e.g., `docs/workbench-vercel-open-agents-integration-lane.md`)
contain both narrative text (CC BY-SA) and contract YAML blocks (Apache 2.0).
The contract YAML blocks (marked by ```yaml fences with explicit contract
names like `HERMES_SANDBOX_RUN_RECORD`) may be extracted and used under
Apache 2.0 independently of the surrounding document.

### SKILL.md files

SKILL.md files live in `skills/` and are Tier 2 (Apache 2.0). They are
executable knowledge — agent-readable procedures — not narrative documentation.
If a SKILL.md contains substantial original lane/narrative content that was
authored as a learning artifact, the author should split it: procedural
content in SKILL.md (Apache 2.0), narrative context in a lane doc (CC BY-SA).

### Third-party code

Any vendored or included third-party code retains its original license.
Check the file header or the directory for a separate LICENSE or NOTICE.

---

## Contribution Licensing

All contributions to this repository are accepted under the same license
as the file or directory being modified. By submitting a contribution
(PR, patch, issue comment containing substantive code or specification
text), you agree that your contribution will be licensed under the
applicable license for that part of the repository.

For new files: the contributor SHOULD place the file in the appropriate
directory per this mapping. If unsure, ask in the PR description and
the maintainer will assign the correct tier before merge.

---

## License Evolution

This multi-license model may be adjusted as the repository grows. Changes
require:
1. A documented decision in `DECISIONS.md`
2. A PR that updates `LICENSE`, this file, and any affected directories
3. A 30-day notice period for contributors (via issue)

No retroactive re-licensing: existing code under a given tier at the time
of contribution remains available under that tier. Changes apply to future
contributions and new files only.

---

## Quick Reference

```
Tier 1 (Protocols)    → LICENSE-APACHE     → Free to implement, patent grant
Tier 2 (Code)         → LICENSE-APACHE     → Free to fork, adapt, deploy
Tier 3 (Learnings)    → LICENSE-CC-BY-SA   → Use freely, improvements stay open
```

Copyright 2026 Fearvox / 0xVox (Nolan Zhu / Hengyuan Zhu)
