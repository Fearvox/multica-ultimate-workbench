# Capy Brief: World Model, Windburn, and Public Narrative

This is a compact handoff for Captain Capy and other external coding agents.

It summarizes the recent human/Codex discussion so Capy can understand the
direction without reading a long chat transcript.

## Status

- Trust level: synthesis / planning context.
- Source-truth status: not source-truth by itself.
- Mutation authority: none.
- Intended use: orientation, issue drafting, review framing, and bounded
  implementation planning.

Capy must still use repo state, GitHub issues, PRs, checks, comments, and
explicit human instructions as the reviewable source of truth.

## Core Thesis

Current LLM agents often change their language without changing their durable
beliefs.

They can say "that failed" and then repeat the same failed action because the
failure was not promoted into an object that constrains future behavior.

The missing layer is a small world model around the model:

```text
observe -> act -> world changes -> update state -> act differently
```

The important capability is not just answering better. It is updating the
agent's internal operating state after the world pushes back.

## Plain Example

Imagine an agent cooking soup.

Bad behavior:

```text
observe: soup is too salty
explain: too much salt was added
action: add more salt
observe: soup is worse
explain: seasoning needs adjustment
action: add more salt again
```

Better behavior:

```yaml
world_state:
  soup_saltiness: too_high

beliefs:
  - soup is already over-salted

blocked_actions:
  - add_more_salt

valid_actions:
  - dilute
  - add_unsalted_ingredients
  - split_batch
```

The same pattern appears in browser/game tasks:

```text
predicted: clicking submit advances the page
actual: page did not change, red error appeared
bad agent: try another selector and click submit again
better agent: submit is blocked until the missing precondition is found
```

## Windburn Object Model

Windburn is the proposed cognitive-cache layer for turning observations and
failures into durable working memory.

It separates:

| Object | Meaning | Example |
| --- | --- | --- |
| `perception` | observed world delta | page did not advance; error banner appeared |
| `belief` | supported interpretation | submit failed because no answer was selected |
| `failure` | action proven unsafe or ineffective under current conditions | do not click submit again before re-observing DOM and selecting an answer |
| `parking` | useful idea without enough evidence | oncology-trial sandbox may test world-state updates |
| `source-truth` | human-approved durable fact | accepted contract, approved protocol, verified repo rule |

The central rule:

> A model-generated answer is never source-truth by itself.

Promotion to `source-truth` requires explicit human approval.

## Why This Matters To Workbench

Workbench already has:

- Self-Awareness for runtime/repo/tool boundary checks.
- Goal Mode for persistent execution.
- L2 Pressure for Research Vault grounding.
- Capy lanes for process observation and Git dialogue.
- Review gates for PASS / FLAG / BLOCK.

Windburn adds a missing object layer:

- what the agent observed;
- what it believes now;
- what failed and should not be repeated;
- what is only parked;
- what has been human-approved.

This lets future runs change behavior from prior reality feedback instead of
only inheriting a long chat transcript.

## Benchmark Direction

The benchmark should score state updates, not only final answers.

First-class metrics:

- Did the agent re-observe after a failed action?
- Did the agent update a belief object?
- Did it avoid repeating a failed action?
- Did it distinguish perception from belief?
- Did it keep speculative research in parking?
- Did it require human approval before source-truth promotion?

Candidate benchmark name:

```text
trial-state-repeated-failure-v0
```

Minimal browser/game analogue:

```text
Given a disabled or precondition-gated submit flow:
1. Agent predicts an action.
2. Action fails.
3. Environment shows a new error.
4. Agent must update state.
5. Agent must not repeat the same failed action.
6. Agent must find the missing precondition.
```

## Research Use Cases

Two safe research tracks were drafted outside this repo:

1. `research/chem`
   - safe chemical/pharma document-retrieval sandbox;
   - evidence extraction, citation grounding, belief updates, refusal boundary;
   - no wet-lab protocols, dosing advice, synthesis routes, or clinical advice.

2. `research/oncology-trial-innovations`
   - deidentified oncology-trial operations sandbox;
   - trial operations treated as a constrained physical-AI-like environment;
   - labs update, scans arrive, adverse events emerge, eligibility changes;
   - all patient-facing or protocol-facing source-truth requires human approval.

Important boundary:

> Public repos, ORCID records, Zenodo papers, ChemRxiv metadata, and model
> outputs start in `parking` or, at most, as cited `belief` candidates.

They do not become local medical source-truth without explicit approval.

## Public Narrative Direction

The external review of the public GitHub profile found the strongest gap was
not code ability. It was narrative routing.

The public profile should explain that the repos form an AI-native operating
stack:

| Layer | Role |
| --- | --- |
| `Evensong` | agent-system workbench and research lab |
| `multica-ultimate-workbench` | coordination, review, and trust pipeline |
| `Windburn` | cognitive cache: perception, belief, failure, parking, source-truth |
| `Research Vault` | durable retrieval and research memory |
| `DASH / zonicdesign.art` | public surface and design-infra layer |

Recommended public positioning:

```text
I build local-first agent operating systems, verifiable AI workbenches, and
memory-driven runtime infrastructure.
```

Blog/content decision:

- Canonical publication surface: `zonicdesign.art/writing`.
- Optional alias: `blog.zonicdesign.art`.
- Reference/manual surface: `docs.zonicdesign.art`.

The blog is narrative and distribution. Docs are contracts, commands, and
verification gates.

## Human Collaboration Pattern

Recent usage metrics suggested two complementary work modes:

- Hengyuan / operator side: high-throughput runtime and agent orchestration.
- Ryan / collaborator side: deeper IDE/CLI sessions with fewer but heavier runs.

Do not treat this as source-truth about people. Treat it as a useful routing
hypothesis: one side is good at building the factory, the other at drilling into
deep implementation/research work.

## Memory Surface Note

Markdown today:
  durable, reviewable, GitHub-native memory surface.

Cutdown later:
  possible app-native structured document / agent-readable AST substrate when parser/tooling exists.

Cutdown is still a draft, pre-1.0, and only a future-fuzzy spike candidate for now. Do not migrate existing docs from Markdown or add parser/tooling from this note alone.

## What Capy Should Do With This

Capy may:

- use this brief as orientation;
- propose issues that turn these ideas into bounded implementation or docs work;
- review whether a proposed Windburn change preserves source-truth boundaries;
- inspect PRs for repeated-action failure handling;
- suggest benchmark fixture shapes;
- help polish public README surfaces if explicitly assigned.

Capy must not:

- mutate Multica daemon, Desktop UI, core runtime, live skills, OAuth, secrets,
  or agent bindings from this brief alone;
- promote any model-generated belief into source-truth;
- treat public medical or chemical research as operational truth;
- claim a Capy/VM lane is runnable without lease, env injection, and reachable
  Computer API proof;
- replace GitHub, CI, repo state, or review evidence with chat memory.

## Suggested Next Issues

If the operator asks Capy to continue, split work into small issues:

1. `WINDBURN_OBJECT_MODEL_DOC`
   - Add or update a Workbench doc explaining perception, belief, failure,
     parking, and source-truth.

2. `REPEATED_FAILURE_BENCHMARK_FIXTURE`
   - Add a fixture to the decision-runtime VM that forces an agent to avoid a
     repeated failed action after a world-state delta.

3. `CAPY_REVIEW_RULE_REPEAT_FAILURE`
   - Teach Capy review output to flag repeated action attempts that ignore a
     newly observed failure.

4. `PUBLIC_PROFILE_START_HERE`
   - Draft or review a GitHub profile README and `START_HERE` repo map that
     explains the Fearvox repo stack.

5. `WRITING_SURFACE_SPIKE`
   - Add a `zonicdesign.art/writing` route for the first long-form article:
     "Why Agent Systems Need More Than Chat."

Each issue should name the repo anchor, write scope, verification command, and
residual risk before work begins.

## One-Line Summary

The direction is to make agents less like fluent amnesiacs and more like
reviewable operators with durable perceptions, beliefs, failures, and
human-approved truth.
