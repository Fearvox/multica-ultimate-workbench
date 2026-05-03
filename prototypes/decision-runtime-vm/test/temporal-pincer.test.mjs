import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createFixtureAdapters } from "../src/adapters.mjs";
import { createDecisionPacket } from "../src/decision-packet.mjs";
import { evaluateEvidence } from "../src/evidence-gate.mjs";
import { rankCachedFutures } from "../src/local-ranker.mjs";
import { runCloseoutPincer } from "../src/temporal-pincer.mjs";
import { compileDecision } from "../src/workbench-compiler.mjs";

const context = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.context.json", import.meta.url), "utf8"));
const futures = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.futures.json", import.meta.url), "utf8"));
const evidence = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.evidence.json", import.meta.url), "utf8"));

function compileRoute() {
  const selectedFuture = rankCachedFutures("route stuck branch", futures, context)[0];
  const packet = createDecisionPacket("route stuck branch", selectedFuture, context);
  const adapters = createFixtureAdapters({ context, futures, evidence });
  return {
    compileResult: compileDecision(packet, adapters),
    capyObservation: adapters.capy.observeSurface()
  };
}

test("evidence gate reports missing measurable proof", () => {
  const { compileResult } = compileRoute();
  const gate = evaluateEvidence(compileResult, evidence, context);

  assert.equal(gate.satisfied, false);
  assert.deepEqual(gate.missing, [
    "fresh git status --short output",
    "GitHub PR #37 check readback",
    "QA verdict PASS/FLAG/BLOCK"
  ]);
  assert.equal(gate.readyForCloseout, false);
});

test("Temporal Pincer blocks false PASS from CAPY ready UI", () => {
  const { compileResult, capyObservation } = compileRoute();
  const verdict = runCloseoutPincer({
    claim: "PASS",
    compileResult,
    evidence,
    capyObservation
  });

  assert.deepEqual(verdict, {
    verdict: "BLOCK",
    reason: "PASS claim lacks required evidence and conflicts with primary PR/check state.",
    missing_proof: [
      "fresh git status --short output",
      "GitHub PR #37 check readback",
      "QA verdict PASS/FLAG/BLOCK"
    ],
    false_pass_risks: [
      "CAPY UI ready state is supporting evidence only",
      "dirty branch can hide unrelated changes",
      "failing PR checks contradict PASS"
    ],
    next_route: "qa-review"
  });
});

test("Temporal Pincer returns READY when full pincer is not required", () => {
  const { compileResult, capyObservation } = compileRoute();
  const verdict = runCloseoutPincer({
    claim: "PASS",
    compileResult: {
      ...compileResult,
      route: "focus-guard",
      pincer_required: false
    },
    evidence,
    capyObservation
  });

  assert.deepEqual(verdict, {
    verdict: "READY",
    reason: "Low-friction focus guard route needs evidence-gate closeout, not full Temporal Pincer.",
    missing_proof: [],
    false_pass_risks: [],
    next_route: "focus-guard"
  });
});
