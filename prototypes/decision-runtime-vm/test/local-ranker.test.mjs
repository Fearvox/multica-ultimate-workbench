import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { rankCachedFutures } from "../src/local-ranker.mjs";

const context = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.context.json", import.meta.url), "utf8"));
const futures = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.futures.json", import.meta.url), "utf8"));

test("route stuck branch ranks QA reproduction first", () => {
  const ranked = rankCachedFutures("route stuck branch", futures, context);
  assert.equal(ranked[0].id, "future-qa-reproduce-checks");
  assert.ok(ranked[0].score > ranked[1].score);
});

test("focus interruption hint ranks automation guard first", () => {
  const ranked = rankCachedFutures("我真的需要下一步 automation babysitter 防止被新想法打断", futures, context);
  assert.equal(ranked[0].id, "future-focus-guard-next-action");
  assert.ok(ranked[0].score_breakdown.automation_focus_fit > 0);
});

test("keypress rerank does not call checkpoint generator or compiler", () => {
  const calls = [];
  const ranked = rankCachedFutures("route stuck branch", futures, context, {
    onCheckpointCall(name) {
      calls.push(name);
    }
  });

  assert.equal(ranked.length, futures.length);
  assert.deepEqual(calls, []);
});

test("rerank returns stable score reasons", () => {
  const [top] = rankCachedFutures("route stuck branch", futures, context);
  assert.equal(top.id, "future-qa-reproduce-checks");
  assert.ok(top.score_breakdown.hint_match > 0);
  assert.ok(top.score_breakdown.evidence_availability > 0);
  assert.ok(top.score_breakdown.agent_availability > 0);
  assert.equal(typeof top.score_breakdown.automation_focus_fit, "number");
});
