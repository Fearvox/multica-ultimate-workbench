import test from "node:test";
import assert from "node:assert/strict";
import { STATES } from "../src/state-machine.mjs";
import { runRouteStuckBranchSimulation } from "../src/simulator.mjs";

test("route stuck branch runs full decision chain", async () => {
  const result = await runRouteStuckBranchSimulation();

  assert.deepEqual(result.state_sequence, [
    STATES.IDLE,
    STATES.PREDICTING,
    STATES.USER_HINT,
    STATES.FUTURE_SELECTED,
    STATES.WORKBENCH_COMPILE,
    STATES.HUMAN_CONFIRM,
    STATES.DISPATCHED,
    STATES.OBSERVING,
    STATES.CLAIM_GATE,
    STATES.LEARN
  ]);
  assert.equal(result.user_hint, "route stuck branch");
  assert.equal(result.selected_future_id, "future-qa-reproduce-checks");
  assert.equal(result.decision_packet.selected_future_id, "future-qa-reproduce-checks");
  assert.equal(result.compile_result.issue_anchor.issue_id, "EVENS-007");
  assert.equal(result.preview_receipt.live_send, false);
  assert.deepEqual(result.keypress_no_llm_evidence.checkpoint_calls, []);
  assert.equal(result.keypress_no_llm_evidence.workbench_compile_called_on_keypress, false);
  assert.equal(result.keypress_no_llm_evidence.issue_mutation_on_keypress, false);
  assert.equal(result.pincer_verdict.verdict, "BLOCK");
  assert.equal(result.raw_artifacts_saved, false);
});

test("focus guard route skips full temporal pincer", async () => {
  const result = await runRouteStuckBranchSimulation({
    userHint: "我真的需要下一步 automation babysitter 防止被新想法打断"
  });

  assert.equal(result.selected_future_id, "future-focus-guard-next-action");
  assert.equal(result.compile_result.route, "focus-guard");
  assert.equal(result.compile_result.pincer_required, false);
  assert.equal(result.pincer_verdict.verdict, "READY");
  assert.deepEqual(result.pincer_verdict.missing_proof, []);
});
