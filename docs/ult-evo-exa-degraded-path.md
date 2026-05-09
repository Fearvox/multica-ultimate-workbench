# ult-evo Exa Degraded Path

This note records the public-safe degraded-path contract for autoresearch
cycles that request Exa-only fast search.

## Contract

When an operator requests:

```bash
ult-evo --search-backend exa --exa-type fast --tools search --json
```

and Exa retrieval succeeds, model synthesis failure must not discard the source
results. The acceptable outcomes are:

- return the source results as normal search JSON; or
- return a partial JSON payload with `MODEL_SYNTHESIS_DEGRADED`, `partial: true`,
  and the retrieved source list intact.

The degraded result must not include raw API keys, provider account IDs, raw
private payloads, hostnames, IP addresses, credential paths, or local absolute
paths. A redacted class such as `quota_or_model_unavailable` is enough for the
model failure.

## Observed Failure

During the DAS-1212 dogfood loop, an Exa-fast/search-oriented invocation lost
the whole cycle after an unrelated xAI quota failure. A fallback web search
then returned usable official/arXiv sources, which shows the topic and source
retrieval were viable. The failure layer was the helper's synthesis degradation
path, not the research query.

## Owner Layer

The project-bound Workbench and Windburn repositories do not contain an
`ult-evo` executable or implementation for `--search-backend` / `--exa-type`.
In the checked runtime, `ult-evo` was not on `PATH`.

The visible Hermes layer does contain a direct Exa retrieval path in
`tools.web_tools`: `web_search_tool()` dispatches to `_exa_search()` when the
web backend is Exa, and `_exa_search()` returns URL/title/highlight JSON without
calling an auxiliary model. That means a retrieval-only fallback is available
even when xAI/model synthesis is unavailable.

## Operator Fallback

If `ult-evo` fails with a model quota or synthesis error after Exa retrieval,
do not rerun the same model-coupled command as the only recovery attempt. Use a
retrieval-only Exa path and preserve the JSON sources for the cycle report.

With `EXA_API_KEY` already present in the operator-owned environment:

```bash
PYTHONPATH="${HERMES_AGENT_DIR}${PYTHONPATH:+:$PYTHONPATH}" python3 - <<'PY'
import json
from tools.web_tools import _exa_search

query = "public safe query"
print(json.dumps(_exa_search(query, limit=5), indent=2, ensure_ascii=False))
PY
```

Use `HERMES_AGENT_DIR` to point at the Hermes source checkout that contains
`tools/web_tools.py`. Do not paste API keys into the command or into issue
comments.

## Regression Check

This repository includes a network-free check that proves the retrieval-only
path returns Exa-style JSON without any model synthesis:

```bash
python3 scripts/check-ult-evo-exa-degraded-path.py
```

The check uses a fake Exa client and a placeholder key, so it does not read real
credentials or contact Exa/xAI.

## Patch Target For ult-evo

If the `ult-evo` wrapper is patched in its owning package, handle the execution
in two phases:

1. Run Exa search and store the source list before any model call.
2. If synthesis raises a quota, billing, rate-limit, or unavailable-model error,
   return a partial JSON payload with `MODEL_SYNTHESIS_DEGRADED` and the stored
   sources instead of exiting nonzero with no results.

Only a failure before source retrieval should fail the search cycle outright.
