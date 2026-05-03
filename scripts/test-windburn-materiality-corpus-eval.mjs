#!/usr/bin/env node
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const evaluator = join(repoRoot, "scripts", "windburn-materiality-corpus-eval.mjs");
const beliefDir = join(repoRoot, ".learning", "fixtures", "divergence-gate", "beliefs");

const result = spawnSync(
  process.execPath,
  [evaluator, "evaluate", "--format", "json", "--belief-dir", beliefDir],
  { cwd: repoRoot, encoding: "utf8" },
);

let json = null;
try {
  json = JSON.parse(result.stdout);
} catch {
  // Keep raw output in assertion message.
}

assert.equal(result.status, 0, `stderr=${result.stderr}\nstdout=${result.stdout}`);
assert(json, "corpus evaluator must emit JSON");
assert.equal(json.verdict, "PASS");
assert.equal(json.corpus_total, 20);
assert.equal(json.generated_packet_count, 20);
assert.equal(json.seeded_hidden_flaw_count, 11);
assert.deepEqual(json.expected_label_counts, {
  material: 8,
  adjacent: 2,
  speculative: 1,
  none: 9,
});
assert.deepEqual(json.primary_label_counts, {
  material: 8,
  adjacent: 2,
  speculative: 1,
  off_scope: 9,
});
assert.equal(json.metrics.authority_violation_count, 0);
assert.equal(json.metrics.hidden_material_miss_count, 0);
assert.equal(json.metrics.material_expectation_miss_count, 0);
assert.equal(json.metrics.actual_material_count, 8);
assert.equal(json.metrics.material_divergence_yield, 0.4);
assert.equal(json.metrics.early_convergence_block_rate, 0.4);
assert(json.metrics.false_divergence_tax > 0, "false divergence tax must be counted");
assert.equal(json.failures.length, 0);

for (const item of json.results) {
  assert(item.belief_id, "each result needs belief_id");
  assert(item.expected_materiality, `${item.belief_id}: expected_materiality missing`);
  assert(item.primary_label, `${item.belief_id}: primary_label missing`);
  assert.equal(item.authority_violation_count, 0, `${item.belief_id}: authority violation`);
  if (item.expected_materiality === "material") {
    assert.equal(item.primary_label, "material", `${item.belief_id}: material expectation missed`);
  }
}

console.log("windburn-materiality-corpus-eval fixtures pass");
