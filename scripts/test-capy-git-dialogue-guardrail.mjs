#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const guardrail = join(repoRoot, "scripts", "capy-git-dialogue-guardrail.mjs");

function runFixture(input) {
  const tempRoot = mkdtempSync(join(tmpdir(), "capy-guardrail-"));
  try {
    const fixture = join(tempRoot, "event.json");
    writeFileSync(fixture, JSON.stringify(input, null, 2), "utf8");
    const result = spawnSync(process.execPath, [guardrail, "--format", "json", fixture], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    return {
      ...result,
      json: JSON.parse(result.stdout),
    };
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

{
  const result = runFixture({
    repo: "Fearvox/example",
    event_author: "reviewer-human",
    requested_action: "patch",
    human_request_present: true,
    last_capy_commit_sha: "none",
    last_capy_comment_ids: [],
    patch_attempts_for_batch: 0,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json.verdict, "PASS");
  assert.equal(result.json.mutation_allowed, "yes");
  assert.equal(result.json.circuit_breaker_state, "within-budget");
}

{
  const result = runFixture({
    repo: "Fearvox/example",
    event_author: "capy-ai[bot]",
    requested_action: "patch",
    human_request_present: false,
    last_capy_commit_sha: "abc123",
    last_capy_comment_ids: [1001],
  });
  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.equal(result.json.verdict, "FLAG");
  assert.equal(result.json.mutation_allowed, "no");
  assert.equal(result.json.action_taken, "observe");
  assert.deepEqual(result.json.warnings.map((item) => item.rule), [
    "self-authored-event-cannot-authorize-mutation",
  ]);
}

{
  const result = runFixture({
    repo: "Fearvox/example",
    event_author: "capy-ai[bot]",
    requested_action: "observe",
    human_request_present: false,
    last_capy_commit_sha: "abc123",
    last_capy_comment_ids: [1001],
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json.verdict, "PASS");
  assert.equal(result.json.mutation_allowed, "no");
  assert.equal(result.json.action_taken, "observe");
}

{
  const result = runFixture({
    repo: "Fearvox/example",
    event_author: "reviewer-human",
    requested_action: "patch",
    human_request_present: false,
    last_capy_commit_sha: "abc123",
    last_capy_comment_ids: [1001, 1002, 1003, 1004, 1005],
    churn: {
      capy_commits: 4,
      capy_comments: 6,
      capy_reviews: 2,
    },
  });
  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.equal(result.json.verdict, "FLAG");
  assert.equal(result.json.mutation_allowed, "no");
  assert.equal(result.json.circuit_breaker_state, "operator-gated-churn");
}

{
  const result = runFixture({
    repo: "Fearvox/example",
    event_author: "reviewer-human",
    requested_action: "patch",
    human_request_present: false,
    patch_attempts_for_batch: 1,
  });
  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.equal(result.json.verdict, "FLAG");
  assert.equal(result.json.mutation_allowed, "no");
  assert.equal(result.json.circuit_breaker_state, "patch-budget-exhausted");
}

console.log("capy-git-dialogue-guardrail fixtures pass");
