# Hermes OpenAI Sandbox Adapter Spike

## Goal

Build or review the smallest OpenAI Agents SDK sandbox adapter for one bounded
Hermes-style worker run.

This is an adapter spike. Do not replace Hermes, mutate live Multica runtime
state, or build a new fleet dashboard.

## Context

- Lane: `docs/hermes-openai-sandbox-adapter-lane.md`
- Run lifecycle: `docs/run-finalization-reconciliation-lane.md`
- Speed-match posture: `docs/super-engineering-speed-match-lane.md`
- Official OpenAI sandbox docs: `https://developers.openai.com/api/docs/guides/agents/sandboxes`
- Official OpenAI tools docs: `https://developers.openai.com/api/docs/guides/tools#usage-in-the-agents-sdk`

## SDD Stage Card

```text
SDD_STAGE: Technical Design
OWNER: <assigned agent>
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE: docs/hermes-openai-sandbox-adapter-lane.md, docs/run-finalization-reconciliation-lane.md
HANDOFF_SUMMARY: Prove one Hermes-style worker can run through OpenAI Agents SDK sandbox without changing the Workbench control plane.
SCOPED_EVIDENCE: adapter files, smoke fixture, output manifest, docs listed above
ANTI_OVER_READ: Do not inspect unrelated issue history, raw run transcripts, private runtime config, or unrelated Hermes internals.
```

## Required Contract

```yaml
HERMES_OPENAI_SANDBOX_ADAPTER:
  purpose: "<one bounded worker task>"
  hermes_surface: "research | docs-sync | code-review | repo-worker | other"
  provider: "unix-local | docker"
  model_id: "gpt-5.5 | <official OpenAI model id>"
  manifest_entries:
    repo: "<workspace-relative repo path or GitRepo source>"
    task_file: "<workspace-relative task spec>"
    output_dir: "<workspace-relative output directory>"
    instructions_files: ["AGENTS.md"]
    skills_source: "<none | LocalDir | LocalDirLazySkillSource | GitRepo>"
  capabilities: ["Shell", "Filesystem", "Skills"]
  sdk_memory_policy: "disabled"
  secrets_policy: "none | provider-injected-env-only"
  trace_policy: "record workflow name and trace reference only"
  artifact_policy: "summaries-and-output-manifest-only"
  finalization_mapping: "produce HERMES_SANDBOX_RUN_RECORD"
  validation_command: "<exact command>"
```

## Implementation Steps

1. Re-check the official OpenAI sandbox docs before coding.
2. Confirm sandbox agents are still Python SDK only. If that changed, name the
   updated doc evidence.
3. Create the smallest adapter or fixture needed for one local `unix-local` or
   Docker run.
4. Stage task inputs through a manifest, not prompt-pasted local paths.
5. Enable only `Shell`, `Filesystem`, and `Skills` capabilities.
6. Keep SDK memory disabled.
7. Emit `HERMES_SANDBOX_RUN_RECORD`.
8. Run the validation command.
9. Report residual risk and which follow-up belongs to Workbench.

## Verification Commands

Use the commands that match the implementation:

```bash
python -m py_compile <adapter-file>.py
python <adapter-file>.py --fixture <fixture-name> --dry-run
git diff --check
```

If the real SDK smoke cannot run because credentials, package installation, or
provider setup is missing, return `FLAG` with the exact missing prerequisite.
Do not fake a pass from static checks alone.

## Required Closeout

```yaml
HERMES_SANDBOX_RUN_RECORD:
  hermes_run_id: "<if applicable>"
  workbench_issue_id: "<if applicable>"
  sdk_workflow_name: "<name>"
  sandbox_provider: "unix-local | docker"
  sandbox_session_ref: "<redacted pointer or none>"
  snapshot_ref: "<redacted pointer or none>"
  trace_ref: "<redacted URL/id or none>"
  artifact_manifest: ["output/report.md"]
  finalization_state: "completed | failed | needs_reconcile"
  telemetry:
    input_tokens: "<number | unavailable>"
    cache_read_tokens: "<number | unavailable>"
    output_tokens: "<number | unavailable>"
    wall_clock_ms: "<number | unavailable>"
    tool_call_count: "<number | unavailable>"
  residual_risk: "<one sentence>"
  VERDICT: "PASS | FLAG | BLOCK"
```

## PASS Criteria

- Adapter run is bounded to one worker task.
- Manifest paths are workspace-relative.
- No secrets, raw traces, raw transcripts, private URLs, or local absolute paths
  are committed.
- SDK memory remains disabled.
- The run record is produced and reviewable.
- Any Runtime Panel change is schema/read-only first.
