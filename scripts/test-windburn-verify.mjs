#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const verifier = join(repoRoot, "scripts", "windburn-verify.mjs");
const fixtures = join(repoRoot, ".learning", "fixtures", "self-consistency");

function runFixture(name) {
  const result = spawnSync(process.execPath, [verifier, "--format", "json", join(fixtures, name)], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  let json = null;
  try {
    json = JSON.parse(result.stdout);
  } catch {
    // Keep the original failure visible in the assertion message below.
  }

  return { ...result, json };
}

function rules(items) {
  return items.map((item) => item.rule).sort();
}

{
  const result = runFixture("invalid-verified-without-review.md");
  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.equal(result.json?.verdict, "BLOCK");
  assert.deepEqual(rules(result.json.violations), [
    "high-confidence-requires-external-evidence",
    "verified-requires-challenge-review",
  ]);
  assert.deepEqual(result.json.warnings, []);
}

{
  const result = runFixture("corrected-hypothesis.md");
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json?.verdict, "PASS");
  assert.deepEqual(result.json.violations, []);
  assert.deepEqual(result.json.warnings, []);
}

{
  const result = runFixture("verified-with-external-review.md");
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json?.verdict, "PASS");
  assert.deepEqual(result.json.violations, []);
  assert.deepEqual(result.json.warnings, []);
}

console.log("windburn-verify fixtures pass");
