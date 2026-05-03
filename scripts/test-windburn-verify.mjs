#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const verifier = join(repoRoot, "scripts", "windburn-verify.mjs");
const decay = join(repoRoot, "scripts", "windburn-momentum-decay.mjs");
const writer = join(repoRoot, "scripts", "windburn-belief-write.mjs");
const fixtures = join(repoRoot, ".learning", "fixtures", "self-consistency");

function runJson(command, args) {
  const result = spawnSync(process.execPath, [command, ...args], {
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

function runFixture(name) {
  return runJson(verifier, ["--format", "json", join(fixtures, name)]);
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

{
  const result = runFixture("high-momentum-stale-no-action.md");
  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.equal(result.json?.verdict, "FLAG");
  assert.deepEqual(result.json.violations, []);
  assert.deepEqual(rules(result.json.warnings), [
    "hot-momentum-requires-recent-action",
  ]);
}

{
  const result = runFixture("new-belief-today.md");
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json?.verdict, "PASS");
  assert.deepEqual(result.json.violations, []);
  assert.deepEqual(result.json.warnings, []);
}

{
  const result = runJson(decay, [
    "--dry-run",
    "--format",
    "json",
    "--now",
    "2026-05-01T00:00:00Z",
    join(fixtures, "high-momentum-stale-no-action.md"),
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json?.age_bucket, "stale");
  assert.equal(result.json?.current_momentum, 0.8);
  assert.equal(result.json?.decay_applied, -0.3);
  assert.equal(result.json?.new_momentum_numeric, 0.5);
  assert.equal(result.json?.new_momentum_level, "medium");
  assert.equal(result.json?.reason, "inactivity_bleed");
}

{
  const tempRoot = mkdtempSync(join(tmpdir(), "windburn-belief-write-"));
  try {
    const dest = join(tempRoot, "beliefs", "new-belief-today.md");
    const result = runJson(writer, [
      "--format",
      "json",
      "--source",
      join(fixtures, "new-belief-today.md"),
      "--dest",
      dest,
    ]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(result.json?.verdict, "PASS");
    assert.equal(result.json?.written, true);
    assert.equal(existsSync(dest), true);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

{
  const tempRoot = mkdtempSync(join(tmpdir(), "windburn-belief-write-block-"));
  try {
    const dest = join(tempRoot, "beliefs", "invalid.md");
    const result = runJson(writer, [
      "--format",
      "json",
      "--source",
      join(fixtures, "invalid-verified-without-review.md"),
      "--dest",
      dest,
    ]);
    assert.equal(result.status, 2, result.stderr || result.stdout);
    assert.equal(result.json?.verdict, "BLOCK");
    assert.equal(result.json?.written, false);
    assert.equal(existsSync(dest), false);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

console.log("windburn-verify fixtures pass");
