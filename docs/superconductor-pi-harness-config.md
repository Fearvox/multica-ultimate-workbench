# Superconductor Pi Harness Config

Date: 2026-05-04

This lane configures Pi as a focused Superconductor harness, not as another
global skill sink.

## Current Readback

- Superconductor Pi wrapper: `/Users/0xvox/.superconductor/bin/pi`
- Real Pi package: `@mariozechner/pi-coding-agent@0.72.1`
- User-global Pi profile: `~/.pi/agent`
- Superconductor Pi profile: `/Users/0xvox/.superconductor/pi-agent`
- Superconductor config backup:
  `/Users/0xvox/.superconductor/settings.json.bak-20260504-074648-pi-harness`
- Superconductor Pi wrapper backup:
  `/Users/0xvox/.superconductor/bin/pi.bak-20260504-074903-harness-defaults`
- Settings backup before PATH wrapper repair:
  `/Users/0xvox/.superconductor/settings.json.bak-20260504-0929-path-wrapper`

Why isolate: the default user Pi profile currently exposes a large global skill
set. Superconductor Pi should start from a small app-owned profile so runtime
startup stays observable and token pressure stays bounded.

## Applied Superconductor Wrapper Defaults

The Superconductor tool entry now launches Pi through the absolute wrapper path:

```json
{
  "tools": {
    "pi": {
      "command": "/Users/0xvox/.superconductor/bin/pi"
    }
  }
}
```

The generic Terminal entry is also pinned to the Superconductor zsh wrapper so
manual `pi` calls inside a fresh Terminal tab resolve to the same wrapper:

```json
{
  "tools": {
    "terminal": {
      "command": "/bin/zsh",
      "env": {
        "ZDOTDIR": "/Users/0xvox/.superconductor/zsh",
        "SUPERCONDUCTOR_ORIG_ZDOTDIR": "/Users/0xvox"
      }
    }
  }
}
```

The durable behavior boundary lives in the generated wrapper at
`/Users/0xvox/.superconductor/bin/pi`. If Superconductor regenerates tool
settings, restore the absolute command/env entries or relaunch after the app
recreates them.

For app-launched sessions where `SUPERCONDUCTOR_TERMINAL_ID` is present, the
wrapper now injects:

```bash
export PI_CODING_AGENT_DIR="${PI_CODING_AGENT_DIR:-/Users/0xvox/.superconductor/pi-agent}"
export PI_TELEMETRY="${PI_TELEMETRY:-0}"

set -- --model xai/grok-4.3 --thinking high --no-skills "$@"
```

The wrapper only adds missing defaults. If a launch explicitly passes `--model`
or `--thinking`, that explicit value wins. If a launch explicitly passes a
`--skill`, the wrapper does not add `--no-skills`.

Superconductor may pass a previously generated explicit Pi session path under
`~/.pi/agent/sessions/...`. The wrapper rewrites that path to
`/Users/0xvox/.superconductor/pi-agent/sessions/...` before Pi starts. Without
that rewrite, an app-launched Pi tab can still inherit user-global skill
diagnostics even when `PI_CODING_AGENT_DIR` is set.

The isolated profile also sets:

```json
{
  "hideThinkingBlock": true,
  "quietStartup": true,
  "terminal": {
    "showTerminalProgress": false
  }
}
```

The wrapper appends a short UI-hygiene prompt by default so Grok does not render
literal `Thinking:` prefixes, incremental draft lines, or tool-call narration as
user-facing output. Set `SUPERCONDUCTOR_PI_UI_HYGIENE_PROMPT=0` to disable that
prompt for a debugging launch.

This avoids falling through to Pi's default Google provider path during
Superconductor launches, while preserving normal shell behavior: outside an
app-launched Superconductor session, the wrapper passthrough remains unchanged.

## Installed Operator Harness Pack

Installed into `/Users/0xvox/.superconductor/pi-agent/settings.json`:

| Package | Role | Loop Placement |
| --- | --- | --- |
| `npm:pi-tool-display` | Compact tool rendering, diff display, MCP output hiding | default UI hygiene |
| `npm:pi-interactive-shell` | Observable PTY overlay for CLIs and subagents | hands-free/dispatch execution |
| `npm:pi-boomerang` | Context collapse and task handoff summaries | long autonomous turns |
| `npm:pi-subagents` | Focused child Pi sessions with artifacts | bounded parallel review/work |
| `npm:pi-mcp-adapter` | Lazy MCP proxy tool instead of eager tool bloat | MCP access on demand |
| `npm:pi-design-deck` | Visual option decks for decisions | human choice gates |
| `git:github.com/nicobailon/visual-explainer` | HTML diagrams, diff reviews, plan audits | graph/readable artifact output |

## Parked For Explicit Operator Setup

These are useful, but should not be default-installed into the Superconductor Pi
profile without a separate setup step:

| Repo | Reason |
| --- | --- |
| `pi-annotate` | Requires browser extension and native host install. Great for UI annotation after setup. |
| `surf-cli` | Requires browser extension/native messaging host. Keep as browser lane, not default Pi startup. |
| `pi-web-access` | Network-capable search/extraction. Useful for Pi-only research, but overlaps with existing web/browser routes. |
| `pi-messenger` / `pi-intercom` | Cross-session communication can duplicate Superconductor routing unless scoped. |
| `pi-model-switch` / `pi-prompt-template-model` | Model autonomy should wait until provider budget and trust policy are explicit. |
| `pi-review-loop` | Review loops should first route through Workbench evidence gates. |
| `pi-rewind-hook` | Rollback/rewind is useful but too authority-bearing for the default harness. |
| `pi-custom-compaction` | Parked because `pi-boomerang` already covers the first context-collapse path. |
| `pi-powerline-footer` | Parked after smoke: produced a stale extension context warning after print-mode session close. |

## MCP / ACP / ATA / Hook Boundary

- Superconductor's generated Pi extension still owns local Superconductor MCP
  workflow tools through `SUPERCONDUCTOR_MCP_URL`.
- `pi-mcp-adapter` is retained for standard `.mcp.json` / host config access,
  but it should stay lazy: one proxy tool first, tool details only on demand.
- `acpx` remains the preferred ACP shell for persistent agent-to-agent work.
  Use the existing checkout at `/Users/0xvox/superconductor/parking-lot/acpx`
  for source-grounded ACP changes before installing or publishing anything.
- ATA is treated as an adapter layer, not a permission layer. Pi can describe
  and call tool adapters, but Workbench/Superconductor still own routing,
  authority, and review gates.
- Hooks are allowed only when they improve observability or handoff quality.
  Rollback, browser-native-host, provider-switch, or cross-session messaging
  hooks require a separate explicit operator setup.
- Cloud-safe profiles must not inherit local `stdio` MCP servers. Browser,
  Playwright, Surf, and native-host tools stay local-interactive only.

## Operator Loop

Use this routing when a Pi-backed Superconductor task starts:

```text
1. Check repo anchor and Superconductor worktree.
2. Use Pi with the isolated Superconductor profile; new app tabs should land
   under `/Users/0xvox/.superconductor/pi-agent/sessions`, not `~/.pi/agent`.
3. For long tasks: prefer /boomerang so the parent gets a compact summary.
4. For shell-heavy work: use interactive_shell in hands-free or dispatch mode.
5. For visual plans/graphs: use visual-explainer or design-deck, and include a raw-code copy path.
6. For MCP needs: search/describe first through the lazy adapter, then call the exact tool.
7. Close with changed files, proof, residual risk, and next action.
```

## Verification Commands

```bash
sed -n '1,200p' /Users/0xvox/.superconductor/pi-agent/settings.json
```

```bash
env ZDOTDIR=/Users/0xvox/.superconductor/zsh \
  SUPERCONDUCTOR_ORIG_ZDOTDIR=/Users/0xvox \
  /bin/zsh -ic 'which pi'
```

```bash
bash -n /Users/0xvox/.superconductor/bin/pi
```

```bash
SUPERCONDUCTOR_TERMINAL_ID=pi-rewrite-smoke \
SUPERCONDUCTOR_MCP_URL=http://127.0.0.1:31418/mcp \
/Users/0xvox/.superconductor/bin/pi \
  --session /Users/0xvox/.pi/agent/sessions/--Users-0xvox-superconductor-projects-multica-ultimate-workbench--/rewrite-smoke.jsonl \
  --print 'Print exactly: rewrite-ok'
```

```bash
PI_CODING_AGENT_DIR=/Users/0xvox/.superconductor/pi-agent \
  /Users/0xvox/.bun/bin/pi --model xai/grok-4.3 --thinking high --version
```

## Rollback

Restore the wrapper backup:

```bash
cp -p /Users/0xvox/.superconductor/bin/pi.bak-20260504-074903-harness-defaults \
  /Users/0xvox/.superconductor/bin/pi
```

If a future experiment mutates Superconductor settings directly, restore the
settings backup:

```bash
cp -p /Users/0xvox/.superconductor/settings.json.bak-20260504-0929-path-wrapper \
  /Users/0xvox/.superconductor/settings.json
```

Older settings backup before the initial Pi harness experiment:

```bash
cp -p /Users/0xvox/.superconductor/settings.json.bak-20260504-074648-pi-harness \
  /Users/0xvox/.superconductor/settings.json
```

To remove the isolated package profile:

```bash
rm -rf /Users/0xvox/.superconductor/pi-agent
```
