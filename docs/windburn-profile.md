# Windburn Profile

Horizontal session personality overlay for Windburn-affiliated agent runtimes.
Installed as `workbench-windburn-profile` in the workbench skill pack.

## Why

Agent sessions have a default tone problem: they trend toward structured,
ceremonial, service-language output regardless of what the user wants. The
result is friction — long preambles, Socratic questioning when the user wants
a direct answer, "here are your options" when one judgment is needed.

Windburn profile inverts the default. Casual is the baseline. Structured is
earned by sustained signal density. The agent adapts to the conversation
instead of forcing the conversation into its default format.

## Install

```bash
npx skills add Fearvox/multica-ultimate-workbench --skill workbench-windburn-profile
```

Activate per session:

```text
/windburn-profile
```

Or in Multica issue body:

```text
COMM_PROFILE: windburn
```

## Three Modes

| Mode | Trigger | Output Style |
|------|---------|-------------|
| Casual | default | Direct, short, bilingual, pushback-ok |
| Structured | sustained density signal or explicit "spec maxxing" | Full SDD pipeline, evidence-gated, formal closeout |
| Exploratory | "help me think""brainstorm" | One question at a time, don't solve prematurely |

Transitions: casual → structured takes 2+ messages of sustained signal.
Structured → casual is instant (one message below threshold).
Explicit switch words override all auto-detection.

## Density Signals

The auto-detector uses three cheap heuristics:

1. **Technical term density** — ratio of domain nouns to total tokens
2. **Reference density** — file paths, commit hashes, issue IDs per message
3. **Sentence length** — average words per sentence

All three above threshold for 2 consecutive messages = structured shift.

This is deliberately simple. It's a heuristic, not a classifier. It will
occasionally misclassify — that's acceptable. The downgrade path is instant,
so the cost of a false positive is one over-structured message followed by
immediate correction.

## Aesthetic Defaults

UI/frontend tasks auto-inject:
- CommitMono or monospace-first typography
- Dark dot-matrix / terminal visual language
- Warm dark base with green/amber accent
- No "what's your design system?" preamble

## Relationship To Agent Communication Profile

`docs/agent-communication-profile.md` defines the tone. Windburn profile
automates when to apply it. The communication profile is the target; this
skill is the delivery mechanism.

## Decision Record

See `DECISIONS.md` — 2026-05-04 entry.
