# GM Cockpit Prototype

Brave-first local operator cockpit for Workbench wake/status dogfood.

This is intentionally a prototype wedge, not the final SynDASH package. It proves the split we learned from dogfood:

- `fastfetch` is an identity card, not enough for operations.
- `btop` is useful but TTY-bound and visually not the right main surface.
- Glances Web/API is a strong telemetry source and drill-down pane.
- `macmon` is a pretty Apple Silicon side-card, but too narrow to be the source of truth.
- The final surface should be a decision layer: status judgment, pressure, open loops, and next actions.

## Run

Requires Node.js 18+. The cockpit server uses built-in `fetch` and `AbortSignal.timeout`, so older Node runtimes will fail before the prototype UI loads.

Start Glances Web first if it is not already running:

```bash
glances -w --bind 127.0.0.1
```

Then start the cockpit:

```bash
node prototypes/gm-cockpit/server.mjs
```

Open in Brave:

```bash
open -a "Brave Browser" "http://127.0.0.1:4877"
```

## Environment

```bash
GM_COCKPIT_PORT=4877
GLANCES_URL=http://127.0.0.1:61208/api/4/all
MUW_REPO=/path/to/multica-ultimate-workbench
```

## Current adapters

- Glances API: CPU, memory, swap, load, filesystem, process list.
- Git: branch, head, dirty status for the configured Workbench checkout.
- Tool presence: fastfetch, btop, btm, glances, macmon, node.
- macmon metric sampling: single-sample Apple Silicon power/temperature side-card when `macmon` is installed.
- Hermes pressure: derived from Glances process list by matching Hermes commands.

## Not yet wired

- Multica issues/runs.
- Hermes cron list.
- Research Vault status.
- Browser/localterm state.

Those belong in follow-up adapters after the information architecture is accepted.
