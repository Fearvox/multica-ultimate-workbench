# Multica Ultimate Workbench

This repository is the durable operating memory for the Hybrid Multica Two-Ring Workbench.

It does not replace Multica. Multica remains the native collaboration layer for agents, issues, comments, direct chat, runtimes, and autopilots.

## Operating Model

- Inner Ring: command, review, and synthesis.
- Outer Ring: bounded specialist execution and analysis.
- Direct chat is for fuzzy thinking.
- Issues are for executable work.
- @mentions are for parallel advice or review.
- Autopilots create issues for scheduled checks; they do not silently run high-risk work.

## Critical Rules

- Do not modify Multica daemon, Desktop UI, or core runtime for version 1.
- Do not store secrets, OAuth material, or private tokens in this repository.
- Codex command and patch approval are configured through Codex CLI/profile/runtime args.
- No agent may claim done without evidence.
- Outer Ring agents do not assign work to each other.

## Planned Useful Commands

These scripts are created in later rollout tasks; do not run them until they exist and have been reviewed.

```bash
./scripts/list-workbench-state.sh
./scripts/generate-create-commands.sh
```

Human approval is required before running `create-pilot-agent.sh` or `create-agent-roster.sh`.
