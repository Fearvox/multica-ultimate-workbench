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
