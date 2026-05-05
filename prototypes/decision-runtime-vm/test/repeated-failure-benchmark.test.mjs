import test from "node:test";
import assert from "node:assert/strict";
import { runRepeatedFailureSubmitBenchmark } from "../src/repeated-failure-benchmark.mjs";

test("repeated failure benchmark records failed submit and updates durable state", async () => {
  const result = await runRepeatedFailureSubmitBenchmark();

  assert.equal(result.initial_action, "click_submit");
  assert.equal(result.failure.first_failed_action, "click_submit");
  assert.equal(result.rejected_repeated_action, "click_submit");
  assert.equal(result.perception.kind, "perception");
  assert.equal(result.perception.page_did_not_advance, true);
  assert.equal(result.perception.missing_answer_error_visible, true);
  assert.equal(result.source_truth.kind, "source_truth");
  assert.equal(result.source_truth.derived_inference_promoted, false);
  assert.deepEqual(result.source_truth.fixture_files, ["repeated-failure-submit.context.json", "repeated-failure-submit.evidence.json"]);
  assert.equal(result.source_truth.promotion_boundary.includes("Observed delta stays in perception"), true);
  assert.equal(Array.isArray(result.source_truth.fixture_fact_ids), true);
  assert.equal(result.source_truth.fixture_fact_ids.length, 6);
  assert.equal(result.belief.statement, "Submit is blocked because the required answer has not been selected.");
  assert.deepEqual(result.failure.blocked_actions, ["click_submit"]);
  assert.equal(result.failure.unblock_condition, "select_required_answer");
  assert.equal(result.selected_next_valid_action, "select_required_answer");
  assert.notEqual(result.selected_next_valid_action, "click_submit");
  assert.equal(result.parking.remains_speculative, true);
  assert.equal(result.parking.entries[0].status, "speculative");
  assert.equal(result.parking.entries[0].promoted_to_source_truth, false);
  assert.equal(result.evaluation.state_update_complete, true);
  assert.equal(result.evaluation.non_repetition_held, true);
  assert.equal(result.verdict, "PASS");
});

test("repeated failure benchmark flags missing belief update", async () => {
  const result = await runRepeatedFailureSubmitBenchmark({ disableBeliefUpdate: true });

  assert.equal(result.belief, null);
  assert.equal(result.evaluation.state_update_complete, false);
  assert.equal(result.verdict, "FLAG");
});

test("repeated failure benchmark flags repeated submit attempts", async () => {
  const result = await runRepeatedFailureSubmitBenchmark({ forceRepeatedAction: true });

  assert.equal(result.selected_next_valid_action, "click_submit");
  assert.equal(result.evaluation.state_update_complete, true);
  assert.equal(result.evaluation.non_repetition_held, false);
  assert.equal(result.verdict, "FLAG");
});


test("repeated failure benchmark applies initialAction override consistently", async () => {
  const result = await runRepeatedFailureSubmitBenchmark({ initialAction: "click_submit_override" });

  assert.equal(result.initial_prediction.action, "click_submit");
  assert.equal(result.initial_action, "click_submit_override");
  assert.equal(result.observed_delta.action_taken, "click_submit_override");
  assert.equal(result.failure.first_failed_action, "click_submit_override");
  assert.deepEqual(result.failure.blocked_actions, ["click_submit_override"]);
  assert.equal(result.rejected_repeated_action, "click_submit_override");
  assert.equal(result.selected_next_valid_action, "select_required_answer");
  assert.equal(result.evaluation.state_update_complete, true);
  assert.equal(result.evaluation.non_repetition_held, true);
  assert.equal(result.verdict, "PASS");
});
