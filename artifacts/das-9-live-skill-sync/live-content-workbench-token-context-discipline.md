# Workbench Token Context Discipline

Use this skill when a task may pull large docs, long issue histories, many skills, big logs, or expensive model context.

## Context Budget Rules

- Start with indexes, file lists, IDs, summaries, and targeted searches.
- Read the smallest slice that can answer the current question.
- Prefer `rg`, `jq`, concise table output, and explicit IDs over dumping entire histories.
- Summarize large sources before passing them to another agent.
- Attach only role-relevant skills; more skills are not automatically better.
- Stop and report if two consecutive reads are too large or mostly irrelevant.

## Cache And Quota Awareness

- Distinguish fresh input, output, cache read, and cache write when usage is under investigation.
- Do not assume dashboard usage is wrong without local/request-level evidence.
- Avoid repeated full-context reruns when a comment ID, file path, or artifact can be cited instead.
- Keep Workbench Max and existing private agents out of broad binding changes unless explicitly assigned.

## Output Contract

Return:

- `CONTEXT_USED`: exact files, comments, commands, or IDs read.
- `SKIPPED`: intentionally avoided broad reads and why.
- `SUMMARY`: compact facts needed for the next step.
- `NEXT_SMALL_READ`: the next targeted evidence query, if any.
- `TOKEN_RISK`: normal / elevated / blocked.
