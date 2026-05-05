# Depark Manifest — 2026-05-05

## Trigger
Workbench x Vercel Open Agents Integration Lane created.
docs/workbench-vercel-open-agents-integration-lane.md

## Promoted Specs

| Spec | Parking Path | New Status | Maps To |
|------|-------------|------------|---------|
| verification-harness-spec | `.learning/parking/verification-harness-spec.md` | → absorbed into `docs/workbench-vercel-open-agents-integration-lane.md` | Evidence gate after sandbox run |
| self-consistency-verifier-spec | `.learning/parking/self-consistency-verifier-spec.md` | → absorbed into `docs/workbench-vercel-open-agents-integration-lane.md` | Agent self-review before PR |
| multica-dispatch-windburn-phase1 | `.learning/parking/multica-dispatch-windburn-phase1.md` | → merged into integration lane | Card-to-sandbox dispatch |

## Absorbed Lanes (now unified under integration lane)

| Lane | Status |
|------|--------|
| `hermes-openai-sandbox-adapter-lane.md` | Still valid as spike doc; execution backend #2 |
| `run-finalization-reconciliation-lane.md` | Still valid; maps to Workflow SDK finalization step |
| `capy-process-check-lane.md` | Still valid; Captain/Build = agent-outside-sandbox pattern |

## Next Actions

1. [ ] Deploy Vercel Open Agents fork
2. [ ] Add `execution_provider` to registry card schema
3. [ ] Wire one card → Vercel Sandbox smoke test
4. [ ] Wire deepsec as sandbox capability
5. [ ] auto-review-sweeper trigger on sandbox-produced PR
6. [ ] Runtime Panel display all 3 backends
