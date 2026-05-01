---
name: workbench-agent-install-unifier
description: Use when syncing skills, MCPs, or AGENTS.md sections across coding agents with agent-install.
---

# Workbench Agent-Install Unifier

Use this skill when a task asks to unify agent skills, MCP config, or AGENTS.md
instructions across CLIs using `agent-install`.

## Required Source Reads

1. `docs/agent-install-unifier-lane.md`
2. `https://github.com/millionco/agent-install`
3. Current target config files if the task will mutate local config

## Required Contract

```yaml
AGENT_INSTALL_SYNC_CONTRACT:
  operation:
  source:
  target_agents:
  config_scope:
  secrets_policy:
  dry_run_first:
  readback_required:
  rollback_plan:
```

If the task does not provide a safe target agent list, config scope, or rollback
plan, return `BLOCK` with the smallest missing field list.

## Rules

- Run readback/list commands before mutation when available.
- Do not write secrets, token values, OAuth material, cookies, or passwords.
- Prefer project-local config over global user config unless the task names a
  global sync.
- Keep Multica skill source and live Multica bindings separate from
  `agent-install` sync unless the task explicitly bridges them.
- Verify by listing or reading the target config after mutation.

## Report Contract

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

