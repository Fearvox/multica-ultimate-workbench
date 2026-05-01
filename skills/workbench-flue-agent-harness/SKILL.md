---
name: workbench-flue-agent-harness
description: Deployable Flue agent harness lane for HTTP, CI, Node, Cloudflare, and sandbox-backed agents.
---

# Workbench Flue Agent Harness

Use this skill when an issue asks to create, review, or package a deployable
Flue agent, or when it declares `FLUE_AGENT_CONTRACT`.

## Required Source Reads

Read only as much as the task requires:

1. `docs/flue-agent-harness-lane.md`
2. `https://flueframework.com/start.md`
3. `https://raw.githubusercontent.com/withastro/flue/refs/heads/main/README.md`
4. `https://flueframework.com/models.json` if the requested model is not one of
   the recommended IDs

If network access is unavailable, use the checked-in workbench doc and report
`FLAG` unless the issue requires fresh upstream docs.

## Required Contract

Do not scaffold until the issue provides or you can safely infer:

```yaml
FLUE_AGENT_CONTRACT:
  purpose:
  project_directory:
  workspace_layout:
  agent_file:
  deploy_target:
  model_id:
  sandbox_mode:
  trigger:
  secrets_policy:
  validation_command:
  public_artifact_policy:
```

Inference rules:

- missing `project_directory`: use the issue's repo checkout only if it is the
  declared target;
- new or empty directory: `workspace_layout: root`;
- existing non-empty directory: `workspace_layout: .flue`;
- missing deploy target: prefer `node`;
- missing model: prefer `anthropic/claude-sonnet-4-6` for starter agents;
- missing secrets policy: use `none` for pure virtual agents, otherwise
  `env-only`.

If a field cannot be inferred safely, return `BLOCK` with the smallest missing
field list.

## Safety Rules

- Do not invent API keys, OAuth material, cookies, or tokens.
- Do not paste secrets into prompts, durable docs, example payloads, or issue
  comments.
- Do not copy raw MCP request payloads or raw run transcripts into Git.
- Do not mutate Multica daemon, Desktop UI, runtime config, or live agent
  bindings from a Flue scaffold issue.
- Do not place a real Flue app inside this workbench repo unless the issue
  explicitly asks for it; this repo usually records the lane, not the app.

## Implementation Rules

- For a new or empty project, create `agents/` and `roles/`.
- For an existing non-empty project, create `.flue/agents/` and `.flue/roles/`.
- Pass the selected model ID explicitly to `init({ model: "<model_id>" })`.
- Prefer `flue dev --target node` or `flue dev --target cloudflare` for local
  development.
- Do not use `flue run --target cloudflare`; use `flue dev --target cloudflare`
  or build and call a deployed endpoint.
- Grant host commands per prompt or skill, not globally, for CI/local sandbox
  agents.
- Keep starter agents close to one narrow workflow. Wider autonomy belongs in a
  later reviewed iteration.

## Report Contract

Always close with:

```text
FLUE_AGENT_REPORT
purpose:
project_directory:
workspace_layout:
agent_file:
deploy_target:
model_id:
sandbox_mode:
trigger:
secrets_policy:
files_changed:
validation:
residual_risk:
next_action:
VERDICT: PASS | FLAG | BLOCK
```

`PASS` requires a verified starter and clean public boundary. `FLAG` is correct
when only external secrets, deploy credentials, or remote host setup remain.
`BLOCK` is correct when the contract is incomplete, the model ID is unsupported,
or the target path cannot be safely determined.
