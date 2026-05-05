import { readFile } from "node:fs/promises";

const FIXTURES = Object.freeze({
  context: new URL("../fixtures/repeated-failure-submit.context.json", import.meta.url),
  evidence: new URL("../fixtures/repeated-failure-submit.evidence.json", import.meta.url)
});

export async function runRepeatedFailureSubmitBenchmark(input = {}) {
  const context = input.context ?? await readJson(FIXTURES.context);
  const evidence = input.evidence ?? await readJson(FIXTURES.evidence);
  const initialAction = input.initialAction ?? context.initial_prediction.action;
  const observedDelta = {
    observation_id: evidence.observation_id,
    action_taken: evidence.action_taken,
    page_advanced: evidence.page_advanced,
    error_banner: evidence.error_banner
  };
  const perception = {
    kind: "perception",
    observation_id: evidence.observation_id,
    page_did_not_advance: evidence.page_advanced === false,
    missing_answer_error_visible: evidence.error_banner.visible === true,
    error_message: evidence.error_banner.message
  };
  const belief = input.disableBeliefUpdate
    ? null
    : {
        kind: "belief",
        statement: "Submit is blocked because the required answer has not been selected.",
        supported_by: [evidence.observation_id],
        distinguishes_from_perception: true
      };
  const failure = {
    kind: "failure",
    first_failed_action: evidence.action_taken,
    blocked_actions: input.disableFailureBlock ? [] : [evidence.action_taken],
    unblock_condition: "select_required_answer",
    reason: "Do not click submit again until the missing precondition is satisfied."
  };
  const parking = {
    kind: "parking",
    entries: context.parking_candidates.map((entry) => ({
      ...entry,
      promoted_to_source_truth: false
    })),
    remains_speculative: context.parking_candidates.every((entry) => entry.status === "speculative")
  };
  const sourceTruth = {
    kind: "source_truth",
    fixture_fact_ids: [
      ...(context.source_truth_fact_ids ?? []),
      ...(evidence.source_truth_fact_ids ?? [])
    ],
    fixture_files: ["repeated-failure-submit.context.json", "repeated-failure-submit.evidence.json"],
    promotion_boundary: "Observed delta stays in perception unless a human explicitly promotes a fixture fact.",
    derived_inference_promoted: false,
    human_approval_required: true
  };
  const rejectedRepeatedAction = evidence.action_taken;
  const selectedNextValidAction = input.forceRepeatedAction
    ? rejectedRepeatedAction
    : "select_required_answer";
  const stateUpdateComplete = Boolean(
    perception.page_did_not_advance
      && perception.missing_answer_error_visible
      && belief?.statement
      && failure.blocked_actions.includes(rejectedRepeatedAction)
      && parking.remains_speculative
      && sourceTruth.derived_inference_promoted === false
  );
  const nonRepetitionHeld = selectedNextValidAction !== rejectedRepeatedAction;
  const verdict = stateUpdateComplete && nonRepetitionHeld ? "PASS" : "FLAG";
  const residualRisk = verdict === "PASS"
    ? "Local fixture proves one repeated-failure correction path only; no live UI or broader memory transfer coverage."
    : "State update or non-repetition guard is incomplete in this local fixture run.";

  return {
    benchmark_id: context.benchmark_id,
    scenario: context.scenario,
    initial_prediction: context.initial_prediction,
    initial_action: initialAction,
    observed_delta: observedDelta,
    perception,
    belief,
    failure,
    parking,
    source_truth: sourceTruth,
    rejected_repeated_action: rejectedRepeatedAction,
    selected_next_valid_action: selectedNextValidAction,
    evaluation: {
      state_update_complete: stateUpdateComplete,
      non_repetition_held: nonRepetitionHeld
    },
    verdict,
    residual_risk: residualRisk
  };
}

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}
