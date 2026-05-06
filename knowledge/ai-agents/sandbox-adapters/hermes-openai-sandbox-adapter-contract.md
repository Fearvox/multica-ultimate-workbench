# Hermes OpenAI Sandbox Adapter Contract

Grounded from [DAS-1649](mention://issue/76bed5e0-6bb5-4313-b1e0-b625fd4e8d45) adapter spike.
Canonical implementation: `prototypes/hermes-openai-sandbox-adapter/hermes_openai_sandbox_adapter.py`.

## Purpose

Prove one Hermes-style worker can execute through an OpenAI Agents SDK sandbox without changing the Workbench control plane. The adapter runs one bounded worker task, gates to a safe capability set, and emits a public-safe run record.

## Adapter Manifest Structure

The adapter produces a manifest at `output/smoke/adapter-manifest.json` with the following shape:

```json
{
  "HERMES_OPENAI_SANDBOX_ADAPTER": {
    "purpose": "<one-line task description>",
    "hermes_surface": "research",
    "provider": "<unix-local | docker | sdk-sandbox>",
    "model_id": "<model identifier>",
    "manifest_entries": {
      "repo": "<workspace-relative path to staged repo>",
      "task_file": "<workspace-relative path to task/task.md>",
      "output_dir": "<workspace-relative path for output artifacts>",
      "instructions_files": ["<workspace-relative path to instructions/AGENTS.md>"],
      "skills_source": "<workspace-relative path to skills directory>"
    },
    "capabilities": ["Shell", "Filesystem", "Skills"],
    "sdk_memory_policy": "disabled",
    "secrets_policy": "none",
    "trace_policy": "record workflow name and trace reference only",
    "artifact_policy": "summaries-and-output-manifest-only",
    "finalization_mapping": "produce HERMES_SANDBOX_RUN_RECORD",
    "validation_command": "<CLI invocation for smoke validation>"
  }
}
```

### Manifest Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `purpose` | string | yes | One-line task description (e.g. "one bounded Hermes-style research-summary worker task") |
| `hermes_surface` | string | yes | Hermes surface classification — currently always `"research"` |
| `provider` | string | yes | Sandbox backend: `"unix-local"`, `"docker"`, or `"sdk-sandbox"` |
| `model_id` | string | yes | Target model identifier (e.g. `"gpt-5.5"`) |
| `manifest_entries.repo` | string | yes | Workspace-relative path to staged repository source |
| `manifest_entries.task_file` | string | yes | Workspace-relative path to the worker task definition (`task.md`) |
| `manifest_entries.output_dir` | string | yes | Workspace-relative path where output artifacts are written |
| `manifest_entries.instructions_files` | string[] | yes | Workspace-relative paths to agent instruction files (typically `AGENTS.md`) |
| `manifest_entries.skills_source` | string | yes | Workspace-relative path to staged skills directory |
| `capabilities` | string[] | yes | **Must be exactly `["Shell", "Filesystem", "Skills"]`** — validated at manifest build time |
| `sdk_memory_policy` | string | yes | **Must be `"disabled"`** — validated at manifest build time |
| `secrets_policy` | string | yes | Always `"none"` — no secrets injected into sandbox |
| `trace_policy` | string | yes | Governs what tracing metadata is emitted |
| `artifact_policy` | string | yes | Governs artifact inclusion in output |
| `finalization_mapping` | string | yes | Always `"produce HERMES_SANDBOX_RUN_RECORD"` |
| `validation_command` | string | yes | CLI command to re-execute the smoke fixture |

## Capability Whitelist

The adapter gates capabilities to exactly three:

1. **Shell** — subprocess execution bounded to the sandbox workspace
2. **Filesystem** — read/write within the staged workspace only
3. **Skills** — access staged skills directory via manifest, not prompt-pasted

Network, memory, and secrets capabilities are explicitly excluded:
- `sdk_memory_policy: "disabled"` — SDK memory is not used
- `secrets_policy: "none"` — no API keys, tokens, or credentials injected
- `trace_policy` — only workflow name and trace reference, no raw transcript

## Workspace-Relative Path Contract

All paths in the manifest **must** be:
- **Workspace-relative** — computed via `path.relative_to(repo_root).as_posix()`
- **POSIX-formatted** — forward slashes only
- **Public-safe** — no absolute paths, no `file://` URIs, no local filesystem leaks

### Rejection Rules

The `validate_manifest()` function enforces these invariants:
- Paths outside the workspace root → `ValueError`
- Paths starting with `/` or containing `://` → `ValueError`
- Manifest JSON containing `"/root/"`, `"file://"`, `"Bearer "`, or `"OPENAI_API_KEY="` → `ValueError`

## HERMES_SANDBOX_RUN_RECORD Schema

After execution, the adapter emits `output/smoke/HERMES_SANDBOX_RUN_RECORD.json`:

```json
{
  "HERMES_SANDBOX_RUN_RECORD": {
    "hermes_run_id": "<string, \"none\" for dry-run>",
    "workbench_issue_id": "<UUID of the parent workbench issue>",
    "sdk_workflow_name": "hermes-openai-sandbox-adapter-spike",
    "sandbox_provider": "<unix-local | docker | sdk-sandbox>",
    "sandbox_session_ref": "<\"none\" for dry-run, else redacted ref>",
    "snapshot_ref": "<string for commit/tag, \"none\" if not applicable>",
    "trace_ref": "<trace system reference, \"none\" if not emitted>",
    "artifact_manifest": ["<workspace-relative paths to output artifacts>"],
    "finalization_state": "completed",
    "telemetry": {
      "input_tokens": "<integer | \"unavailable\">",
      "cache_read_tokens": "<integer | \"unavailable\">",
      "output_tokens": "<integer | \"unavailable\">",
      "wall_clock_ms": "<integer>",
      "tool_call_count": "<integer>"
    },
    "residual_risk": "<human-readable risk description>",
    "VERDICT": "PASS | FLAG | BLOCK"
  }
}
```

### Record Fields

| Field | Type | Description |
|-------|------|-------------|
| `hermes_run_id` | string | Hermes run identifier; `"none"` for dry-run |
| `workbench_issue_id` | string | UUID of the parent issue (DAS-1649 → `76bed5e0-...`) |
| `sdk_workflow_name` | string | Workflow identifier (`"hermes-openai-sandbox-adapter-spike"`) |
| `sandbox_provider` | string | Backend used for this execution |
| `sandbox_session_ref` | string | Session reference; `"none"` for dry-run, redacted for live SDK |
| `snapshot_ref` | string | Snapshot/commit reference or `"none"` |
| `trace_ref` | string | Trace system reference or `"none"` |
| `artifact_manifest` | string[] | Workspace-relative paths to all output artifacts |
| `finalization_state` | string | Always `"completed"` on successful adapter run |
| `telemetry.input_tokens` | number\|string | Input token count or `"unavailable"` |
| `telemetry.cache_read_tokens` | number\|string | Cache read token count or `"unavailable"` |
| `telemetry.output_tokens` | number\|string | Output token count or `"unavailable"` |
| `telemetry.wall_clock_ms` | number | Wall-clock duration in milliseconds |
| `telemetry.tool_call_count` | number | Number of tool calls executed |
| `residual_risk` | string | Human-readable risk assessment for supervisor review |
| `VERDICT` | string | `"PASS"` \| `"FLAG"` \| `"BLOCK"` (see evidence rubric) |

## Dry-Run Mode

When `--dry-run` is passed:
- No live SDK session is initiated
- The adapter executes a deterministic unix-local worker subprocess
- `sandbox_session_ref` is set to `"none"`
- Token telemetry is set to `"unavailable"`
- `VERDICT` is `"FLAG"` (not `"PASS"`)
- `residual_risk` documents why live SDK execution was deferred

## Cross-References

- Parent spike: [DAS-1649](mention://issue/76bed5e0-6bb5-4313-b1e0-b625fd4e8d45)
- Implementation: `prototypes/hermes-openai-sandbox-adapter/`
- LANE doc: `docs/hermes-openai-sandbox-adapter-lane.md` (if created)
- Evidence rubric: `knowledge/ai-agents/sandbox-adapters/sandbox-adapter-evidence-rubric.md`
