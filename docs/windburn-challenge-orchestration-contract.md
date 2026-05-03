# Windburn Challenge Orchestration Contract

Date: 2026-05-03
Status: implementation contract
Depends on:
- `scripts/windburn-verify.mjs`
- `scripts/windburn-promotion-gate.mjs`
- `docs/windburn-materiality-classifier-contract.md`
Feeds:
- `.learning/parking/multica-dispatch-windburn-phase1.md` Block 4

## Purpose

`windburn-challenge.mjs` is the local bridge between a belief that wants promotion and the already-built divergence/materiality gates.

It does not generate truth, call Grok, call any provider, edit `.learning`, or promote a belief. It only assembles a review packet:

```text
belief file -> windburn-verify -> supplied DivergencePacket -> windburn-promotion-gate -> challenge review JSON
```

This lets the trust pipeline ask one question before a human or external verifier acts: "Given this belief and this challenger packet, is promotion blocked, flagged, or locally clear?"

## Role Boundary

| May do | Must not do |
| --- | --- |
| Run the belief verifier and include its structured result | Change belief `trustState`, confidence, freshness, or source-truth state |
| Run the promotion gate on a supplied packet | Generate provider output or call Grok/xAI/Claude |
| Merge verifier and materiality gate outcomes into one challenge review | Treat the challenger or classifier as a truth judge |
| Name required follow-up actions for BLOCK/FLAG outcomes | Silently write challenge review back into the belief file |
| Preserve all stage outputs for auditability | Hide verifier blockers behind a passing materiality gate |

## CLI

```bash
node scripts/windburn-challenge.mjs review --format json \
  --belief .learning/fixtures/challenge/promotion-request-hypothesis.md \
  --packet .learning/fixtures/challenge/packets/promotion-request-no-material.md \
  --belief-dir .learning/fixtures/divergence-gate/beliefs
```

Arguments:

- `review`: required command.
- `--format json|text`: output mode, default `text`.
- `--belief <belief-file.md>`: source belief or promotion candidate.
- `--packet <packet-file.md>`: already-supplied DivergencePacket. For this local slice, packets are fixtures or reviewed artifacts, not provider output.
- `--belief-dir <dir>`: optional corpus drift guard passed through to `windburn-promotion-gate.mjs`.

Exit codes:

- `0` = `PASS`: verifier has no blocking rule, promotion gate passes, no adjacent follow-up.
- `1` = `FLAG`: no blocking rule, but verifier warnings or adjacent follow-up require parking/review notes.
- `2` = `BLOCK`: verifier blockers, invalid packet, authority violation, material alternative, or corpus gate failure.

## Output Contract

```ts
type ChallengeReview = {
  verdict: "PASS" | "FLAG" | "BLOCK";
  no_provider_calls: true;
  belief_file: string;
  belief_id: string | null;
  packet_file: string;
  packet_id: string | null;
  challenge_required: boolean;
  challenge_reasons: string[];
  stages: {
    verify_belief: WindburnVerifyResult;
    promotion_gate: PromotionGateResult;
  };
  promotion: {
    eligible: boolean;
    action: string;
    writes_trust_state: false;
    writes_confidence: false;
    writes_source_truth: false;
  };
  required_actions: string[];
  summary: string;
};
```

## Verdict Composition

1. Run `windburn-verify` on `--belief` and accept statuses `0`, `1`, and `2` as structured stage outputs.
2. Run `windburn-promotion-gate` on `--packet`; pass `--belief-dir` through when present.
3. If the verifier has any `BLOCK` violation, the challenge verdict is `BLOCK`. A passing packet cannot erase a verifier blocker.
4. Else if the promotion gate returns `BLOCK`, the challenge verdict is `BLOCK`.
5. Else if the verifier has warnings or the promotion gate returns `FLAG`, the challenge verdict is `FLAG`.
6. Else the challenge verdict is `PASS`.

Required actions are deterministic:

- verifier blockers -> `fix_belief_self_consistency`
- verifier warnings -> `review_belief_flags`
- material alternatives -> `supervisor_materiality_review`
- adjacent alternatives -> `park_adjacent_alternatives`
- invalid packet / authority violation -> `fix_divergence_packet`
- corpus drift guard failure -> `fix_corpus_gate`

## Challenge Required Detection

`challenge_required` is true when any of these hold:

- the belief has `promotion_request.requested_state`
- verifier rule `verified-requires-challenge-review` appears
- the supplied promotion gate result is not skipped

`challenge_required` does not imply promotion is eligible. It only means the review lane is relevant.

## Fixtures for This Slice

Create focused fixtures under `.learning/fixtures/challenge/`:

```text
.learning/fixtures/challenge/
  promotion-request-hypothesis.md
  invalid-verified-without-review.md
  packets/
    promotion-request-no-material.md
    promotion-request-material.md
```

Expected behavior:

- `promotion-request-hypothesis.md` + `promotion-request-no-material.md` -> `PASS`, promotion eligible, no writes.
- `promotion-request-hypothesis.md` + `promotion-request-material.md` -> `BLOCK`, `supervisor_materiality_review` required.
- `invalid-verified-without-review.md` + `promotion-request-no-material.md` -> `BLOCK`, `fix_belief_self_consistency` required even though the packet is otherwise valid.

## Non-Goals

- No provider adapter.
- No automatic DivergencePacket generation.
- No `.learning` mutation.
- No Supervisor approval simulation.
- No compiler feedback or momentum reset in this slice.

## Verification

Required local checks before shipping:

```bash
node scripts/test-windburn-challenge.mjs
node scripts/test-windburn-promotion-gate.mjs
node scripts/test-windburn-materiality-corpus-eval.mjs
node scripts/test-windburn-materiality-classify.mjs
node scripts/test-windburn-divergence-gate.mjs
node scripts/test-windburn-verify.mjs
git diff --check
git diff --cached --check
```

Ship condition: all checks pass, `git status --short --branch` is clean, and `main` is pushed to `origin/main`.
