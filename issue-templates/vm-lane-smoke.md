# VM Lane Smoke Issue Template

## Goal

Verify that the Capy VM Lane can start a disposable desktop, take a screenshot through the Computer API, save artifacts, and tear down cleanly.

## Context

- Repo: `/Users/0xvox/multica-ultimate-workbench`
- Script: `scripts/vm-smoke.sh`
- Design doc: `docs/capy-vm-lane.md`
- Execution target: `capy-vm`

## SDD Stage Card

```text
SDD_STAGE: Technical Design
OWNER: Workbench VM Runner
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE: docs/capy-vm-lane.md, scripts/vm-smoke.sh
HANDOFF_SUMMARY: Start a disposable Scrapybara-compatible Computer container, request one screenshot, save artifacts, and destroy unless CAPY_VM_KEEP=yes.
SCOPED_EVIDENCE: docs/capy-vm-lane.md, scripts/vm-smoke.sh
ANTI_OVER_READ: Do not inspect unrelated issue history, full agent roster, or Multica runtime config for this smoke.
```

## Execution Contract

```yaml
EXECUTION_TARGET: capy-vm
VM_LEASE:
  owner_issue_id: "<issue id>"
  owner_agent: "Workbench VM Runner"
  image: "scrapybara-computer"
  ttl_minutes: 20
  network_policy: "localhost-only"
  secrets_policy: "none"
  artifact_dir: "artifacts/capy-vm-smoke/<timestamp>"
ARTIFACTS_REQUIRED:
  - response.json
  - screenshot.png
  - RUN_DIGEST.md
TEARDOWN: destroy
```

## Verification Commands

```bash
cd /Users/0xvox/multica-ultimate-workbench
bash -n scripts/vm-smoke.sh
SCRAPYBARA_OSS_DIR=/tmp/scrapybara-oss-inspect CAPY_VM_KEEP=no ./scripts/vm-smoke.sh
```

## PASS Criteria

- `bash -n` passes.
- The smoke command exits 0.
- Artifact directory contains `response.json`, `screenshot.png`, and `RUN_DIGEST.md`.
- `RUN_DIGEST.md` reports the container name, API port, noVNC URL, teardown mode, and artifact paths.
- No secrets were entered or captured.
