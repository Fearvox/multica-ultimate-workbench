---
id: tool-error-loop-escaping
stateBefore: |
  Trying to read 3 X.com tweets. Agent attempted: WebFetch (402) → nitter mirror
  (empty) → Playwright browser (closed) → SSH to droplet (no xurl) → brew install
  xurl (no auth) → xurl auth status (no apps). 6 HTTP/fetch/SSH tools from the same
  class, each failing differently, none reconsidering the approach.
actionTried: |
  Repeatedly tried "different tool, same category": direct HTTP fetch, web mirrors,
  headless browser, SSH to remote host, installing the same CLI locally. Each failure
  was treated as a tool-specific error rather than a signal that the entire category
  (direct web/tcp access to X.com) is blocked.
observedDelta: |
  Six failures in ~12 minutes. The actual solution was already documented: Hermes
  had a `social-media/xurl` skill AND an `ult-evo` skill that wraps Grok's native
  `x_search` tool — Grok is X.com's sibling company and can natively fetch tweets.
  Executing `python3 ult-evo-v2.py --search-backend xai --mode agent` retrieved all
  3 tweets in one call with full text, links, and technical details.
inferredReason: |
  RL-trained tool-use policy converges on "tool failed → find similar tool → retry"
  as a local optimum. The model doesn't naturally surface the meta-question: "is
  this entire tool category wrong for this target?" when the first 2-3 attempts
  from a category all fail. Additionally, the model treated the user's prompt
  ("use Hermes's skills") as a fallback rather than the primary routing hint,
  because the RL training weights immediate tool success over verbal redirection.
avoidUntil: |
  When 2+ tools from the same category (HTTP fetch, browser, SSH, CLI install)
  fail against the same target, stop adding more tools from that category.
retryCondition: |
  - A dedicated native integration exists (e.g., Grok x_search for X.com, Exa for
    web search, GitHub CLI for GitHub API).
  - A skill or agent profile documents the correct tool for the target domain.
  - The user explicitly names a tool or skill to use.
trustState: hypothesis
temporal:
  createdAt: "2026-05-05T20:30:00Z"
  observedAt: "2026-05-05T20:13:00Z"
  lastVerifiedAt: null
  lastAccessedAt: "2026-05-05T20:30:00Z"
  ageBucket: fresh
  bucketTransitionAt: "2026-05-12T20:30:00Z"
  stalenessReason: null
---
