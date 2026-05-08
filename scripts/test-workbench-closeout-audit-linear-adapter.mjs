#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const adapter = join(repoRoot, "scripts", "workbench-closeout-audit-linear-adapter.mjs");

const passCloseout = `CHANGED:
- landed source patch

VERIFIED:
- node scripts/test.mjs

REMAINING:
(none)

PRS / LINKS:
- Reference type: contains
- PR: #27

VERDICT: PASS
`;

function runAdapter(event) {
  const tempRoot = mkdtempSync(join(tmpdir(), "closeout-audit-adapter-"));
  try {
    const eventPath = join(tempRoot, "event.json");
    writeFileSync(eventPath, JSON.stringify(event, null, 2), "utf8");
    const result = spawnSync(process.execPath, [
      adapter,
      "--format",
      "json",
      "--event-file",
      eventPath,
    ], {
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
  const result = runAdapter({
    event_id: "evt-pass",
    target: "SYN-31",
    target_status: "Done",
    comment_source: "linear",
    comment_body: passCloseout,
    references: [{ type: "contains", id: "#27", state: "merged" }],
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json.report_type, "WORKBENCH_CLOSEOUT_AUDIT");
  assert.equal(result.json.validator_verdict, "PASS");
  assert.equal(result.json.follow_up_action, "none");
  assert.equal(result.json.privacy_check, "PASS");
}

{
  const result = runAdapter({
    event_id: "evt-flag-done",
    target: "SYN-42",
    target_status: "Done",
    comment_source: "linear",
    comment_body: passCloseout.replace("VERDICT: PASS", "VERDICT: FLAG"),
    references: [{ type: "contains", id: "#27", state: "merged" }],
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json.validator_verdict, "BLOCK");
  assert.equal(result.json.follow_up_action, "create-flag-follow-up");
  assert.equal(result.json.follow_up_payload.status_mutation_policy, "audit-only; do not block or rewrite status");
}

{
  const fakeLocalPath = "/" + "Users/example/private-log.txt";
  const result = runAdapter({
    event_id: "evt-private-path",
    target: "SYN-42",
    target_status: "Done",
    comment_source: "linear",
    comment_body: passCloseout.replace("(none)", `- see ${fakeLocalPath}`),
    references: [{ type: "contains", id: "#27", state: "merged" }],
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.json.validator_verdict, "BLOCK");
  assert.match(result.json.privacy_check, /local-absolute-path/);
  assert.equal(result.json.follow_up_action, "create-flag-follow-up");
}

console.log("workbench-closeout-audit-linear-adapter fixtures pass");
