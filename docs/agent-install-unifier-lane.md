# Agent-Install Unifier Lane

The Agent-Install Unifier Lane uses `agent-install` to distribute reviewed
skills, MCP server definitions, and AGENTS.md sections across coding agents.

It is a distribution layer, not an authority layer. Multica and this workbench
still own routing, review gates, SDD, Goal Mode, L2 Pressure, public/private
boundaries, and final acceptance.

## Source Reference

Primary upstream:

- `https://github.com/millionco/agent-install`

The upstream project exposes three useful surfaces:

- `skill`: discover and install `SKILL.md` files;
- `mcp`: add, list, and remove MCP servers in native agent config formats;
- `agentsMd`: read and update AGENTS.md-style instruction files.

## When To Use It

Use this lane when the workbench needs:

- the same reviewed skill installed into multiple CLIs;
- MCP server config added consistently across agent runtimes;
- AGENTS.md sections synchronized without hand-editing each agent file;
- a dry-run/readback report before live config mutation.

Do not use it to bypass review, push secrets into configs, replace Multica
skills, or rewrite working runtime config casually.

## Required Contract

```yaml
AGENT_INSTALL_SYNC_CONTRACT:
  operation: skill-add | mcp-add | agents-md-set-section | readback
  source:
  target_agents:
  config_scope: user | project
  secrets_policy: none | env-only
  dry_run_first: true
  readback_required: true
  rollback_plan:
```

## Safety Rules

- Prefer readback and dry-run before write.
- Never put token values, OAuth material, cookies, or passwords into command
  examples or durable docs.
- Environment variables may be named, but values must stay out of Git.
- Treat global user config writes as higher risk than project-local writes.
- Record what changed and how to undo it.

## Review Contract

```text
AGENT_INSTALL_SYNC_REPORT
operation:
source:
target_agents:
config_scope:
files_or_configs_changed:
readback:
rollback_plan:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

