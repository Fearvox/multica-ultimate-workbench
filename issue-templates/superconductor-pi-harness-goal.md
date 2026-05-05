# Superconductor Pi Harness Goal

Use this when the operator asks to route Pi into Superconductor's agent loop or
to tune Pi MCP/ACP/plugins/skills/hooks.

## Required Header

```text
/goal
GOAL_MODE: yes
STANDARD_PATH: yes
```

Use `HEAVY_PATH: yes` if the work touches OAuth, secrets, browser native hosts,
cloud-safe agent configs, daemon/Desktop/core code, or live MCP server mutation.

## RAW_REQUIREMENT

```text
Configure Pi as a focused Superconductor harness:
<paste operator request>
```

## GOAL_LOCK

```text
GOAL_LOCK:
objective: tune Pi for Superconductor execution without inheriting global skill
  bloat or unsafe local-only tools in cloud-safe contexts.
owner:
non_goals: no secret capture; no raw transcript persistence; no broad global
  skill import; no browser native-host install unless explicitly requested.
closeout_gates: readback, selected_packages, config_backup, settings_diff,
  local_profile_state, rollback_plan, smoke_command.
operator_call_conditions: ask before deleting packages, installing browser
  native hosts, changing global MCP config, or publishing external PRs.
```

## READBACK

```text
pi_binary:
pi_version:
superconductor_settings:
pi_profile_dir:
global_skill_count:
current_pi_args:
current_pi_env:
wrapper_scope:
```

## PACKAGE TRIAGE

```text
ADOPT_NOW:
PARK:
REJECT:
```

Default `ADOPT_NOW` set:

- `pi-tool-display`
- `pi-interactive-shell`
- `pi-boomerang`
- `pi-subagents`
- `pi-mcp-adapter`
- `pi-design-deck`
- `visual-explainer`

Default `PARK` set:

- `pi-annotate`
- `surf-cli`
- `pi-web-access`
- `pi-messenger`
- `pi-intercom`
- `pi-model-switch`
- `pi-prompt-template-model`
- `pi-review-loop`
- `pi-rewind-hook`
- `pi-custom-compaction`
- `pi-powerline-footer`

## CONFIG CONTRACT

```yaml
SUPERCONDUCTOR_PI_HARNESS_CONFIG:
  pi_profile_dir: /Users/0xvox/.superconductor/pi-agent
  pi_tool_command: /Users/0xvox/.superconductor/bin/pi
  terminal_shell: /bin/zsh
  terminal_env:
    ZDOTDIR: /Users/0xvox/.superconductor/zsh
    SUPERCONDUCTOR_ORIG_ZDOTDIR: /Users/0xvox
  model_args: ["--model", "xai/grok-4.3", "--thinking", "high", "--no-skills"]
  telemetry: "0"
  durable_surface: /Users/0xvox/.superconductor/bin/pi
  settings_json_policy: read-only unless the app exposes a durable tool setting
  session_rewrite_policy: "~/.pi/agent/sessions/* -> /Users/0xvox/.superconductor/pi-agent/sessions/*"
  ui_hygiene:
    hideThinkingBlock: true
    quietStartup: true
    terminal.showTerminalProgress: false
    suppress_literal_thinking_prefixes: true
  mcp_policy: lazy-proxy-first
  acp_policy: use-acpx-for-persistent-agent-to-agent
  ata_policy: adapter-only-not-authority
  hook_policy: observability-and-handoff-only-by-default
  cloud_stdio_policy: deny
  rollback:
```

## CLOSEOUT

```text
WHAT_CHANGED:
VERIFICATION:
ROLLBACK:
RESIDUAL_RISK:
NEXT_ACTION:
VERDICT: PASS | FLAG | BLOCK
```
