# Windburn Workhorse Runtime Registry

Sanitized registry card for the Windburn remote NixOS workhorse runtime surface.

## Source

- Repository: `Fearvox/project-windburn`
- Current landed baseline: `bb52136`
- Landed PRs in this baseline:
  - PR #16: Herdr cockpit lane
  - PR #17: workhorse health evidence safety gate

## Runtime Role

The Windburn workhorse is a remote execution cell for long-running build,
runtime, and evidence work. It is not a new orchestrator.

Durability belongs to:

- NixOS system configuration;
- systemd services and timers;
- fixed tmux lanes for interactive agent processes.

Operator cockpit belongs to:

- local Herdr cockpit socket API;
- live attach into the remote tmux lane without restarting the local UI.

Herdr is a cockpit and observation surface only. It must not be treated as the
source of remote durability.

## Capability Surface

| Capability | Registry state | Public-safe note |
| --- | --- | --- |
| `herdr-cockpit-socket-api` | `PASS` | Cockpit can attach to the remote operator pane. Raw terminal panes stay private. |
| `codex-fixed-tmux-lane` | `PASS` | Codex fixed lane is represented by redacted runtime evidence. |
| `hermes-yolo-tmux-lane` | `PASS` | Hermes yolo lane is represented by redacted runtime evidence. |
| Runner aggregate evidence | `PASS` | Aggregate runner evidence reports Codex, Hermes yolo, and Herdr cockpit readiness. |
| Health evidence safety gate | `PASS` | Health evidence includes `secret_values_recorded=false` and `redacted_public_safe=true`. |

## Evidence Boundary

Fusion Bridge and runtime evidence may be public-facing only after redaction and
safety fields pass. Raw Herdr terminal panes, direct tmux targets, private host
coordinates, operator commands, and credential paths are private operator
surfaces.

Public docs and registry cards may reference capability names, verdicts, PRs,
commit IDs, and sanitized evidence paths. They must not include:

- host names or IPs;
- direct tmux target strings;
- raw attach commands;
- raw terminal pane content;
- tokens, cookies, OAuth payloads, or credential files.

## Local Cockpit Pattern

Current operator flow, redacted:

```text
Herdr cockpit -> SSH transport -> remote tmux lane -> Hermes yolo window
```

This pattern is an operator attach path, not durability. If the cockpit closes,
the durable lane should continue under the remote systemd/tmux surface.

## Next Lane

Hermes upgrade should stay a small hard lane:

```text
target rev
-> Nix module update
-> NixOS test activation
-> Hermes evidence smoke
-> local verifier PASS/BLOCK
-> NixOS switch only after PASS
```

The target rev must be explicit before changing the Nix module. The verifier
must consume sanitized runtime evidence rather than raw terminal output.
