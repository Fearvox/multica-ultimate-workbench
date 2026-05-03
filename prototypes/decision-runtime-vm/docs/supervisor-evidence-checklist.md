# Supervisor Evidence Checklist

Supervisor review must receive evidence that the VM/CAPY prototype proves the local decision state machine without claiming live backend truth from UI state alone.

Required evidence:

- state transition log for `IDLE -> PREDICTING -> USER_HINT -> FUTURE_SELECTED -> WORKBENCH_COMPILE -> HUMAN_CONFIRM -> DISPATCHED -> OBSERVING -> CLAIM_GATE -> LEARN`;
- `DecisionPacket` JSON;
- `WorkbenchCompileResult` JSON;
- proof that `USER_HINT` rerank did not call LLM, Workbench compile, issue create, or dispatch;
- issue anchor proof before scoped instruction preview;
- scoped instruction text;
- evidence gate required proof list;
- Temporal Pincer verdict for a false PASS claim;
- CAPY/VM observer result marked supporting;
- primary truth source comparison from repo, Multica, and GitHub fixtures;
- sanitized output only, with no raw screenshots, transcripts, cookies, OAuth material, tokens, secrets, or request payloads.

Validation commands:

```bash
npm test
npm run smoke:route-stuck-branch
npm run serve
```

Expected smoke markers:

```text
DECISION_RUNTIME_VM_SMOKE
user_hint: route stuck branch
state_sequence: IDLE>PREDICTING>USER_HINT>FUTURE_SELECTED>WORKBENCH_COMPILE>HUMAN_CONFIRM>DISPATCHED>OBSERVING>CLAIM_GATE>LEARN
issue_anchor: EVENS-007
target_agent: QA Verifier
keypress_checkpoint_calls: 0
workbench_compile_called_on_keypress: false
issue_mutation_on_keypress: false
pincer_verdict: BLOCK
raw_artifacts_saved: false
```

Browser validation:

- default URL: `http://127.0.0.1:51280/`;
- closeout demo URL: `http://127.0.0.1:51280/?claim=1`;
- default URL must show `shorthand intent`, ranked futures, and no compile result until confirmation;
- closeout demo URL must show issue anchor `EVENS-007`, scoped instruction preview, and Temporal Pincer `BLOCK`.

Verdict rule:

- `PASS` only when tests pass, smoke output contains all expected markers, browser surface renders, and no raw or secret-like artifacts are persisted.
- `FLAG` if browser screenshot is unavailable but CLI proof is complete.
- `BLOCK` if any PASS/closeout claim depends on CAPY UI state alone.
