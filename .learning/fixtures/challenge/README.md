# Windburn Challenge Fixtures

These fixtures exercise `scripts/windburn-challenge.mjs`, the local-only bridge that composes belief verification with a supplied DivergencePacket and the promotion gate.

- `promotion-request-hypothesis.md` is a clean promotion candidate: hypothesis trust, promotion requested, no trust mutation.
- `invalid-verified-without-review.md` is an intentionally invalid belief: already marked verified without challenge review.
- `packets/promotion-request-no-material.md` is a valid packet with only speculative/off-scope alternatives.
- `packets/promotion-request-material.md` is a valid packet with a material alternative that must block promotion.

Fixtures must stay sanitized. No secrets, raw transcripts, private screenshots, request payloads, tokens, live runtime IDs, direct IPs, or partner/internal details.
