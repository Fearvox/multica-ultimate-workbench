# Flue Agent Scaffold Issue Template

## Goal

Create or review the smallest useful Flue agent scaffold for one bounded
workbench workflow.

## Context

- Workbench lane: `docs/flue-agent-harness-lane.md`
- Skill: `skills/workbench-flue-agent-harness/SKILL.md`
- Upstream entry: `https://flueframework.com/start.md`
- Default local dev port: `3583`

## SDD Stage Card

```text
SDD_STAGE: Technical Design
OWNER: <assigned agent>
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE: docs/flue-agent-harness-lane.md, skills/workbench-flue-agent-harness/SKILL.md
HANDOFF_SUMMARY: Package one proven workflow as a Flue starter agent without changing Multica runtime state.
SCOPED_EVIDENCE: docs/flue-agent-harness-lane.md, skills/workbench-flue-agent-harness/SKILL.md, target project files only
ANTI_OVER_READ: Do not inspect unrelated issue history, full agent roster, raw run transcripts, or private runtime config.
```

## Required Contract

```yaml
FLUE_AGENT_CONTRACT:
  purpose: "<what the agent should do>"
  project_directory: "<absolute or repo-relative path>"
  workspace_layout: "root | .flue"
  agent_file: "./agents/<name>.ts | ./.flue/agents/<name>.ts"
  deploy_target: "node | cloudflare | github-actions | gitlab-ci | other-node-baseline"
  model_id: "anthropic/claude-sonnet-4-6 | anthropic/claude-opus-4-7 | openai/gpt-5.5 | openrouter/moonshotai/kimi-k2.6 | <models.json id>"
  sandbox_mode: "virtual | local | cloudflare-r2 | container | external"
  trigger: "webhook | cli | ci"
  secrets_policy: "none | env-only | host-command-env"
  validation_command: "<exact command>"
  public_artifact_policy: "summaries-only"
```

## Implementation Steps

1. Read `docs/flue-agent-harness-lane.md`.
2. Fetch `https://flueframework.com/start.md` and the Flue README if fresh
   upstream behavior matters.
3. Verify the contract fields.
4. Infer layout from the target directory:
   - new or empty: `agents/` and `roles/`;
   - existing non-empty: `.flue/agents/` and `.flue/roles/`.
5. Create the smallest useful starter agent.
6. Pass the model ID explicitly to `init({ model: "<model_id>" })`.
7. Run the chosen validation command.
8. Report only compact evidence and residual risk.

## Verification Commands

Use the command that matches the target:

```bash
flue dev --target node
flue build --target node
flue dev --target cloudflare
flue build --target cloudflare
flue run <agent-name> --target node --id smoke --payload '{}'
```

Do not use `flue run --target cloudflare`.

## PASS Criteria

- `FLUE_AGENT_CONTRACT` is complete.
- Agent file path matches the inferred layout.
- Model ID is exact and explicitly passed to `init`.
- Deploy target and verification command match.
- No secrets, tokens, raw payloads, OAuth material, or raw run transcripts are
  committed or pasted.
- Starter agent is intentionally narrow and does not mutate live Multica state.
- Closeout includes `FLUE_AGENT_REPORT` and `VERDICT: PASS | FLAG | BLOCK`.
