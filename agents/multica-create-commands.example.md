# Multica Create Commands Template

This is a public-safe template. Keep live workspace IDs, runtime IDs, and
generated command transcripts in the ignored file:

```text
agents/multica-create-commands.md
```

## Environment

```bash
export MULTICA_PROFILE="desktop-api.multica.ai"
export MULTICA_WORKSPACE_ID="<workspace-id>"
export CLAUDE_RUNTIME_ID="<claude-runtime-id>"
export CODEX_RUNTIME_ID="<codex-runtime-id>"
export HERMES_RUNTIME_ID="<hermes-runtime-id>"
```

## Generate Private Commands

```bash
scripts/generate-create-commands.sh
```

The generator writes `agents/multica-create-commands.md`, which is ignored by
Git. Review that private file locally before running any mutating command.

## Safety Gates

Mutating scripts require explicit confirmation variables:

```bash
CONFIRM_CREATE_CODEX_GUARDIAN=yes scripts/create-pilot-agent.sh
CONFIRM_CREATE_WORKBENCH_ROSTER=yes scripts/create-agent-roster.sh
```

Do not paste live IDs, OAuth material, machine names, remote IPs, screenshots,
or raw runtime payloads into tracked docs.
