# Capy VM Lane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a controlled VM/Computer execution lane to Multica Ultimate Workbench so agents can run GUI/browser/sandbox work in isolated desktops while Multica remains the source of routing, review, and evidence.

**Architecture:** Multica keeps issue routing, SDD comments, review gates, skills, and agent ownership. The new Capy VM Lane is a capability lane: an assigned agent can request a time-limited VM lease, drive it through a local Computer API, save screenshots/logs/artifacts, and report evidence back to the issue. The first implementation is local and conservative: docs, templates, a VM Runner agent source file, a workspace skill, and one Docker smoke script using the Scrapybara OSS Computer API shape.

**Tech Stack:** Markdown, Bash, Docker, curl, jq, Python 3 for base64 decoding, Multica CLI, Scrapybara OSS Computer API concepts.

---

## File Structure

- Create: `/Users/0xvox/multica-ultimate-workbench/docs/capy-vm-lane.md`
  - Durable design contract for the VM lane, lease model, security boundaries, artifact rules, and teardown rules.
- Modify: `/Users/0xvox/multica-ultimate-workbench/issue-templates/sdd-workflow.md`
  - Add `EXECUTION_TARGET`, `VM_LEASE`, `ARTIFACTS_REQUIRED`, and `TEARDOWN` fields to the Technical Design and Task List stages.
- Create: `/Users/0xvox/multica-ultimate-workbench/issue-templates/vm-lane-smoke.md`
  - Issue template for a bounded VM lane smoke run.
- Create: `/Users/0xvox/multica-ultimate-workbench/agents/outer/workbench-vm-runner.md`
  - Agent instructions for running VM lane tasks without taking over routing or review.
- Modify: `/Users/0xvox/multica-ultimate-workbench/agents/AGENT_ROSTER.md`
  - Add `Workbench VM Runner` as an Outer Ring agent with low concurrency.
- Create: `/Users/0xvox/multica-ultimate-workbench/skills/workbench-capy-vm-lane.md`
  - Workspace skill for lease discipline, Computer API usage, artifacts, and teardown.
- Modify: `/Users/0xvox/multica-ultimate-workbench/skills/README.md`
  - Add the new skill to the Core Pack and attachment map.
- Create: `/Users/0xvox/multica-ultimate-workbench/scripts/vm-smoke.sh`
  - Local smoke script that builds/runs a Scrapybara-compatible Computer container, requests a screenshot, saves artifacts, and tears down unless explicitly kept.
- Modify: `/Users/0xvox/multica-ultimate-workbench/README.md`
  - Add a short Capy VM Lane section and link to the new doc.
- Modify: `/Users/0xvox/multica-ultimate-workbench/WORKBENCH_LOG.md`
  - Record the rollout after verification.
- Modify: `/Users/0xvox/multica-ultimate-workbench/DECISIONS.md`
  - Record the decision that VM sessions are capability leases, not autonomous schedulers.

## System Boundaries

- Multica remains the live collaboration layer.
- The VM lane does not replace agents, issues, SDD, or Supervisor review.
- VM sessions are execution cells owned by a specific issue and agent.
- No secrets are injected into a VM by default.
- VM artifacts are evidence, not private memory.
- The first pass must not modify Multica Desktop, daemon, core runtime, or existing live agents without explicit human approval.
- `Workbench Max` remains preserved and untouched.

## Acceptance Criteria

- The repo documents exactly when to use `local-worktree`, `agent-cli`, `capy-vm`, or `human-desktop`.
- SDD templates force VM tasks to declare lease, artifact, teardown, and security policies before execution.
- `scripts/vm-smoke.sh` passes `bash -n`.
- If Docker is available and Scrapybara OSS is present, `scripts/vm-smoke.sh` creates a response JSON, screenshot PNG, and digest under `artifacts/capy-vm-smoke/`.
- The VM Runner agent has strict routing boundaries and cannot self-assign work.
- The new skill is compact enough to attach only to VM-related agents/reviewers.
- README links the lane without making it sound like Multica replacement infrastructure.
- `git diff --check` passes.

## Task 1: Add Capy VM Lane Design Doc

**Files:**
- Create: `/Users/0xvox/multica-ultimate-workbench/docs/capy-vm-lane.md`

- [ ] **Step 1: Create the design doc**

Create the file with this content:

```markdown
# Capy VM Lane

The Capy VM Lane is a controlled execution lane for tasks that need a real GUI, browser, desktop automation, or disposable sandbox. It is not a scheduler, not a replacement for Multica, and not a new source of truth.

## Role In The Workbench

Multica owns routing, issue state, comments, agent assignment, skills, and review. The VM lane owns only an execution cell for a bounded task. A VM cell is leased by one issue, one owner agent, and one stated purpose.

## When To Use It

Use `capy-vm` when a task needs one of these:

- GUI or browser interaction that cannot be verified by static repo checks.
- Third-party app workflows such as Discord, GitHub web UI, OAuth login, or dashboard inspection.
- Isolated package smoke tests where local machine state should stay clean.
- Visual proof artifacts such as screenshots, noVNC recordings, or action transcripts.
- Burn-in style stability checks where repeated actions need a disposable desktop.

Do not use `capy-vm` for ordinary code edits, normal test runs, markdown-only updates, or repository inspections that work through shell commands.

## Execution Targets

| Target | Use for | Owner |
| --- | --- | --- |
| `local-worktree` | normal repo edits, tests, scripts | assigned implementation agent |
| `agent-cli` | Codex, Claude Code, Hermes, or other CLI-native work | assigned runtime agent |
| `capy-vm` | GUI/browser/sandbox execution | Workbench VM Runner or assigned QA agent |
| `human-desktop` | actions requiring human credentials, taste, or approval | human operator |

## VM Lease Contract

Every VM task must declare:

```yaml
EXECUTION_TARGET: capy-vm
VM_LEASE:
  owner_issue_id: "<Multica issue id>"
  owner_agent: "Workbench VM Runner"
  image: "scrapybara-computer"
  ttl_minutes: 60
  network_policy: "default-deny-plus-explicit-targets"
  secrets_policy: "none"
  artifact_dir: "artifacts/capy-vm-smoke/<timestamp>"
ARTIFACTS_REQUIRED:
  - action_transcript
  - screenshot
  - command_log
TEARDOWN: destroy
```

## Artifact Rules

Artifacts must be saved under `artifacts/` and summarized back into the issue. The summary must include exact paths, commands, exit codes, and residual risks. Screenshots must not include secrets, private tokens, OAuth codes, raw cookies, or unrelated personal content.

## Security Rules

- Default network policy is deny-by-default conceptually; any external target must be named in the task.
- Default secrets policy is `none`.
- Human-mediated login is allowed only when the human explicitly chooses that path.
- VM Runner must stop and report `BLOCKED` if a page requests credentials that were not approved.
- VM Runner must never copy cookies, tokens, OAuth codes, or API keys into issue comments.

## Teardown Rules

Use `destroy` by default. Use `snapshot` only when the issue explicitly asks for post-run inspection. Use `keep-for-review` only when the Supervisor needs live evidence and the VM has no secrets.

## Review Contract

Supervisor review checks:

1. The task declared `EXECUTION_TARGET: capy-vm`.
2. Lease fields were present before execution.
3. Required artifacts exist.
4. Commands and action transcript are enough to reproduce the run.
5. Teardown state is reported.
6. No secrets or unrelated private screen content are exposed.
```

- [ ] **Step 2: Verify the doc contains the required contract fields**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
rg -n "EXECUTION_TARGET|VM_LEASE|ARTIFACTS_REQUIRED|TEARDOWN|secrets_policy|network_policy" docs/capy-vm-lane.md
```

Expected: the command prints all contract terms.

- [ ] **Step 3: Commit Task 1**

```bash
cd /Users/0xvox/multica-ultimate-workbench
git add docs/capy-vm-lane.md
git commit -m "docs: define capy vm lane contract"
```

## Task 2: Extend SDD Templates For Execution Targets

**Files:**
- Modify: `/Users/0xvox/multica-ultimate-workbench/issue-templates/sdd-workflow.md`
- Create: `/Users/0xvox/multica-ultimate-workbench/issue-templates/vm-lane-smoke.md`

- [ ] **Step 1: Add execution-target fields to Technical Design**

In `issue-templates/sdd-workflow.md`, under the `## Technical Design` bullet list, replace:

```markdown
- Runtime owner:
- Data path:
- Files/resources to modify:
- Integration points:
- Risk surface:
- Verification approach:
```

with:

```markdown
- Runtime owner:
- Execution target: `local-worktree` / `agent-cli` / `capy-vm` / `human-desktop`
- Data path:
- Files/resources to modify:
- Integration points:
- VM lease, if `capy-vm`:
  - owner issue id:
  - owner agent:
  - image:
  - ttl minutes:
  - network policy:
  - secrets policy:
  - artifact dir:
- Risk surface:
- Verification approach:
```

- [ ] **Step 2: Add execution-target fields to Task List**

In `issue-templates/sdd-workflow.md`, under the `## Task List` bullet list, replace:

```markdown
- Tasks:
- Dependencies:
- Execution owner:
- Approval gates:
- Verification commands:
- Reporting format:
```

with:

```markdown
- Tasks:
- Dependencies:
- Execution owner:
- Execution target:
- Approval gates:
- Artifacts required:
- Teardown rule:
- Verification commands:
- Reporting format:
```

- [ ] **Step 3: Create a VM lane smoke issue template**

Create `issue-templates/vm-lane-smoke.md` with this content:

```markdown
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
```

- [ ] **Step 4: Verify template edits**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
rg -n "Execution target|VM lease|Artifacts required|Teardown rule|EXECUTION_TARGET|VM_LEASE" issue-templates
git diff --check
```

Expected: the new fields appear in `sdd-workflow.md` and `vm-lane-smoke.md`; `git diff --check` exits 0.

- [ ] **Step 5: Commit Task 2**

```bash
cd /Users/0xvox/multica-ultimate-workbench
git add issue-templates/sdd-workflow.md issue-templates/vm-lane-smoke.md
git commit -m "docs: add vm lane sdd templates"
```

## Task 3: Add VM Runner Agent Source

**Files:**
- Create: `/Users/0xvox/multica-ultimate-workbench/agents/outer/workbench-vm-runner.md`
- Modify: `/Users/0xvox/multica-ultimate-workbench/agents/AGENT_ROSTER.md`

- [ ] **Step 1: Create the VM Runner agent instructions**

Create `agents/outer/workbench-vm-runner.md` with this content:

```markdown
# Workbench VM Runner

Ring: Outer
Preferred runtime: Codex
Visibility: private
Default concurrency: 1

## Mission

Run bounded GUI/browser/sandbox tasks through the Capy VM Lane. You are an execution owner, not a conductor. Multica issues, SDD comments, and Supervisor review remain the source of truth.

## Activation

Run only when assigned to an issue or explicitly mentioned for a task that declares `EXECUTION_TARGET: capy-vm`.

## Required Read Order

1. The assigned issue's current SDD stage comment.
2. `docs/capy-vm-lane.md`.
3. `issue-templates/vm-lane-smoke.md` if this is a smoke run.
4. `scripts/vm-smoke.sh` if the task uses the local smoke path.

Do not read full issue history unless `SCOPED_EVIDENCE` requires it.

## Hard Boundaries

- Do not assign work to other agents.
- Do not edit Multica daemon, Desktop UI, core runtime, or unrelated repo files.
- Do not inject secrets unless the issue explicitly approves a human-mediated credential path.
- Do not copy cookies, OAuth codes, API keys, private tokens, or raw credential material into comments.
- Stop with `BLOCKED` if the page asks for credentials that were not approved.
- Destroy the VM by default unless the issue declares `TEARDOWN: snapshot` or `TEARDOWN: keep-for-review`.

## Execution Loop

1. Confirm `EXECUTION_TARGET: capy-vm`.
2. Confirm `VM_LEASE` has owner issue id, owner agent, image, ttl, network policy, secrets policy, and artifact dir.
3. Run only the commands named by the issue or the VM lane doc.
4. Save artifacts under `artifacts/`.
5. Report exact artifact paths, command exit codes, teardown state, and residual risk.

## Completion Report

Use this shape:

```text
VM_RUNNER_REPORT
Issue:
Execution target:
Lease:
Commands:
Artifacts:
Teardown:
Verification:
Residual risk:
VERDICT: PASS / FLAG / BLOCK
```
```

- [ ] **Step 2: Add VM Runner to the roster**

In `agents/AGENT_ROSTER.md`, add this row in the Outer Ring table after `QA Verifier`:

```markdown
| Workbench VM Runner | Outer | Codex | private | 1 | Assigned `capy-vm` issue |
```

Do not add `Workbench VM Runner` to the Preserved Special Bench table.

- [ ] **Step 3: Verify roster and instructions**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
rg -n "Workbench VM Runner|EXECUTION_TARGET: capy-vm|VM_RUNNER_REPORT" agents
git diff --check
```

Expected: all three phrases are present and `git diff --check` exits 0.

- [ ] **Step 4: Commit Task 3**

```bash
cd /Users/0xvox/multica-ultimate-workbench
git add agents/outer/workbench-vm-runner.md agents/AGENT_ROSTER.md
git commit -m "docs: add workbench vm runner agent"
```

## Task 4: Add Capy VM Lane Workspace Skill

**Files:**
- Create: `/Users/0xvox/multica-ultimate-workbench/skills/workbench-capy-vm-lane.md`
- Modify: `/Users/0xvox/multica-ultimate-workbench/skills/README.md`

- [ ] **Step 1: Create the skill source**

Create `skills/workbench-capy-vm-lane.md` with this content:

```markdown
---
name: workbench-capy-vm-lane
description: Controlled VM/Computer execution lane for GUI, browser, sandbox, and screenshot-backed tasks.
---

# Workbench Capy VM Lane

Use this skill only when an issue declares `EXECUTION_TARGET: capy-vm` or asks for isolated GUI/browser/sandbox execution.

## Required Checks

Before execution:

1. Confirm the issue has `VM_LEASE`.
2. Confirm `secrets_policy`.
3. Confirm `network_policy`.
4. Confirm `ARTIFACTS_REQUIRED`.
5. Confirm `TEARDOWN`.

If any field is missing, return `BLOCKED` with the smallest missing field list.

## Default Policy

- `secrets_policy: none`
- `network_policy: localhost-only` for smoke tests
- `TEARDOWN: destroy`
- artifact root: `artifacts/`

## Computer API Pattern

The local smoke path uses a Scrapybara-compatible Computer API:

```bash
curl -fsS -X POST "http://127.0.0.1:${CAPY_API_PORT}/computer" \
  -H "Content-Type: application/json" \
  -d '{"action":"take_screenshot"}'
```

The response must be saved before summarizing.

## Report Contract

Always report:

- issue id,
- owner agent,
- execution target,
- lease fields,
- commands and exit codes,
- artifact paths,
- teardown state,
- residual risks,
- `VERDICT: PASS / FLAG / BLOCK`.

Never paste base64 screenshots, raw cookies, OAuth codes, private tokens, API keys, or unrelated screen content into comments.
```

- [ ] **Step 2: Update the Core Pack table**

In `skills/README.md`, add this row to `## Core Pack` after `workbench-browser-proofshot-qa`:

```markdown
| `workbench-capy-vm-lane` | Controlled VM/Computer execution for GUI, browser, sandbox, screenshots, lease discipline, and teardown evidence. |
```

- [ ] **Step 3: Update the Attachment Map**

In `skills/README.md`, update these rows:

```markdown
| Workbench Supervisor | `workbench-review-qa`, `workbench-code-review`, `workbench-conductor`, `workbench-sdd`, `workbench-token-context-discipline`, `workbench-capy-vm-lane` |
| QA Verifier | `workbench-review-qa`, `workbench-browser-proofshot-qa`, `workbench-frontend-design-qa`, `workbench-code-review`, `workbench-capy-vm-lane` |
```

Add this new row after `QA Verifier`:

```markdown
| Workbench VM Runner | `workbench-capy-vm-lane`, `workbench-browser-proofshot-qa`, `workbench-token-context-discipline`, `workbench-review-qa` |
```

- [ ] **Step 4: Verify skill frontmatter and map**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
sed -n '1,20p' skills/workbench-capy-vm-lane.md
rg -n "workbench-capy-vm-lane|Workbench VM Runner" skills/README.md
git diff --check
```

Expected: YAML frontmatter includes `name` and `description`; skill map references the new skill and VM Runner.

- [ ] **Step 5: Commit Task 4**

```bash
cd /Users/0xvox/multica-ultimate-workbench
git add skills/workbench-capy-vm-lane.md skills/README.md
git commit -m "docs: add capy vm lane skill"
```

## Task 5: Add Local VM Smoke Script

**Files:**
- Create: `/Users/0xvox/multica-ultimate-workbench/scripts/vm-smoke.sh`

- [ ] **Step 1: Create the script**

Create `scripts/vm-smoke.sh` with this content:

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/0xvox/multica-ultimate-workbench"
SCRAPYBARA_OSS_DIR="${SCRAPYBARA_OSS_DIR:-/tmp/scrapybara-oss-inspect}"
IMAGE="${CAPY_COMPUTER_IMAGE:-scrapybara-computer}"
CONTAINER_NAME="${CAPY_VM_CONTAINER_NAME:-workbench-capy-vm-smoke}"
CAPY_API_PORT="${CAPY_API_PORT:-18000}"
CAPY_VNC_PORT="${CAPY_VNC_PORT:-15900}"
CAPY_NOVNC_PORT="${CAPY_NOVNC_PORT:-16091}"
CAPY_WIDTH="${CAPY_WIDTH:-1024}"
CAPY_HEIGHT="${CAPY_HEIGHT:-768}"
CAPY_VM_KEEP="${CAPY_VM_KEEP:-no}"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
ARTIFACT_DIR="${CAPY_VM_ARTIFACT_DIR:-$ROOT/artifacts/capy-vm-smoke/$RUN_ID}"

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "MISSING: $1" >&2
    exit 2
  fi
}

cleanup() {
  if [[ "$CAPY_VM_KEEP" == "yes" ]]; then
    return 0
  fi
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}

wait_for_api() {
  local url="http://127.0.0.1:${CAPY_API_PORT}/openapi.json"
  for _ in $(seq 1 40); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "Computer API did not become ready: $url" >&2
  return 1
}

decode_screenshot() {
  local response_file="$1"
  local png_file="$2"
  python3 - "$response_file" "$png_file" <<'PY'
import base64
import json
import sys

response_path, png_path = sys.argv[1], sys.argv[2]
with open(response_path, "r", encoding="utf-8") as f:
    payload = json.load(f)

image = payload.get("base64_image")
if not image:
    raise SystemExit("response did not include base64_image")

with open(png_path, "wb") as f:
    f.write(base64.b64decode(image))
PY
}

main() {
  need docker
  need curl
  need python3

  mkdir -p "$ARTIFACT_DIR"
  trap cleanup EXIT

  if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    if [[ ! -f "$SCRAPYBARA_OSS_DIR/computer/docker/Dockerfile" ]]; then
      echo "Missing image '$IMAGE' and Dockerfile at $SCRAPYBARA_OSS_DIR/computer/docker/Dockerfile" >&2
      exit 3
    fi
    docker build -t "$IMAGE" -f "$SCRAPYBARA_OSS_DIR/computer/docker/Dockerfile" "$SCRAPYBARA_OSS_DIR/computer"
  fi

  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  docker run -d --rm \
    --name "$CONTAINER_NAME" \
    -e WIDTH="$CAPY_WIDTH" \
    -e HEIGHT="$CAPY_HEIGHT" \
    -e DISPLAY_NUM=1 \
    -p "127.0.0.1:${CAPY_API_PORT}:8000" \
    -p "127.0.0.1:${CAPY_VNC_PORT}:5900" \
    -p "127.0.0.1:${CAPY_NOVNC_PORT}:6091" \
    "$IMAGE" > "$ARTIFACT_DIR/container_id.txt"

  wait_for_api

  curl -fsS -X POST "http://127.0.0.1:${CAPY_API_PORT}/computer" \
    -H "Content-Type: application/json" \
    -d '{"action":"take_screenshot"}' \
    > "$ARTIFACT_DIR/response.json"

  decode_screenshot "$ARTIFACT_DIR/response.json" "$ARTIFACT_DIR/screenshot.png"

  {
    echo "# VM Smoke RUN_DIGEST"
    echo
    echo "- run_id: $RUN_ID"
    echo "- container_name: $CONTAINER_NAME"
    echo "- image: $IMAGE"
    echo "- api_url: http://127.0.0.1:${CAPY_API_PORT}"
    echo "- novnc_url: http://127.0.0.1:${CAPY_NOVNC_PORT}"
    echo "- artifact_dir: $ARTIFACT_DIR"
    echo "- response_json: $ARTIFACT_DIR/response.json"
    echo "- screenshot_png: $ARTIFACT_DIR/screenshot.png"
    echo "- teardown: $([[ "$CAPY_VM_KEEP" == "yes" ]] && echo "keep-for-review" || echo "destroy")"
    echo "- secrets_policy: none"
  } > "$ARTIFACT_DIR/RUN_DIGEST.md"

  cat "$ARTIFACT_DIR/RUN_DIGEST.md"
}

main "$@"
```

- [ ] **Step 2: Make it executable**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
chmod +x scripts/vm-smoke.sh
```

- [ ] **Step 3: Syntax-check the script**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
bash -n scripts/vm-smoke.sh
```

Expected: command exits 0 and prints no output.

- [ ] **Step 4: Run the smoke only if Docker is available**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
docker info >/dev/null
SCRAPYBARA_OSS_DIR=/tmp/scrapybara-oss-inspect CAPY_VM_KEEP=no ./scripts/vm-smoke.sh
```

Expected: the command prints `# VM Smoke RUN_DIGEST`, creates an artifact directory, and reports `teardown: destroy`.

If `docker info` fails, stop and report `BLOCKED: Docker unavailable`; do not mark the smoke test as passed.

- [ ] **Step 5: Verify artifacts**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
latest="$(find artifacts/capy-vm-smoke -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1)"
test -s "$latest/response.json"
test -s "$latest/screenshot.png"
test -s "$latest/RUN_DIGEST.md"
sed -n '1,80p' "$latest/RUN_DIGEST.md"
```

Expected: all three `test -s` commands exit 0 and the digest prints local URLs plus artifact paths.

- [ ] **Step 6: Commit Task 5**

```bash
cd /Users/0xvox/multica-ultimate-workbench
git add scripts/vm-smoke.sh artifacts/capy-vm-smoke
git commit -m "feat: add capy vm smoke script"
```

If the artifact directory contains large screenshots or repeated test runs, commit only the smallest successful smoke artifact and leave repeated local artifacts untracked.

## Task 6: Document The Lane In README And Decision Log

**Files:**
- Modify: `/Users/0xvox/multica-ultimate-workbench/README.md`
- Modify: `/Users/0xvox/multica-ultimate-workbench/DECISIONS.md`
- Modify: `/Users/0xvox/multica-ultimate-workbench/WORKBENCH_LOG.md`

- [ ] **Step 1: Add README section**

In `README.md`, after `## Flight Recorder / Flight Recorder`, add:

```markdown
## Capy VM Lane / VM 执行通道

The Capy VM Lane is a controlled execution path for GUI, browser, sandbox, and screenshot-backed tasks. It does not replace Multica routing or Supervisor review; it gives assigned agents a disposable execution cell when shell-only work is not enough.

Capy VM Lane 是一个受控的 VM/Computer 执行通道，用来处理 GUI、浏览器、隔离沙盒和截图证据任务。它不替代 Multica 的派工与复核，只在 shell-only 工作不够时给指定 agent 一个一次性的执行空间。

```bash
./scripts/vm-smoke.sh
```

See [docs/capy-vm-lane.md](docs/capy-vm-lane.md).
```

- [ ] **Step 2: Add documentation map entry**

In `README.md`, add this row to the Documentation Map:

```markdown
| VM execution lane / VM 执行通道 | [docs/capy-vm-lane.md](docs/capy-vm-lane.md) |
```

- [ ] **Step 3: Add decision entry**

Append this entry to `DECISIONS.md`:

```markdown
## 2026-04-30: Capy VM Lane is a capability lease, not a scheduler

Decision: add a controlled VM/Computer execution lane for GUI, browser, sandbox, and screenshot-backed tasks.

Reason: some workbench tasks need disposable desktop state and visual proof, but Multica should remain the routing, review, issue, and evidence source of truth.

Consequence: VM sessions must be declared through SDD fields, owned by one issue and one agent, artifact-backed, and destroyed by default. The lane must not become an autonomous scheduler or a replacement for Multica.
```

- [ ] **Step 4: Add rollout log entry**

Append this entry to `WORKBENCH_LOG.md`:

```markdown
## 2026-04-30: Planned Capy VM Lane

Added a plan for a controlled VM/Computer execution lane based on Scrapybara OSS Computer API concepts. The rollout is docs-first: define lease rules, extend SDD templates, add VM Runner source instructions, add a workspace skill, add a local smoke script, and only then consider live Multica creation with human approval.
```

- [ ] **Step 5: Verify docs**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
rg -n "Capy VM Lane|capy-vm|vm-smoke.sh|capability lease" README.md DECISIONS.md WORKBENCH_LOG.md
git diff --check
```

Expected: all files include the lane references and `git diff --check` exits 0.

- [ ] **Step 6: Commit Task 6**

```bash
cd /Users/0xvox/multica-ultimate-workbench
git add README.md DECISIONS.md WORKBENCH_LOG.md
git commit -m "docs: document capy vm lane rollout"
```

## Task 7: Full Local Verification

**Files:**
- Verify all changed files from Tasks 1-6.

- [ ] **Step 1: Check worktree**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
git status --short --branch
```

Expected: branch is clean after the Task 6 commit.

- [ ] **Step 2: Check Markdown references**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
rg -n "docs/capy-vm-lane.md|issue-templates/vm-lane-smoke.md|agents/outer/workbench-vm-runner.md|skills/workbench-capy-vm-lane.md|scripts/vm-smoke.sh" .
```

Expected: the new files are linked from README, docs, templates, skills, or agent instructions.

- [ ] **Step 3: Check shell scripts**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
bash -n scripts/list-workbench-state.sh
bash -n scripts/collect-flight-recorder.sh
bash -n scripts/vm-smoke.sh
```

Expected: all syntax checks exit 0.

- [ ] **Step 4: Run existing read-only state helper**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
./scripts/list-workbench-state.sh >/tmp/workbench-state-after-capy-vm-lane.txt
wc -l /tmp/workbench-state-after-capy-vm-lane.txt
```

Expected: helper exits 0 and prints a line count. Do not paste raw state output into the final report.

- [ ] **Step 5: Check secret leakage patterns**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
rg -n "Bearer [A-Za-z0-9._-]+|sk-[A-Za-z0-9]|xox[baprs]-|ghp_[A-Za-z0-9]|Authorization:|Cookie:" docs agents skills issue-templates scripts README.md DECISIONS.md WORKBENCH_LOG.md || true
```

Expected: no real secret values are printed.

- [ ] **Step 6: Record final verification commit if needed**

If verification required doc corrections, commit them:

```bash
cd /Users/0xvox/multica-ultimate-workbench
git add README.md DECISIONS.md WORKBENCH_LOG.md docs issue-templates agents skills scripts
git commit -m "chore: verify capy vm lane docs"
```

If there are no corrections, do not create an empty commit.

## Task 8: Optional Live Multica Rollout With Human Approval

**Files:**
- Reference: `/Users/0xvox/multica-ultimate-workbench/agents/multica-create-commands.md`
- Reference: `/Users/0xvox/multica-ultimate-workbench/skills/README.md`

- [ ] **Step 1: Re-check live workspace state**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
./scripts/list-workbench-state.sh >/tmp/workbench-state-before-vm-runner-live.txt
wc -l /tmp/workbench-state-before-vm-runner-live.txt
```

Expected: helper exits 0. Keep the raw output local unless Supervisor asks for it.

- [ ] **Step 2: Stop before mutation**

Before creating a live skill, live agent, or live binding, post a Multica issue/comment with:

```text
LIVE_MUTATION_REQUEST
Target: Workbench VM Runner + workbench-capy-vm-lane skill
Profile: desktop-api.multica.ai
Workspace: DASH
Runtime family: Codex
Human approval required: yes
```

Expected: no live mutation happens until the human approves.

- [ ] **Step 3: Create or update live skill after approval**

After human approval, use the Multica CLI shape already used for workspace skills. Capture the resulting skill ID in `skills/README.md` under `## Live IDs`:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 skill create \
  --name "workbench-capy-vm-lane" \
  --description "Controlled VM/Computer execution lane for GUI, browser, sandbox, and screenshot-backed tasks." \
  --content "$(cat skills/workbench-capy-vm-lane.md)" \
  --output json
```

Expected: command returns a non-empty skill ID. If a duplicate skill already exists, stop and use the documented update path from the existing skill-sync workflow instead of creating a second live skill.

- [ ] **Step 4: Create live VM Runner agent after approval**

Use the Codex runtime ID only after re-checking `agents/multica-create-commands.md` and live runtime list:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent create \
  --name "Workbench VM Runner" \
  --description "Controlled VM/Computer execution owner for GUI, browser, sandbox, and screenshot-backed tasks." \
  --instructions "$(cat agents/outer/workbench-vm-runner.md)" \
  --runtime-id "$CODEX_RUNTIME_ID" \
  --runtime-config '{"custom_args":["--ask-for-approval","on-request"]}' \
  --max-concurrent-tasks 1 \
  --visibility private \
  --output json
```

Expected: command returns a non-empty agent ID. If a VM Runner already exists, stop and update the existing agent rather than creating a duplicate.

- [ ] **Step 5: Verify live rollout**

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent list --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 skill list --output json
```

Expected: `Workbench VM Runner` and `workbench-capy-vm-lane` appear exactly once.

## Self-Review

- Spec coverage: the plan covers the Capy/Scrapybara design insight, VM lease discipline, SDD integration, agent role, skill source, local smoke, docs, verification, and optional live rollout.
- Placeholder scan: the actionable task bodies contain no banned placeholder phrases or open-ended implementation instructions.
- Type consistency: the execution target string is consistently `capy-vm`; lease fields are consistently `VM_LEASE`, `ARTIFACTS_REQUIRED`, and `TEARDOWN`; the agent name is consistently `Workbench VM Runner`; the skill name is consistently `workbench-capy-vm-lane`.
- Scope check: this plan intentionally does not implement a VM fleet scheduler, provider gateway, or Multica runtime patch. Those are separate future plans after the local VM lane is proven.
