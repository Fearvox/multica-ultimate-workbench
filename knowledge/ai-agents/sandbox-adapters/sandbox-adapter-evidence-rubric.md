# Sandbox Adapter Evidence Rubric

Grounded from [DAS-1649](mention://issue/76bed5e0-6bb5-4313-b1e0-b625fd4e8d45) adapter spike.
Applies to any Hermes OpenAI Agents SDK sandbox adapter spike.

## Overview

This rubric defines PASS / FLAG / BLOCK criteria for sandbox adapter spikes. Each criterion maps to a specific validation gate that must be satisfied for the adapter to advance.

## Evidence Gates

### G1: py_compile (static)

**Command:**
```bash
python3 -m py_compile <adapter-file>.py
```

| Verdict | Condition |
|---------|-----------|
| PASS | Compiles without errors |
| BLOCK | Compilation fails (syntax error, import error) |

No FLAG is possible at this gate — the adapter must be syntactically valid or it is blocked.

### G2: Fixture Smoke (functional)

**Command:**
```bash
python3 <adapter-file>.py --fixture <fixture-name> --backend unix-local --dry-run
```

| Verdict | Condition |
|---------|-----------|
| PASS | Smoke completes, produces `adapter-manifest.json` + `HERMES_SANDBOX_RUN_RECORD.json` |
| FLAG | Smoke completes but one or more output artifacts are missing or malformed |
| BLOCK | Smoke fails with a runtime error |

Expected outputs from smoke:
- `output/smoke/adapter-manifest.json` — valid manifest per contract
- `output/smoke/HERMES_SANDBOX_RUN_RECORD.json` — valid run record per schema
- `output/smoke/report.md` — human-readable summary
- `output/smoke/session_workspace/output/report.md` — worker output

### G3: Run Record Emission (output contract)

| Verdict | Condition |
|---------|-----------|
| PASS | `HERMES_SANDBOX_RUN_RECORD.json` is valid JSON, all required fields present, `finalization_state` is `"completed"` |
| FLAG | Record emitted but missing non-critical fields or token telemetry is `"unavailable"` |
| BLOCK | Record missing, not valid JSON, or `finalization_state` is not `"completed"` |

Required fields in run record:
- `hermes_run_id`
- `workbench_issue_id`
- `sdk_workflow_name`
- `sandbox_provider`
- `sandbox_session_ref`
- `artifact_manifest` (non-empty array)
- `finalization_state`
- `telemetry.wall_clock_ms`
- `telemetry.tool_call_count`
- `residual_risk`
- `VERDICT`

### G4: Manifest Contract (static analysis)

| Verdict | Condition |
|---------|-----------|
| PASS | Manifest passes `validate_manifest()` — capabilities are exactly `["Shell","Filesystem","Skills"]`, `sdk_memory_policy` is `"disabled"`, all paths are workspace-relative, no secrets in JSON |
| FLAG | Manifest is valid JSON but one or more policy fields are non-canonical (e.g. extra capability, memory policy not explicitly `"disabled"`) |
| BLOCK | Manifest fails public-safety check (absolute paths, secrets, forbidden tokens in JSON) |

### G5: Live SDK Validation Gate (integration)

| Verdict | Condition |
|---------|-----------|
| PASS | Adapter successfully provisions an OpenAI Agents SDK sandbox session, executes a bounded worker task, and emits a run record with live token telemetry |
| FLAG | Live SDK sandbox is **not available** in the runtime (`openai` package absent); dry-run fixture passes G1-G4; `residual_risk` documents the gap |
| BLOCK | Live SDK sandbox is available but execution fails (auth, quota, SDK API error) |

In dry-run mode (SDK package absent), G5 automatically resolves to FLAG and the adapter does not proceed to PASS. This is by design — the spike proves the adapter contract shape without incurring provider costs.

## Composite Verdict

| G1 | G2 | G3 | G4 | G5 | Composite |
|----|----|----|----|----|-----------|
| PASS | PASS | PASS | PASS | PASS | **PASS** |
| PASS | PASS | PASS | PASS | FLAG | **FLAG** (dry-run ceiling) |
| PASS | FLAG | PASS | PASS | — | **FLAG** |
| — | — | — | — | BLOCK | **BLOCK** |
| BLOCK | — | — | — | — | **BLOCK** |

Any BLOCK at any gate yields a composite BLOCK verdict.

## DAS-1649 Application

DAS-1649 produced:
- G1: **PASS** — `hermes_openai_sandbox_adapter.py` compiles clean
- G2: **PASS** — dry-run smoke produces all expected artifacts
- G3: **PASS** — run record is valid JSON with all required fields
- G4: **PASS** — manifest passes validation, capabilities are correct, no secrets
- G5: **FLAG** — live OpenAI SDK sandbox was not invoked; `openai` package absent from runtime; `residual_risk` documented
- Composite: **FLAG** (dry-run ceiling)

## Cross-References

- Adapter contract: `knowledge/ai-agents/sandbox-adapters/hermes-openai-sandbox-adapter-contract.md`
- Implementation: `prototypes/hermes-openai-sandbox-adapter/`
- Parent spike: [DAS-1649](mention://issue/76bed5e0-6bb5-4313-b1e0-b625fd4e8d45)
