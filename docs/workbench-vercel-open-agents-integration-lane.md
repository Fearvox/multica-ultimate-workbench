# Workbench x Vercel Open Agents Integration Lane

Generated: `2026-05-05`
Triggers: Capy Reviews GA · Vercel deepsec · OpenAI Agents SDK · Vercel open-agents.dev

## Purpose

This lane defines the synthesis architecture where Vercel Open Agents provides
the execution layer (sandbox, durable workflow, model routing) and Workbench
provides the control plane (registry cards, decision packets, evidence gates,
fleet visibility, memory).

It unifies and supersedes these lanes:

| Lane | Absorbed Role |
|------|---------------|
| `hermes-openai-sandbox-adapter-lane.md` | Now one backend among many in the sandbox layer |
| `run-finalization-reconciliation-lane.md` | Maps to Workflow SDK checkpoint + finalization |
| `docs/capy-process-check-lane.md` | Captain/Build pattern maps to agent-outside-sandbox |
| `docs/repo-brand-uplift-lane.md` | Sandbox snapshots as branded environments |

It deparks and promotes:

| Parked Spec | Mapping |
|-------------|---------|
| `verification-harness-spec.md` | Evidence gate after sandbox run completes |
| `self-consistency-verifier-spec.md` | Agent self-review before PR creation |
| `multica-dispatch-windburn-phase1.md` | Runtime registry card dispatch to sandbox |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKBENCH CONTROL PLANE                    │
│                                                              │
│  Runtime Registry Cards (permissions, allowed_actions)       │
│         ↓                                                    │
│  Decision Packet (task spec, evidence gates, memory refs)    │
│         ↓                                                    │
│  Goal Mode v2 Dispatch (dedupe, cooldown, archive)           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                VERCEL EXECUTION LAYER (MIT)                  │
│                                                              │
│  Web UI (session, auth, chat, streaming)                     │
│         ↓                                                    │
│  Agent Workflow (Workflow SDK — durable, resumable)          │
│         │                                                    │
│         ├── AI SDK (unified model interface)                 │
│         ├── AI Gateway (routing, fallback, rate limiting)     │
│         └── Tools: file ops, search, shell, task delegation  │
│         ↓                                                    │
│  Sandbox VM (isolated, ephemeral, snapshot-restorable)       │
│    ├── Filesystem + Git branch                               │
│    ├── Shell + Package managers                              │
│    ├── Pluggable agents (OpenAI SDK, deepsec, Capy-style)   │
│    └── Auto-commit, auto-PR (preference-driven)             │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                WORKBENCH EVIDENCE LAYER                       │
│                                                              │
│  Sandbox Run Record → Evidence Review → Verdict (PASS/FLAG/BLOCK) │
│         ↓                                                    │
│  ActiveMemoryPacket (cross-sandbox context persistence)      │
│         ↓                                                    │
│  Fleet Runtime Panel (observability, health, drift)          │
└─────────────────────────────────────────────────────────────┘
```

## The Key Architectural Decision

**"The agent is NOT the sandbox."** — Vercel Open Agents, Capy Captain/Build, and
our Workbench Runtime Card model all converge on the same principle:

| Concern | Owns | Must NOT |
|---------|------|----------|
| **Agent (outside sandbox)** | Reasoning, orchestration, tool selection, model routing | Filesystem access, shell execution, git mutation |
| **Sandbox VM (inside)** | Filesystem, shell, git, dependencies, dev servers, ports | Permission decisions, evidence policy, memory |
| **Workbench (above both)** | Registry cards, decision packets, evidence gates, fleet health | Sandbox lifecycle, model token processing, workflow steps |

This separation means:
- Agent execution is not tied to a single request lifecycle
- Sandbox lifecycle can hibernate and resume independently
- Model/provider choices and sandbox implementation can evolve separately
- Permissions come from Workbench cards, never from sandbox state or SDK traces

## Capability Matrix

| Capability | Provides | Integrated Via |
|------------|----------|---------------|
| Sandbox execution | Vercel Sandbox (microVM) | `runtime-registry/` card + sandbox manifest |
| Model routing | Vercel AI Gateway | `action_payload.provider` + `model` in registry card |
| Durable workflow | Vercel Workflow SDK | `run-finalization-reconciliation-lane.md` finalization step |
| Code review (Capy style) | Workbench `auto-review-sweeper` | PR creation event → auto-review trigger |
| Security scanning (deepsec style) | deepsec CLI inside sandbox | Sandbox capability: `["Shell", "Filesystem", "SecurityScan"]` |
| OpenAI Agents SDK | Sandbox agent harness | `capabilities: ["Shell", "Filesystem", "Skills"]` per spike contract |
| Permission gating | Workbench Runtime Registry Card | `permissions.shell`, `.remote_mutation`, `.provider_writeback` |
| Evidence verification | Workbench `verification-harness` | Sandbox run record → evidence review → verdict |
| Cross-session memory | Workbench `ActiveMemoryPacket` | `memory_policy: workbench-only` (SDK memory disabled) |
| Fleet visibility | Workbench Runtime Panel | Per-card live evidence + sandbox health |

## Minimum Integration Contract

Every sandbox run must produce:

```yaml
WORKBENCH_SANDBOX_RUN_RECORD:
  workbench_card_id: "<runtime_id from registry card>"
  workbench_issue_id: "<if applicable>"
  sandbox_provider: "vercel-sandbox | unix-local | docker | openai-agents-sdk"
  sandbox_session_ref: "<redacted pointer>"
  sandbox_snapshot_ref: "<redacted pointer or none>"
  workflow_run_ref: "<Workflow SDK run id or none>"
  model_id: "<model used>"
  gateway_provider_ref: "<AI Gateway route or none>"
  capabilities_used: ["Shell", "Filesystem", "Skills", "SecurityScan"]
  artifact_manifest: ["output/report.md", "output/patch.diff"]
  auto_commit: true | false
  auto_pr: true | false
  pr_number: "<if auto_pr>"
  finalization_state: "completed | failed | needs_reconcile"
  telemetry:
    sandbox_uptime_ms: "<number | unavailable>"
    workflow_step_count: "<number | unavailable>"
    cost_in_usd_cents: "<number | unavailable>"
  verdict: "PASS | FLAG | BLOCK"
  evidence_gate: "<verification_harness reference>"
```

## Three Execution Backends (via Registry Card `execution_provider`)

```yaml
# Backend 1: Vercel Sandbox (primary, cloud)
runtime_backend:
  execution_provider: "vercel-sandbox"
  sandbox_config:
    base_snapshot_id: "<VERCEL_SANDBOX_BASE_SNAPSHOT_ID>"
    exposed_ports: [3000, 5173, 4321, 8000]
    hibernate_after_inactivity_seconds: 300
    auto_commit: preference-driven
    auto_pr: preference-driven

# Backend 2: OpenAI Agents SDK Sandbox (local/Docker spike)
runtime_backend:
  execution_provider: "openai-agents-sandbox"
  sandbox_config:
    provider: "unix-local | docker"
    manifest_path: "<workspace-relative>"
    capabilities: ["Shell", "Filesystem", "Skills"]
    sdk_memory_policy: "disabled"

# Backend 3: Windburn Workhorse (existing SSH-based)
runtime_backend:
  execution_provider: "windburn-workhorse-ssh"
  sandbox_config:
    host_env_ref: "HERMES_DROPLET_HOST"
    evidence_host_env: "WINDBURN_REMOTE_HOST"
    ssh_timeout: 5
```

The Runtime Panel reads `execution_provider` from the card and displays the
appropriate backend without caring which one is active.

## Deepsec Integration

deepsec runs as a **sandbox capability**, not a separate service:

```yaml
capabilities: ["Shell", "Filesystem", "SecurityScan"]
security_scan:
  tool: "deepsec"
  source: "github.com/vercel-labs/deepsec"
  trigger: "post-commit | pre-pr | scheduled"
  scope: "diff-only | full-repo"
  agent_model: "<model for multi-agent validation>"
```

The security scan result lands in the `WORKBENCH_SANDBOX_RUN_RECORD` as an
artifact, reviewed by the same evidence gate.

## Capy Review Integration

Capy-style auto-review maps to Workbench `auto-review-sweeper`:

1. Sandbox completes → auto-commit + auto-PR
2. PR creation event fires → `auto-review-sweeper` triggers
3. Review agent (outside sandbox, read-only) inspects PR
4. Review verdict (PASS/FLAG/BLOCK) lands on PR
5. If FLAG → Captain/supervisor decision
6. If PASS → merge gate opens

This is the same loop Capy describes in their GA announcement, but gated by
Workbench evidence policy rather than Capy's built-in review agent.

## Runtime Panel Extension

The existing `scripts/runtime-panel.sh` already reads registry cards and fuses
live evidence. The extension adds a `runtime_backend` schema field:

```yaml
runtime_backend:
  execution_provider: "vercel-sandbox | openai-agents-sandbox | windburn-workhorse-ssh"
  sandbox_session_ref: "<redacted>"
  snapshot_ref: "<redacted>"
  workflow_run_ref: "<id or none>"
  sandbox_resumable: true | false
  artifact_manifest: ["..."]
  cost_in_usd_cents: "<number or unavailable>"
  permission_source: "workbench-registry-card"
```

The Runtime Panel must not infer permission from sandbox state or SDK traces.

## PASS Criteria

- Vercel Open Agents deployed and sandbox smoke-tested
- One registry card dispatches to Vercel Sandbox backend
- One registry card dispatches to OpenAI Agents SDK backend (local/Docker)
- One registry card dispatches to Windburn Workhorse (SSH, existing)
- `WORKBENCH_SANDBOX_RUN_RECORD` produced for each backend
- Runtime Panel displays all three backends without caring which is active
- deepsec capability smoke-tested inside one sandbox
- `auto-review-sweeper` triggers on sandbox-produced PR
- No secrets, raw traces, raw transcripts, or private URLs committed
- SDK memory disabled; ActiveMemoryPacket remains authority for behavior memory
- All evidence gates produce PASS/FLAG/BLOCK with reviewable artifacts

## Deferred Work

- Hosted provider shopping (E2B, Modal, Daytona, Blaxel)
- Automatic trace ingestion into Runtime Panel UI
- Cross-provider benchmark claims
- Production secrets handling for Vercel OAuth + GitHub App
- ElevenLabs voice input integration
- ActiveMemoryPacket auto-ingestion from sandbox run records
