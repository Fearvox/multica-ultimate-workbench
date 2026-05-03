import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { readFile } from "node:fs/promises";
import { rankCachedFutures } from "../src/local-ranker.mjs";

const context = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.context.json", import.meta.url), "utf8"));
const futures = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.futures.json", import.meta.url), "utf8"));

test("cached future rerank stays inside keypress budget", () => {
  const samples = [];

  for (let index = 0; index < 250; index += 1) {
    const start = performance.now();
    rankCachedFutures("route stuck branch", futures, context);
    samples.push(performance.now() - start);
  }

  const averageMs = samples.reduce((sum, item) => sum + item, 0) / samples.length;
  const worstMs = Math.max(...samples);

  assert.ok(averageMs < 4, `average rerank ${averageMs}ms exceeded 4ms budget`);
  assert.ok(worstMs < 16, `worst rerank ${worstMs}ms missed next-frame budget`);
});
