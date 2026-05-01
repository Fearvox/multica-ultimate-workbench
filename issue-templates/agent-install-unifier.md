# Agent-Install Unifier Issue Template

Use this when syncing skills, MCP servers, or AGENTS.md sections across multiple
agent CLIs with `agent-install`.

```text
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:

AGENT_INSTALL_SYNC_CONTRACT:
  operation:
  source:
  target_agents:
  config_scope:
  secrets_policy: none | env-only
  dry_run_first: true
  readback_required: true
  rollback_plan:

Required output:

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

