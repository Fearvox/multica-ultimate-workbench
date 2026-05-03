import { readFile } from "node:fs/promises";
import { createFixtureAdapters } from "./adapters.mjs";
import { createDecisionPacket } from "./decision-packet.mjs";
import { rankCachedFutures } from "./local-ranker.mjs";
import { createStateMachine, assertStateInvariant, STATES } from "./state-machine.mjs";
import { runCloseoutPincer } from "./temporal-pincer.mjs";
import { compileDecision } from "./workbench-compiler.mjs";

const FIXTURES = Object.freeze({
  context: new URL("../fixtures/route-stuck-branch.context.json", import.meta.url),
  futures: new URL("../fixtures/route-stuck-branch.futures.json", import.meta.url),
  evidence: new URL("../fixtures/route-stuck-branch.evidence.json", import.meta.url)
});

export async function runRouteStuckBranchSimulation(input = {}) {
  const userHint = input.userHint ?? "route stuck branch";
  const context = input.context ?? await readJson(FIXTURES.context);
  const futures = input.futures ?? await readJson(FIXTURES.futures);
  const evidence = input.evidence ?? await readJson(FIXTURES.evidence);
  const adapters = input.adapters ?? createFixtureAdapters({ context, futures, evidence });
  const machine = createStateMachine();
  const checkpointCalls = [];

  machine.transition(STATES.PREDICTING, { source: "fixture-context" });
  machine.transition(STATES.USER_HINT, { user_hint: userHint, cache_only: true });

  const rankedFutures = rankCachedFutures(userHint, adapters.futures.readCachedFutures(), context, {
    onCheckpointCall(name) {
      checkpointCalls.push(name);
    }
  });
  assertStateInvariant(STATES.USER_HINT, { checkpointCalled: checkpointCalls.length > 0 });

  const selectedFuture = rankedFutures[0];
  machine.transition(STATES.FUTURE_SELECTED, { selected_future_id: selectedFuture.id });

  const decisionPacket = createDecisionPacket(userHint, selectedFuture, context);
  const compileResult = compileDecision(decisionPacket, adapters);
  machine.transition(STATES.WORKBENCH_COMPILE, { compileResult });
  assertStateInvariant(STATES.WORKBENCH_COMPILE, { compileResult });

  machine.transition(STATES.HUMAN_CONFIRM, {
    issue_anchor: compileResult.issue_anchor,
    target_agent: compileResult.target_agent,
    evidence_required: compileResult.evidence_required
  });

  const previewReceipt = adapters.multica.previewSendScopedInstruction(compileResult);
  machine.transition(STATES.DISPATCHED, { issueAnchor: compileResult.issue_anchor });
  assertStateInvariant(STATES.DISPATCHED, { issueAnchor: compileResult.issue_anchor });

  machine.transition(STATES.OBSERVING, {
    evidence_missing: evidence.evidence_missing,
    primary_truth_conflict: evidence.pr_checks === "failing"
  });

  const capyObservation = adapters.capy.observeSurface();
  const pincerVerdict = runCloseoutPincer({
    claim: evidence.claim,
    compileResult,
    evidence,
    capyObservation
  });

  machine.transition(STATES.CLAIM_GATE, { temporalPincerVerdict: pincerVerdict });
  assertStateInvariant(STATES.CLAIM_GATE, { temporalPincerVerdict: pincerVerdict });

  machine.transition(STATES.LEARN, {
    learning_signal: {
      rank_up: compileResult.route,
      reason: "false PASS blocked until primary evidence is present"
    }
  });

  return {
    user_hint: userHint,
    state_sequence: machine.history,
    state_events: machine.events,
    ranked_future_ids: rankedFutures.map((future) => future.id),
    selected_future_id: selectedFuture.id,
    decision_packet: decisionPacket,
    compile_result: compileResult,
    preview_receipt: previewReceipt,
    capy_observation: capyObservation,
    pincer_verdict: pincerVerdict,
    keypress_no_llm_evidence: {
      checkpoint_calls: checkpointCalls,
      workbench_compile_called_on_keypress: false,
      issue_mutation_on_keypress: false,
      durable_learning_on_keypress: false
    },
    workbench_compile_boundary: {
      compile_after_state: STATES.FUTURE_SELECTED,
      human_confirm_before_dispatch: true,
      live_send: previewReceipt.live_send
    },
    raw_artifacts_saved: false
  };
}

async function readJson(url) {
  return JSON.parse(await readFile(url, "utf8"));
}
