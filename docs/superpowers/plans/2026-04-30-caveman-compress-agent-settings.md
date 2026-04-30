# Caveman Compress Agent Settings Plan

> **For agentic workers:** Execute this plan step by step. Do not compress files outside the listed target set. Keep every command output or missing-verification note in the final report.

## Goal

Reduce Multica workbench agent instruction size to improve prompt/cache read efficiency while preserving role boundaries, safety rules, SDD flow, and live agent behavior.

Current active agent prompt corpus:

- 12 active agent setting files under `agents/inner/` and `agents/outer/`.
- 406 lines / 2,576 words across those 12 files before compression.
- No existing `*.original.md` backups under `agents/`.
- Live Multica agents already exist and can be updated with `multica agent update <id> --instructions`.

## Non-Goals

- Do not compress `skills/*.md` in this pass.
- Do not compress `artifacts/**/*.md`; those are evidence mirrors and historical records.
- Do not compress `.json`, `.yaml`, `.yml`, `.toml`, `.env`, `.sh`, `.ts`, `.tsx`, `.js`, `.css`, `.html`, `.lock`, or any other code/config format.
- Do not touch `Workbench Max`; it remains the preserved private Codex workbench agent.
- Do not change runtime IDs, models, concurrency, custom args, visibility, or skill assignments.

## Target Files

Pilot target:

- `/Users/0xvox/multica-ultimate-workbench/agents/inner/workbench-admin.md`

Batch targets after pilot approval:

- `/Users/0xvox/multica-ultimate-workbench/agents/inner/workbench-supervisor.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/inner/workbench-synthesizer.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/benchmark-scout.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/claude-architect.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/claude-docs.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/codex-developer.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/codex-guardian.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/hermes-researcher.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/memory-curator.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/ops-mechanic.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/outer/qa-verifier.md`

Optional source docs after agent settings pass:

- `/Users/0xvox/multica-ultimate-workbench/agents/AGENT_ROSTER.md`
- `/Users/0xvox/multica-ultimate-workbench/agents/multica-create-commands.md`

Do not run the optional source-doc pass unless the 12 active agent prompts pass verification and the user explicitly wants the docs compressed too.

## Agent ID Map For Live Sync

Use these IDs only after re-checking `agent list` in Task 5.

| Agent | File | Live ID |
| --- | --- | --- |
| Workbench Admin | `agents/inner/workbench-admin.md` | `5fb626ce-488c-44cd-81c1-0cfb3ea26bce` |
| Workbench Supervisor | `agents/inner/workbench-supervisor.md` | `4e19cffb-1abe-461a-9026-eeb7155668d1` |
| Workbench Synthesizer | `agents/inner/workbench-synthesizer.md` | `3607eb50-98c3-41ae-99de-9f1ccff5c48c` |
| Codex Guardian | `agents/outer/codex-guardian.md` | `28b28318-1ba5-4d41-883e-9763ce66c816` |
| Codex Developer | `agents/outer/codex-developer.md` | `31317f6a-8723-4e5d-ab67-9d02c07d0aab` |
| Hermes Researcher | `agents/outer/hermes-researcher.md` | `77bfbf5b-0cc7-4797-b703-b17eb700ad32` |
| Claude Architect | `agents/outer/claude-architect.md` | `36f427ec-5395-4e0b-8168-f4fd02086826` |
| Claude Docs | `agents/outer/claude-docs.md` | `2a4acdbe-c9d3-4394-8194-67f0e90b7d21` |
| QA Verifier | `agents/outer/qa-verifier.md` | `45d11e94-303d-480b-b4b9-cffbcf8f79c4` |
| Benchmark Scout | `agents/outer/benchmark-scout.md` | `54e53ad9-b677-4995-8a56-1c70d99be4c0` |
| Ops Mechanic | `agents/outer/ops-mechanic.md` | `cf068511-8cde-455d-9c91-a6cf84d581be` |
| Memory Curator | `agents/outer/memory-curator.md` | `f437828c-a14b-4cc2-9449-6537e426a216` |

## Task 1: Preflight Inventory

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
git status --short
find agents -type f -name '*.original.md' -print
find agents/inner agents/outer -type f -name '*.md' -print | sort | xargs wc -l
find agents/inner agents/outer -type f -name '*.md' -print | sort | xargs wc -w
```

Expected:

- `git status --short` is empty before compression.
- No `*.original.md` files are printed.
- The 12 active agent setting files are the only files counted.

If the worktree is dirty, stop and inspect the diff before continuing.

## Task 2: Pilot Compression

Run only the Workbench Admin pilot first:

```bash
cd /Users/0xvox/.agents/skills/caveman-compress
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/inner/workbench-admin.md
```

Then verify:

```bash
cd /Users/0xvox/multica-ultimate-workbench
test -f agents/inner/workbench-admin.md.original.md
wc -w agents/inner/workbench-admin.md.original.md agents/inner/workbench-admin.md
git diff -- agents/inner/workbench-admin.md agents/inner/workbench-admin.md.original.md
git diff --check
```

Acceptance criteria:

- Backup exists at `agents/inner/workbench-admin.md.original.md`.
- Compressed prompt keeps the role, runtime, ring, concurrency, mission, SDD role, trigger policy, shared rules, BLOCKED policy, and risky-action confirmation rule.
- No code block, command, path, URL, model/runtime name, date, or exact label is damaged.
- `git diff --check` passes.

If pilot behavior looks semantically degraded, restore with:

```bash
cd /Users/0xvox/multica-ultimate-workbench
cp agents/inner/workbench-admin.md.original.md agents/inner/workbench-admin.md
```

Do not continue to batch compression until the pilot diff is acceptable.

## Task 3: Batch Compress Remaining Agent Settings

After Task 2 passes, run:

```bash
cd /Users/0xvox/.agents/skills/caveman-compress
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/inner/workbench-supervisor.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/inner/workbench-synthesizer.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/benchmark-scout.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/claude-architect.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/claude-docs.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/codex-developer.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/codex-guardian.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/hermes-researcher.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/memory-curator.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/ops-mechanic.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/outer/qa-verifier.md
```

Verify:

```bash
cd /Users/0xvox/multica-ultimate-workbench
find agents/inner agents/outer -type f -name '*.original.md' -print | sort | wc -l
find agents/inner agents/outer -type f -name '*.md' ! -name '*.original.md' -print | sort | xargs wc -w
git diff --check
git status --short
```

Expected:

- 12 backup files exist.
- Active agent prompt word count is lower than 2,576 words.
- Only the 12 active prompt files and their 12 backup files changed.

Review each compressed file for preserved invariants:

```bash
cd /Users/0xvox/multica-ultimate-workbench
rg -n "BLOCKED|SDD|APPROVE|APPROVE_WITH_CHANGES|PASS|FLAG|risky|confirmation|secrets|scope expands|Outer Ring|Runtime|Ring|Default concurrency" agents/inner agents/outer
```

Expected:

- Critical policy labels remain findable.
- Role-specific terminal verdict labels remain present in Supervisor / QA files.
- Runtime and ring labels remain present for every agent.

## Task 4: Commit Local Source Compression

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
git diff --stat
git add agents/inner agents/outer
git commit -m "chore: caveman compress agent settings"
```

Expected:

- Commit includes only active agent prompt files and their `.original.md` backups.
- No Multica live state has changed yet.

## Task 5: Re-Check Live Agent Map

Run:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent list --output json \
  | jq -r '.[] | [.id, .name, (.archived // false)] | @tsv'
```

Expected:

- 13 live agents are listed.
- `Workbench Max` is present and must not be updated.
- The 12 target agent names match the Agent ID Map.

If any ID or name differs from the map, stop and update the plan before live sync.

## Task 6: Pilot Live Sync

Update only Workbench Admin first:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 5fb626ce-488c-44cd-81c1-0cfb3ea26bce \
  --instructions "$(cat agents/inner/workbench-admin.md)" \
  --output json
```

Verify:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent get 5fb626ce-488c-44cd-81c1-0cfb3ea26bce --output json \
  | jq -r '.name, (.instructions | length), .runtime_id, .max_concurrent_tasks, .visibility'
```

Expected:

- Name is `Workbench Admin`.
- Instruction length matches compressed prompt scale.
- Runtime ID, max concurrency, and visibility did not change.

If this pilot update fails or metadata drifts, stop before batch live sync.

## Task 7: Batch Live Sync

Run only after Task 6 passes:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 4e19cffb-1abe-461a-9026-eeb7155668d1 --instructions "$(cat agents/inner/workbench-supervisor.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 3607eb50-98c3-41ae-99de-9f1ccff5c48c --instructions "$(cat agents/inner/workbench-synthesizer.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 54e53ad9-b677-4995-8a56-1c70d99be4c0 --instructions "$(cat agents/outer/benchmark-scout.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 36f427ec-5395-4e0b-8168-f4fd02086826 --instructions "$(cat agents/outer/claude-architect.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 2a4acdbe-c9d3-4394-8194-67f0e90b7d21 --instructions "$(cat agents/outer/claude-docs.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 31317f6a-8723-4e5d-ab67-9d02c07d0aab --instructions "$(cat agents/outer/codex-developer.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 28b28318-1ba5-4d41-883e-9763ce66c816 --instructions "$(cat agents/outer/codex-guardian.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 77bfbf5b-0cc7-4797-b703-b17eb700ad32 --instructions "$(cat agents/outer/hermes-researcher.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update f437828c-a14b-4cc2-9449-6537e426a216 --instructions "$(cat agents/outer/memory-curator.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update cf068511-8cde-455d-9c91-a6cf84d581be --instructions "$(cat agents/outer/ops-mechanic.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 45d11e94-303d-480b-b4b9-cffbcf8f79c4 --instructions "$(cat agents/outer/qa-verifier.md)" --output json
```

Verify:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent list --output json \
  | jq -r '.[] | [.name, .runtime_id, .max_concurrent_tasks, .visibility, (.archived // false)] | @tsv'
```

Expected:

- All 12 target agents remain private and unarchived.
- Runtime IDs and concurrency remain unchanged.
- `Workbench Max` remains untouched.

## Task 8: Live Smoke Test

Create one small review-only issue assigned to Workbench Admin:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 issue create \
  --title "DAS-14 agent prompt compression smoke test" \
  --description "Goal: verify compressed Workbench Admin instructions still preserve SDD routing, bounded owner selection, Chinese status, and no uncontrolled fan-out. Do not edit files. Return: What was verified / Evidence / Residual risk / Next action." \
  --assignee 5fb626ce-488c-44cd-81c1-0cfb3ea26bce \
  --priority low \
  --output json
```

Then inspect the resulting issue in Multica Desktop or CLI and confirm:

- Workbench Admin uses Chinese operational summary.
- It does not fan out unless needed.
- It preserves SDD stage awareness.
- It reports evidence or missing-verification plainly.

If token usage is visible in the Desktop issue sidebar, record before/after qualitative result in `WORKBENCH_LOG.md` or a new `artifacts/das-14-agent-compression/README.md`.

## Task 9: Optional Source Docs Compression

Only after live smoke passes and the user approves doc compression, run:

```bash
cd /Users/0xvox/.agents/skills/caveman-compress
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/AGENT_ROSTER.md
python3 -m scripts /Users/0xvox/multica-ultimate-workbench/agents/multica-create-commands.md
```

Verify:

```bash
cd /Users/0xvox/multica-ultimate-workbench
git diff -- agents/AGENT_ROSTER.md agents/multica-create-commands.md
git diff --check
```

Commit separately:

```bash
cd /Users/0xvox/multica-ultimate-workbench
git add agents/AGENT_ROSTER.md agents/AGENT_ROSTER.md.original.md agents/multica-create-commands.md agents/multica-create-commands.md.original.md
git commit -m "docs: caveman compress agent source docs"
```

## Rollback

Rollback local source compression:

```bash
cd /Users/0xvox/multica-ultimate-workbench
find agents/inner agents/outer -type f -name '*.original.md' -print | while read -r backup; do
  active="${backup%.original.md}.md"
  cp "$backup" "$active"
done
git diff --check
```

Rollback live prompts after local restore:

```bash
cd /Users/0xvox/multica-ultimate-workbench
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 5fb626ce-488c-44cd-81c1-0cfb3ea26bce --instructions "$(cat agents/inner/workbench-admin.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 4e19cffb-1abe-461a-9026-eeb7155668d1 --instructions "$(cat agents/inner/workbench-supervisor.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 3607eb50-98c3-41ae-99de-9f1ccff5c48c --instructions "$(cat agents/inner/workbench-synthesizer.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 54e53ad9-b677-4995-8a56-1c70d99be4c0 --instructions "$(cat agents/outer/benchmark-scout.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 36f427ec-5395-4e0b-8168-f4fd02086826 --instructions "$(cat agents/outer/claude-architect.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 2a4acdbe-c9d3-4394-8194-67f0e90b7d21 --instructions "$(cat agents/outer/claude-docs.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 31317f6a-8723-4e5d-ab67-9d02c07d0aab --instructions "$(cat agents/outer/codex-developer.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 28b28318-1ba5-4d41-883e-9763ce66c816 --instructions "$(cat agents/outer/codex-guardian.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 77bfbf5b-0cc7-4797-b703-b17eb700ad32 --instructions "$(cat agents/outer/hermes-researcher.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update f437828c-a14b-4cc2-9449-6537e426a216 --instructions "$(cat agents/outer/memory-curator.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update cf068511-8cde-455d-9c91-a6cf84d581be --instructions "$(cat agents/outer/ops-mechanic.md)" --output json
multica --profile desktop-api.multica.ai --workspace-id 5470ee5d-0791-4713-beb4-fd6a187d6523 agent update 45d11e94-303d-480b-b4b9-cffbcf8f79c4 --instructions "$(cat agents/outer/qa-verifier.md)" --output json
```

## Completion Report Format

Report:

- What changed.
- Compression ratio: original active word count vs compressed active word count.
- Local commit hash.
- Whether live sync was performed.
- Smoke-test issue link or ID.
- Any behavior drift or residual risk.
