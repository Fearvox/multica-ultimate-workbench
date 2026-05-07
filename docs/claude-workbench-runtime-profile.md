# Claude Workbench Runtime Profile

Workbench Claude Code runs should pick a model tier explicitly, not inherit
whichever model the user's last chat happened to select. This profile records
the default Claude Official model allocation for the workbench and the boundary
that keeps it separate from DeepSeek, OpenRouter, Pi, OpenCode, and other
providers.

This file is the source-of-truth for **policy**. It does not mutate
`~/.claude/settings.json`, the Multica daemon, Capy settings, or any provider
auth.

## Provider Scope

This profile owns one provider key only: `claude` (Claude Official, surfaced in
Superconductor as `Claude Code`). It enumerates Anthropic-hosted models reached
through the trusted runtime — not third-party Anthropic-compatible mirrors.

Out of scope, by design:

- `pi` — Anthropic-flavored ids exposed through the Pi router are a separate
  provider and must be selected through that provider key, not by aliasing into
  Claude Official.
- `opencode`, `openrouter`, `ollama`, `ollama-cloud`, `xai`, `openai`, `codex`,
  `nvidia` — independent providers with independent auth and independent
  reasoning-effort ceilings.

Do not mix these into Claude Official global env, and do not encode their model
ids in this profile.

## Default Tier Allocation

| Tier | Provider | Model id | Reasoning | Use for |
| --- | --- | --- | --- | --- |
| `default` | `claude` | `claude-sonnet-4-6` | `high` | Heavy coding, ordinary patches, Standard Path implementation, Workbench Admin / Architect / Docs work, most inner+outer Ring Claude tasks |
| `xhigh` | `claude` | `claude-opus-4-7[1m]` | `max` | Hardest reasoning, root-cause analysis, Heavy Path Supervisor review, architecture verdicts, Temporal Pincer verification on `PASS` / `done` / `ready-to-merge` claims |
| `cheap` | `claude` | `claude-haiku-4-5` | `low` | Fast Path triage, ACKs, summaries, image OCR sub-agents, batch lightweight read-only work |

Notes that matter when a launcher copies these values:

- The `claude` provider in Superconductor accepts reasoning efforts
  `low | medium | high | max`. It does **not** expose `xhigh`. The tier label
  `xhigh` here is a workbench role label, not a reasoning-effort enum value.
  Heavy reasoning under this tier maps to `reasoning_effort = max`.
- The `[1m]` suffix on `claude-opus-4-7[1m]` selects the 1M-context variant.
  Drop the suffix only if the task explicitly does not need long context.
- `claude-sonnet-4-6` and `claude-haiku-4-5` do not currently expose a `[1m]`
  variant in the `claude` provider.

## Selection Surfaces

These are the surfaces that should consume this policy. None of them are
mutated by this doc; they read from it.

- **Superconductor** — `sc chat new --provider claude --model <id>
  --reasoning <effort>` (or `sc chat send … --model … --reasoning …`).
  `.sc/last-chat-settings.json` is per-tab UI memory and is **not** policy.
- **Claude Code CLI** — when a task invokes `claude` directly, the model field
  in `~/.claude/settings.json` should stay `null` (auto) for the user's normal
  desktop use. Per-task overrides belong on the launcher command line, not in
  the global settings file.
- **Flue agent harness** — already enumerates `anthropic/claude-sonnet-4-6` and
  `anthropic/claude-opus-4-7` in
  [docs/flue-agent-harness-lane.md](./flue-agent-harness-lane.md). Those ids
  are routed through Flue's own model registry, not through the Claude
  Official `claude` provider key. Keep them aligned with the tier choices here
  but do not collapse the two namespaces.

## Provider Boundary Rules

1. Auth and provider tokens stay in the trusted runtime environment.
   Repo files, issue comments, PR descriptions, screenshots, and Capy/Sanity
   records must not contain them.
2. Do not edit `~/.claude/settings.json` `env` to embed third-party provider
   keys, base URLs, or proxy endpoints. Those belong on the third-party
   provider's own profile, never under the Claude Official surface.
3. Do not alias a third-party Anthropic-compatible model into the `claude`
   provider key. Use the third-party provider key (`pi`, `opencode`,
   `openrouter`, …) directly.
4. Per-task overrides (model, reasoning, context window) are explicit on the
   launcher invocation, not silent defaults.

## Version Drift (current snapshot)

Captured live at the time of writing for evidence; refresh on the next
runtime-hygiene pass:

- `claude --version` → `2.1.132 (Claude Code)` on the active workbench host.
- A previous build is preserved on `PATH` as `claude-2.1.92`. Use it only as a
  fallback when a regression in the current build is suspected; do not pin
  workbench tasks to it by default.
- `ccswitch` is **not** on `PATH`. This profile does not introduce it as a new
  dependency.

If a future run observes a different `claude --version`, update this section
in a separate small commit so the drift is preserved in `git log`, not lost.

## Optional Follow-up: example config file

If a future task needs a machine-readable form of this policy (for example, to
let a launcher load tier → model mapping without parsing markdown), add:

```text
config/multica-workbench-claude-profile.example.json
```

with shape:

```json
{
  "provider_key": "claude",
  "tiers": {
    "default": { "model_id": "claude-sonnet-4-6",   "reasoning_effort": "high" },
    "xhigh":   { "model_id": "claude-opus-4-7[1m]", "reasoning_effort": "max"  },
    "cheap":   { "model_id": "claude-haiku-4-5",    "reasoning_effort": "low"  }
  },
  "boundary": {
    "this_file_owns": ["claude-official"],
    "do_not_mix_in": ["pi", "opencode", "openrouter", "ollama", "ollama-cloud", "xai", "openai", "codex", "nvidia"]
  }
}
```

That file is **not** created by this commit. Add it only when a launcher
actually consumes it; otherwise this markdown remains the sole source of
truth and stays cheap to read.

## Proposed Roster Field (not applied here)

A future, separately reviewed change to
[agents/AGENT_ROSTER.md](../agents/AGENT_ROSTER.md) may add a `Claude Tier`
column for rows whose `Preferred Runtime` includes Claude Code. Suggested
mapping for that future change:

| Agent | Suggested tier |
| --- | --- |
| Workbench Admin | `default` |
| Workbench Supervisor | `xhigh` |
| Workbench Synthesizer | `default` |
| Claude Architect | `xhigh` |
| Claude Docs | `default` |
| Memory Curator | `cheap` |

Rows whose `Preferred Runtime` is Codex, Hermes, or Mimo are unaffected.

This profile **does not** edit `AGENT_ROSTER.md`. Land that column in its own
review so the roster history stays focused on routing changes, not on
documentation back-references.

## Verification

For a completed run that consumed this policy:

```bash
git -C "$LOCAL_WORKBENCH_REPO" diff --check
rg -n "claude-(opus|sonnet|haiku)-4-(5|6|7)" docs/claude-workbench-runtime-profile.md
claude --version
command -v claude-2.1.92 || echo "fallback-not-installed"
```

Closeout should report:

```text
CLAUDE_WORKBENCH_PROFILE_REPORT
runtime_surface:
selected_tier: default | xhigh | cheap
selected_model_id:
selected_reasoning_effort:
provider_boundary_respected: yes | no
version_observed:
fallback_present: yes | no
verification:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

`PASS` requires the launcher to have used a tier from the table above, with the
matching model id and reasoning effort, and no third-party provider id leaking
into the Claude Official surface. `FLAG` is correct when the policy is read but
the launcher hard-codes a model outside the table for a justified reason that
needs review. `BLOCK` is correct when third-party provider auth, base URL, or
model id has been wired into Claude Official env, or when an unredacted token
or private host appears anywhere in this profile or its consumers.
