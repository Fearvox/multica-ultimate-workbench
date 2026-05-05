# ActiveMemoryPacket

Use this template when a Workbench, Windburn, Evensong, Research Vault, or Goal
Mode cycle needs memory that changes future action policy, not just passive
retrieval. Keep packets public-safe unless a private runtime explicitly owns a
separate local-only memory store.

## Non-Negotiables

- Do not store secrets, OAuth material, private transcripts, raw screenshots,
  raw request payloads, private infrastructure details, or live runtime IDs.
- Do not let model-only agreement promote `confidence`, `trust_state`, or source
  truth.
- Separate exploration energy from trust: high `exploration_momentum` is not a
  confidence increase.
- Use source URLs and repo-relative paths for public-safe packets.
- Prefer `write_decision: defer` when evidence is source-claimed but not locally
  verified.

## Packet Fields

```yaml
claim: ""
source_refs:
  - ""
evidence_type: "source_claim | repo_evidence | rv_note | issue_evidence | tool_delta | verifier_result"
causal_delta: ""
trust_state: "parking | hypothesis | verified | trusted | deprecated"
confidence: "low | medium | high"
exploration_momentum: "low | medium | high"
created_at: "YYYY-MM-DDTHH:MM:SSZ"
observed_at: "YYYY-MM-DDTHH:MM:SSZ"
last_verified_at: null
privacy: "public-safe | local-only | secret-adjacent"
write_decision: "write | defer | reject | update_existing"
retrieval_keys:
  - "Workbench"
  - "Windburn"
  - "Evensong"
  - "Research Vault"
  - "active memory"
  - "Goal Mode"
next_verification: ""
```

## Field Guidance

| Field | Meaning |
| --- | --- |
| `claim` | One memory-worthy proposition that should affect future routing or policy. |
| `source_refs` | URLs, RV entry paths, issue IDs, or repo-relative paths supporting the claim. |
| `evidence_type` | The strongest current evidence class; do not overstate source claims as verifier results. |
| `causal_delta` | How the packet should change future behavior, dispatch, or review. |
| `trust_state` | Current trust bucket; agents may lower trust or request promotion, not self-promote. |
| `confidence` | Reliability based on evidence, not enthusiasm. |
| `exploration_momentum` | Whether the route is worth probing next, independent of confidence. |
| `created_at` | Packet creation time. |
| `observed_at` | When the underlying evidence was observed. |
| `last_verified_at` | Last external/tool verification time, or `null` if not yet verified. |
| `privacy` | Public-safe by default; anything secret-adjacent stays out of Git/RV public notes. |
| `write_decision` | Whether to write, defer, reject, or update an existing memory object. |
| `retrieval_keys` | Search aliases required for RV/repo discoverability. |
| `next_verification` | Smallest check that could promote, lower, or retire the packet. |

## Example: RV Active-Memory Angle

```yaml
claim: "Workbench/Windburn should prioritize active, structured, verifiable agent memory over passive recall for the next autoresearch loop."
source_refs:
  - "https://blog.walrus.xyz/memwal-long-term-memory-for-ai-agents/"
  - "https://www.arxiv.org/pdf/2603.19935"
  - "https://arxiv.org/abs/2604.07877v1"
  - "https://arxiv.org/html/2602.22769v2"
  - "docs/windburn-cognitive-cache-direction.md"
  - "docs/windburn-divergence-gated-trust-research.md"
  - "skills/workbench-goal-mode-v2/SKILL.md"
  - "issue-templates/active-memory-packet.md"
evidence_type: "source_claim"
causal_delta: "Future Goal Mode v2 and Windburn memory work should write typed packets with evidence, trust, privacy, time, and retrieval keys before using memory to change policy."
trust_state: "hypothesis"
confidence: "medium"
exploration_momentum: "high"
created_at: "2026-05-04T16:02:28Z"
observed_at: "2026-05-04T12:04:32Z"
last_verified_at: null
privacy: "public-safe"
write_decision: "write"
retrieval_keys:
  - "Workbench"
  - "Windburn"
  - "Evensong"
  - "Research Vault"
  - "active memory"
  - "Goal Mode"
next_verification: "Run scripts/check-active-memory-discoverability.mjs and verify the sanitized Research Vault note is returned by each retrieval key."
```

## Discoverability Checklist

Before closing an issue that writes an ActiveMemoryPacket:

1. Run `node scripts/check-active-memory-discoverability.mjs` from the repo root.
2. Confirm each required retrieval key is present in `retrieval_keys`:
   `Workbench`, `Windburn`, `Evensong`, `Research Vault`, `active memory`,
   `Goal Mode`.
3. If a Research Vault entry is written, verify each required key with bounded RV
   search and record before/after evidence in the issue closeout.
4. If any key fails, update the packet instead of creating duplicate memory.
