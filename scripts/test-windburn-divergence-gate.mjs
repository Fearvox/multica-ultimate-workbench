#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const validator = join(repoRoot, "scripts", "windburn-divergence-gate.mjs");
const fixtures = join(repoRoot, ".learning", "fixtures", "divergence-gate", "packets");
const validFixture = join(fixtures, "valid-basic-divergence.md");
const validText = readFileSync(validFixture, "utf8");

function runPacket(file) {
  const result = spawnSync(process.execPath, [validator, "validate-packet", "--format", "json", file], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  let json = null;
  try {
    json = JSON.parse(result.stdout);
  } catch {
    // Keep the original failure visible in assertion messages below.
  }

  return { ...result, json };
}

function writeTempFixture(root, name, text) {
  const file = join(root, name);
  writeFileSync(file, text);
  return file;
}

function rules(items) {
  return items.map((item) => item.rule).sort();
}

function paths(items) {
  return items.map((item) => item.path).sort();
}

const tempRoot = mkdtempSync(join(tmpdir(), "windburn-divergence-gate-"));

try {
  {
    const result = runPacket(validFixture);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(result.json?.verdict, "PASS");
    assert.deepEqual(result.json?.violations, []);
    assert.deepEqual(result.json?.warnings, []);
  }

  {
    const result = runPacket(join(fixtures, "invalid-confidence-delta.md"));
    assert.equal(result.status, 2, result.stderr || result.stdout);
    assert.equal(result.json?.verdict, "BLOCK");
    assert(rules(result.json?.violations ?? []).includes("authority-violation"));
    assert(paths(result.json?.violations ?? []).includes("confidence_delta"));
  }

  {
    const result = runPacket(join(fixtures, "invalid-trust-promotion.md"));
    assert.equal(result.status, 2, result.stderr || result.stdout);
    assert.equal(result.json?.verdict, "BLOCK");
    assert(rules(result.json?.violations ?? []).includes("authority-violation"));
    assert(paths(result.json?.violations ?? []).includes("new_trust_state"));
  }

  {
    const file = writeTempFixture(
      tempRoot,
      "invalid-unknown-relevance.md",
      validText.replace("relevance: direct", "relevance: unrelated"),
    );
    const result = runPacket(file);
    assert.equal(result.status, 2, result.stderr || result.stdout);
    assert.equal(result.json?.verdict, "BLOCK");
    assert(rules(result.json?.violations ?? []).includes("invalid-alternative-relevance"));
  }

  {
    const file = writeTempFixture(
      tempRoot,
      "invalid-missing-falsification-test.md",
      validText.replace(
        /\n    falsification_test: "Run the expected local server command and request the target URL from the same runtime\."\n/,
        "\n",
      ),
    );
    const result = runPacket(file);
    assert.equal(result.status, 2, result.stderr || result.stdout);
    assert.equal(result.json?.verdict, "BLOCK");
    assert(rules(result.json?.violations ?? []).includes("alternative-field-required"));
    assert(paths(result.json?.violations ?? []).includes("alternatives[0].falsification_test"));
  }

  {
    const file = writeTempFixture(
      tempRoot,
      "invalid-authority-fields.md",
      validText.replace(
        "confidence_change_allowed: false",
        [
          "confidence_change_allowed: false",
          "source_truth_write: true",
          'last_verified_at: "2026-05-03T21:45:00Z"',
          "age_bucket: fresh",
          "verdict: trusted",
        ].join("\n"),
      ),
    );
    const result = runPacket(file);
    assert.equal(result.status, 2, result.stderr || result.stdout);
    assert.equal(result.json?.verdict, "BLOCK");
    assert.deepEqual(
      paths((result.json?.violations ?? []).filter((item) => item.rule === "authority-violation")),
      ["age_bucket", "last_verified_at", "source_truth_write", "verdict"],
    );
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}

console.log("windburn-divergence-gate fixtures pass");
