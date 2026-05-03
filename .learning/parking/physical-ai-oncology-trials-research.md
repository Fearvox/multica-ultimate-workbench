---
id: research-physical-ai-oncology-trials-20260503
type: source-scout
source_url: https://github.com/kevinkawchak/physical-ai-oncology-trials
source_owner: kevinkawchak
source_repo: physical-ai-oncology-trials
observed_at: 2026-05-03
trustState: parking
confidence: 0.45
explorationMomentum: medium
tags:
  - physical-ai
  - oncology-trials
  - agent-generated-research
  - trust-pipeline-benchmark
  - high-stakes-verification
---

# Physical AI Oncology Trials — Research Parking

## Snapshot

GitHub repo: `kevinkawchak/physical-ai-oncology-trials`

Repository description: "End-to-end physical ai oncology clinical trial
unification."

Observed live metadata on 2026-05-03:
- public repository
- default branch: `main`
- 10 stars
- last updated: 2026-05-03T21:55:30Z
- README presents release `v3.5.0`
- README claims MIT license, Python 3.10/3.11/3.12 support, MCP protocol, and
  Zenodo DOI references

Root-level areas observed:
- `agentic-ai/`
- `digital-twins/`
- `federation/`
- `generative-ai/`
- `national-platform/`
- `new-trial/`
- `patient-journey/`
- `regulatory/`
- `regulatory-submit/`
- `reinforcement-learning/`
- `sponsor/`
- `unification/`

## Why Park This

This looks useful as a high-pressure benchmark corpus for Windburn, not as a
medical or regulatory source of truth.

The repo appears to combine:
- long-running agentic simulation claims
- high-stakes oncology / clinical-trial framing
- regulatory language
- generated papers, scripts, diagrams, and DOI-linked artifacts
- repeated release-style evidence claims over time

That mix is exactly where a trust pipeline should resist premature belief
promotion. It gives us plausible, impressive, high-risk claims that should stay
in `parking` or `hypothesis` until external verification exists.

## Possible Uses

1. **Verifier fixtures**
   - Feed README-derived claims into `windburn-verify`.
   - Ensure high confidence + medical/regulatory framing blocks without
     external evidence.

2. **Divergence gate benchmark**
   - Ask a challenger model for alternative hypotheses:
     - repo is a real runnable framework
     - repo is mostly synthetic documentation
     - repo is a useful simulation scaffold but not clinically validated
   - Measure whether materiality review catches the difference.

3. **Evidence-chain benchmark**
   - Validate claimed DOI links, release notes, scripts, and tests separately.
   - Separate "repo says X" from "X is externally verified."

4. **Agent-generated research hygiene**
   - Study how generated research repos package authority signals:
     badges, release numbers, DOIs, regulatory language, diagrams, and
     benchmark-style metrics.

## Boundaries

- Do not treat repo claims as medical advice, regulatory evidence, clinical
  validation, or scientific truth.
- Do not cite claims from the README as verified without checking primary
  external artifacts.
- Do not run heavy simulations or write to the repo during parking review.
- If revisited, start read-only: clone, inspect tests, verify DOIs, inspect
  generated artifacts, then decide whether it deserves a benchmark lane.

## Revisit Trigger

Use this when Windburn needs a realistic trust-pipeline test case involving
impressive but high-risk claims.

Earliest next action:

```bash
gh repo clone kevinkawchak/physical-ai-oncology-trials /tmp/physical-ai-oncology-trials
cd /tmp/physical-ai-oncology-trials
python scripts/verify_installation.py
```

Only run the next action in a sandbox or throwaway checkout.
