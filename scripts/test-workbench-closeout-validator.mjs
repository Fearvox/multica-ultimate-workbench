#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const validator = join(repoRoot, "scripts", "workbench-closeout-validator.mjs");

function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2), "utf8");
}

function runValidator({ comment, status, references, affectedIssues }) {
  const tempRoot = mkdtempSync(join(tmpdir(), "closeout-validator-"));
  try {
    const commentPath = join(tempRoot, "comment.md");
    const args = [validator, "--format", "json", "--comment-file", commentPath];
    writeFileSync(commentPath, comment, "utf8");

    if (status) args.push("--target-status", status);
    if (references) {
      const referencesPath = join(tempRoot, "references.json");
      writeJson(referencesPath, references);
      args.push("--references-json", referencesPath);
    }
    if (affectedIssues) {
      const affectedIssuesPath = join(tempRoot, "affected-issues.json");
      writeJson(affectedIssuesPath, affectedIssues);
      args.push("--affected-issues-json", affectedIssuesPath);
    }

    const result = spawnSync(process.execPath, args, {
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

const validPass = `CHANGED:
- landed source patch

VERIFIED:
- node scripts/test.mjs

REMAINING:
(none)

PRS / LINKS:
- Reference type: contains
- PR: #24

VERDICT: PASS
`;

{
  const result = runValidator({
    comment: validPass,
    status: "Done",
    references: [{ type: "contains", id: "#24", state: "merged" }],
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json.validator_verdict, "PASS");
  assert.deepEqual(result.json.violations, []);
  assert.deepEqual(result.json.warnings, []);
}

{
  const result = runValidator({
    comment: validPass.replace("VERDICT: PASS", "VERDICT: FLAG"),
    status: "Done",
    references: [{ type: "contains", id: "#24", state: "merged" }],
  });
  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.equal(result.json.validator_verdict, "BLOCK");
  assert.deepEqual(result.json.violations.map((item) => item.rule), [
    "done-requires-pass",
  ]);
}

{
  const missingRemaining = `CHANGED:
- landed source patch

VERIFIED:
- node scripts/test.mjs

PRS / LINKS:
- Reference type: contains

VERDICT: PASS
`;
  const result = runValidator({
    comment: missingRemaining,
    status: "Done",
    references: [{ type: "contains", id: "#24", state: "merged" }],
  });
  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.equal(result.json.validator_verdict, "BLOCK");
  assert.equal(
    result.json.violations.some((item) => item.rule === "missing-heading" && item.heading === "REMAINING"),
    true,
  );
}

{
  const result = runValidator({
    comment: validPass,
    status: "Done",
    references: [{ type: "contains", id: "#24", state: "open" }],
  });
  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.equal(result.json.validator_verdict, "BLOCK");
  assert.deepEqual(result.json.violations.map((item) => item.rule), [
    "contains-reference-not-merged",
  ]);
}

{
  const result = runValidator({
    comment: validPass,
    status: "Done",
    references: [{ type: "contains", id: "#24", state: "closed" }],
  });
  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.equal(result.json.validator_verdict, "BLOCK");
  assert.deepEqual(result.json.violations.map((item) => item.rule), [
    "contains-reference-not-merged",
  ]);
}

{
  const crossIssueFlag = `CHANGED:
- copied closeout rule

VERIFIED:
- validator dry-run

REMAINING:
- SYN-40 staged artifacts are not complete.

PRS / LINKS:
- Reference type: cross-issue-side-effect
- Related: SYN-39, SYN-40

VERDICT: FLAG
`;
  const result = runValidator({
    comment: crossIssueFlag,
    status: "Ready for Merge",
    affectedIssues: [
      { id: "SYN-39", remaining_synced: true },
      { id: "SYN-40", remaining_synced: false },
    ],
  });
  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.equal(result.json.validator_verdict, "FLAG");
  assert.deepEqual(result.json.warnings.map((item) => item.rule), [
    "remaining-not-synced-to-affected-issue",
  ]);
  assert.equal(result.json.follow_up_required, true);
  assert.equal(result.json.follow_up_verdict, "FLAG");
}

console.log("workbench-closeout-validator fixtures pass");
