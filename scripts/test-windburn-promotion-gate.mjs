#!/usr/bin/env node
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const gate = join(repoRoot, "scripts", "windburn-promotion-gate.mjs");
const fixtureRoot = join(repoRoot, ".learning", "fixtures", "divergence-gate");
const packetDir = join(fixtureRoot, "packets");
const beliefDir = join(fixtureRoot, "beliefs");

function runGate(packet, extraArgs = []) {
  const result = spawnSync(
    process.execPath,
    [gate, "decide", "--format", "json", "--packet", join(packetDir, packet), ...extraArgs],
    { cwd: repoRoot, encoding: "utf8" },
  );
  let json = null;
  try {
    json = JSON.parse(result.stdout);
  } catch {
    // Preserve stdout in assertions below.
  }
  return { result, json };
}

{
  const { result, json } = runGate("false-divergence-tax-only.md", ["--belief-dir", beliefDir]);
  assert.equal(result.status, 0, `stderr=${result.stderr}\nstdout=${result.stdout}`);
  assert(json, "promotion gate must emit JSON");
  assert.equal(json.verdict, "PASS");
  assert.equal(json.no_provider_calls, true);
  assert.equal(json.promotion.eligible, true);
  assert.equal(json.promotion.action, "promote");
  assert.equal(json.stages.validate_packet.verdict, "PASS");
  assert.equal(json.stages.classify_packet.verdict, "PASS");
  assert.equal(json.stages.corpus_eval.verdict, "PASS");
  assert.equal(json.stages.corpus_eval.metrics.authority_violation_count, 0);
}

{
  const { result, json } = runGate("no-material-mixed.md");
  assert.equal(result.status, 1, `stderr=${result.stderr}\nstdout=${result.stdout}`);
  assert(json, "FLAG result must emit JSON");
  assert.equal(json.verdict, "FLAG");
  assert.equal(json.promotion.eligible, true);
  assert.equal(json.promotion.action, "promote_after_parking_adjacent");
  assert(json.required_actions.includes("park_adjacent_alternatives"));
  assert.equal(json.stages.classify_packet.adjacent_count, 1);
  assert.equal(json.stages.classify_packet.material_count, 0);
}

{
  const { result, json } = runGate("valid-basic-divergence.md");
  assert.equal(result.status, 2, `stderr=${result.stderr}\nstdout=${result.stdout}`);
  assert(json, "BLOCK result must emit JSON");
  assert.equal(json.verdict, "BLOCK");
  assert.equal(json.promotion.eligible, false);
  assert.equal(json.promotion.action, "block_for_material_review");
  assert(json.required_actions.includes("supervisor_materiality_review"));
  assert.equal(json.stages.classify_packet.material_count, 1);
}

{
  const { result, json } = runGate("invalid-confidence-delta.md");
  assert.equal(result.status, 2, `stderr=${result.stderr}\nstdout=${result.stdout}`);
  assert(json, "validation BLOCK must emit JSON");
  assert.equal(json.verdict, "BLOCK");
  assert.equal(json.promotion.eligible, false);
  assert.equal(json.promotion.action, "block_for_packet_validation");
  assert.equal(json.stages.validate_packet.verdict, "BLOCK");
  assert.equal(json.stages.classify_packet.skipped, true);
  assert(json.required_actions.includes("fix_divergence_packet"));
}

console.log("windburn-promotion-gate fixtures pass");
