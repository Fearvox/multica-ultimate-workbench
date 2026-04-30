# Workbench Research

Use this skill for research, architecture discovery, vendor docs, benchmark reading, and unknown-system analysis.

## Research Standard

- Read the real system first when local state exists.
- Prefer primary sources, live commands, local files, and official docs.
- Separate confirmed facts, source claims, and inference.
- Treat current software behavior, API shape, prices, versions, and docs as drift-prone.
- Cite file paths, command names, issue/comment IDs, or source URLs when they support a claim.
- Use targeted reads first: indexes, `rg`, `jq`, table summaries, and exact IDs before full documents or full histories.
- Summarize large sources before handing them to another agent.

## Research Output

Return:

- `QUESTION`: what was investigated.
- `CONFIRMED`: facts with evidence.
- `UNCERTAIN`: assumptions or unresolved gaps.
- `OPTIONS`: viable paths with tradeoffs.
- `RECOMMENDATION`: the smallest next action.
- `SOURCES`: local paths, commands, issue IDs, or URLs used.

## Research Boundaries

- Do not present speculation as fact.
- Do not copy secrets or private tokens into reports.
- Do not rewrite working architecture while researching it.
- If source material conflicts, explain the conflict and prefer live runtime evidence.
- Stop if the next read would be broad and low-yield; report the smaller evidence query needed instead.
