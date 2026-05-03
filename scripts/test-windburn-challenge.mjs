#!/usr/bin/env node
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const challenge = join(repoRoot, "scripts", "windburn-challenge.mjs");
const fixtureRoot = join(repoRoot, ".learning", "fixtures");
const challengeDir = join(fixtureRoot, "challenge");
const packetDir = join(challengeDir, "packets");
const beliefDir = join(fixtureRoot, "divergence-gate", "beliefs");

function runChallenge(belief, packet, extraArgs = []) {
  const result = spawnSync(
    process.execPath,
    [
      challenge,
      "review",
      "--format",
      "json",
      "--belief",
      join(challengeDir, belief),
      "--packet",
      join(packetDir, packet),
      ...extraArgs,
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  let json = null;
  try {
    json = JSON.parse(result.stdout);
  } catch {
    // Keep raw output in assertion message.
  }
  return { result, json };
}

{
  const { result, json } = runChallenge("promotion-request-hypothesis.md", "promotion-request-no-material.md", [
    "--belief-dir",
    beliefDir,
  ]);
  assert.equal(result.status, 0, `stderr=${result.stderr}\nstdout=${result.stdout}`);
  assert(json, "challenge review must emit JSON");
  assert.equal(json.verdict, "PASS");
  assert.equal(json.no_provider_calls, true);
  assert.equal(json.challenge_required, true);
  assert(json.challenge_reasons.includes("promotion_request"));
  assert.equal(json.stages.verify_belief.verdict, "PASS");
  assert.equal(json.stages.promotion_gate.verdict, "PASS");
  assert.equal(json.stages.promotion_gate.stages.corpus_eval.verdict, "PASS");
  assert.equal(json.promotion.eligible, true);
  assert.equal(json.promotion.action, "promote");
  assert.equal(json.promotion.writes_trust_state, false);
  assert.equal(json.promotion.writes_confidence, false);
  assert.equal(json.promotion.writes_source_truth, false);
  assert.deepEqual(json.required_actions, []);
}

{
  const { result, json } = runChallenge("promotion-request-hypothesis.md", "promotion-request-material.md");
  assert.equal(result.status, 2, `stderr=${result.stderr}\nstdout=${result.stdout}`);
  assert(json, "material challenge review must emit JSON");
  assert.equal(json.verdict, "BLOCK");
  assert.equal(json.stages.verify_belief.verdict, "PASS");
  assert.equal(json.stages.promotion_gate.verdict, "BLOCK");
  assert.equal(json.promotion.eligible, false);
  assert.equal(json.promotion.action, "block_for_material_review");
  assert(json.required_actions.includes("supervisor_materiality_review"));
}

{
  const { result, json } = runChallenge("invalid-verified-without-review.md", "promotion-request-no-material.md");
  assert.equal(result.status, 2, `stderr=${result.stderr}\nstdout=${result.stdout}`);
  assert(json, "invalid belief challenge review must emit JSON");
  assert.equal(json.verdict, "BLOCK");
  assert.equal(json.stages.verify_belief.verdict, "BLOCK");
  assert.equal(json.stages.promotion_gate.verdict, "PASS");
  assert.equal(json.promotion.eligible, false);
  assert.equal(json.promotion.action, "block_for_belief_self_consistency");
  assert(json.required_actions.includes("fix_belief_self_consistency"));
  assert(json.challenge_reasons.includes("verified_requires_challenge_review"));
}

console.log("windburn-challenge fixtures pass");
