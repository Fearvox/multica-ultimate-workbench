# Review Issue Template

## Review Target

- Branch/commit:
- Files:
- User goal:

## Review Mode

- Code review
- Design review
- Security review
- Evidence review

## Findings Format

Start every review with:

```text
VERDICT: PASS / FLAG / BLOCK
VERDICT_SUMMARY: three lines or fewer; what passed, what is risky, and the next action
EVIDENCE:
```

List findings first, ordered by severity.

For each finding:

- Severity:
- File/path:
- Evidence:
- Why it matters:
- Fix guidance:

## Scope

Review only the target unless blast radius requires related files.
