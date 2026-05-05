# Decision Runtime VM Prototype

This prototype proves the Workbench Decision Runtime state machine in a VM/CAPY validation cell before any native macOS app implementation.

It demonstrates:

- shorthand input such as `route stuck branch`;
- cached Decision Futures reranking;
- DecisionPacket creation;
- WorkbenchCompileResult expansion;
- issue anchor before send;
- scoped instruction preview;
- Temporal Pincer closeout before PASS;
- CAPY/VM observer as supporting skeptical evidence;
- repeated-failure submit benchmark for perception/belief/failure updates after a blocked action;

Run:

```bash
npm test
npm run smoke:route-stuck-branch
npm run serve
```

Open `http://127.0.0.1:51280` in the VM browser after `npm run serve`.

Review Evidence:

```bash
npm test
npm run smoke:route-stuck-branch
npm run serve
```

Supervisor checklist: `docs/supervisor-evidence-checklist.md`.

Boundaries:

- no Multica Desktop patch;
- no native app;
- no daemon or core runtime mutation;
- no raw screenshots, transcripts, cookies, OAuth material, tokens, secrets, or request payload persistence;
- UI state is not truth.
