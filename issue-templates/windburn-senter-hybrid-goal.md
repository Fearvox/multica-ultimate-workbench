# Windburn Senter Hybrid Goal Issue

Use this template when turning a fuzzy Senter-style markdown-agent idea into a
Windburn cognitive-cache goal. This is a specs-first route: the first deliverable
is a reviewed contract, not implementation or live runtime mutation.

## Required Header

```text
/goal
GOAL_MODE: yes
GOAL_MODE_V2: yes
HEAVY_PATH: yes
SELF_AWARENESS_REQUIRED: yes
L2_PRESSURE: yes
```

## RAW_REQUIREMENT

```text
Hybridize Windburn's .learning cognitive cache with a Senter-style markdown
agent OS pattern: markdown vault, progressive disclosure, selector, Goal Mode
loop, and bounded use of spare VM/remote agent runtimes.
```

## SCOPED_EVIDENCE

- Direction doc: `docs/windburn-cognitive-cache-direction.md`
- Dispatch contract: `docs/windburn-cognitive-cache-dispatch.md`
- Goal Mode v2: `skills/workbench-goal-mode-v2/SKILL.md`
- L2 Pressure: `skills/workbench-l2-pressure-gate/SKILL.md`
- Remote agent pattern: `agents/remote/nyc-remote-agents.md`
- External prior art: `https://github.com/SouthpawIN/Senter`

## NON_NEGOTIABLES

- Do not touch Workbench Max.
- Do not mutate Multica daemon, Desktop UI, live runtimes, live agents,
  autopilots, skills, or runtime bindings from this spec issue.
- Do not store secrets, OAuth material, raw transcripts, private screenshots,
  raw request payloads, remote machine names, direct IPs, or live runtime IDs.
- Do not write to Research Vault or run maintenance.
- Do not train or fine-tune a model.
- Do not let a selector promote trust, reset decay, approve source truth, or
  bypass privacy policy.
- Do not let idle VM or remote runtime capacity become an implicit scheduler.

## SPEC_FIRST_GATE

Post this before implementation or child dispatch:

```text
SPEC_PACKET
objective:
hybrid_reference:
vault_shape:
selector_contract:
trust_boundaries:
runtime_pool:
child_slices:
verification_fixtures:
operator_call_conditions:
verdict: READY_TO_DISPATCH | NEEDS_DESIGN | OPERATOR_NEEDED
```

Required decisions:

- Which markdown vault paths are router inputs, trust records, parking, and
  source truth.
- How selector results are logged without becoming evidence.
- Which agent roles may lower confidence, request promotion, challenge beliefs,
  verify evidence, or approve trust increases.
- Which spare runtime roles may be used, with max-active caps and cooldowns.
- Which artifacts are allowed in Git and which stay temp or private.

## RUNTIME_POOL_CONTRACT

```text
capacity_pool:
  Remote Codex Builder:
    use: schema, CLI, fixtures, repo-backed implementation
    authority: pending evidence only
  Remote Hermes Researcher:
    use: long-context synthesis, prior-art pressure, challenger prompts
    authority: pending evidence only
  Remote VM Runner:
    use: browser, sandbox, or GUI proof with VM lease and teardown
    authority: pending evidence only
  Remote Ops Mechanic:
    use: runtime preflight, hygiene, repo-anchor repair
    authority: pending evidence only
```

Rules:

- One owner, issue, repo anchor, TTL, evidence path, and teardown policy per
  runtime lease.
- Remote runtimes use the GitHub repo resource first. Laptop `file://` paths are
  invalid remotely unless the issue proves they are mounted.
- Remote/VM outputs can become pending `.learning` evidence only after sanitized
  review. They cannot directly promote confidence or source truth.
- Runtime mutation, live skill sync, autopilot edits, or daemon/Desktop/core
  changes require a separate approved issue.

## SUCCESS_METRIC

- `SPEC_PACKET` is reviewed and either accepted or returned with a concrete
  blocker.
- Goal Mode v2 `DECISION_PACKET` identifies child slices, owners, max-active
  caps, cooldown, and dedupe key.
- The spec explains how Senter-style selection composes with Windburn trust,
  decay, privacy, challenger, and external-verifier rules.
- The runtime pool can be used for future child issues without exposing secrets
  or treating VM output as trusted memory.

## OPERATOR_CALL_CONDITIONS

Stop and ask the human before:

- any live runtime, agent, skill, autopilot, daemon, Desktop, or core mutation;
- any secret-bearing config or credential access;
- any Research Vault write, ingest, delete, or maintenance run;
- any model training or provider-cost escalation;
- any schema decision that changes public/private defaults;
- any route that requires a specific unavailable remote host or VM provider.

## Required Closeout

```text
GOAL_MODE_V2_CLOSEOUT
goal_id:
objective:
state_machine_path:
decision_packets_produced:
issues_dispatched:
evidence_harvested:
noise_cancelled:
operator_calls:
residual_risk:
archive_actions_taken:
verdict: PASS | FLAG | BLOCK
```
