---
id: gm-cockpit-visual-gate
name: GM Cockpit Visual Gate
procedure: "Start prototypes/gm-cockpit/server.mjs, inspect the local cockpit in a browser or vision-capable runtime, ask a bounded layout/public-safety question, keep screenshots outside repo root or ignored capture paths, and close with the exact question plus PASS/FLAG/BLOCK."
preconditions:
  - "Node.js 18+ is available."
  - "The operator accepts local-only browser/vision inspection."
  - "No public screenshot may show raw hosts, credential paths, tokens, or private commands."
validScope: "Goal Mode v2 cockpit visual regression and public-surface safety checks."
trustState: verified
temporal:
  createdAt: 2026-05-08T05:50:00Z
  observedAt: 2026-05-08T05:50:00Z
  lastVerifiedAt: 2026-05-08T05:50:00Z
  lastAccessedAt: 2026-05-08T05:50:00Z
  ageBucket: fresh
  bucketTransitionAt: 2026-05-08T05:50:00Z
  stalenessReason: null
---

## Use

Use this when Goal Mode or GM cockpit work needs a quick visual regression gate
without adding new image-processing dependencies.

## Procedure

1. Start the cockpit:

```bash
node prototypes/gm-cockpit/server.mjs
```

2. Open the local cockpit in a browser or vision-capable runtime.
3. Ask one bounded question:
   - Do the expected adapter panes render?
   - Is the status surface readable?
   - Is public-surface safety preserved?
4. Keep generated `gm-*.png` screenshots out of Git. The repo root pattern is
   ignored, but preferred storage is an ignored local capture directory.
5. Close with:

```text
visual_surface:
question:
result:
public_safety:
verdict: PASS | FLAG | BLOCK
```

## Non-Goals

- Do not change the Goal Mode conductor.
- Do not add an image-processing dependency.
- Do not commit raw screenshots as evidence.
- Do not treat visual proof as a substitute for repo or issue evidence.
