import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createFixtureAdapters } from "../src/adapters.mjs";
import { createDecisionPacket } from "../src/decision-packet.mjs";
import { rankCachedFutures } from "../src/local-ranker.mjs";
import { compileDecision } from "../src/workbench-compiler.mjs";

const context = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.context.json", import.meta.url), "utf8"));
const futures = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.futures.json", import.meta.url), "utf8"));
const evidence = JSON.parse(await readFile(new URL("../fixtures/route-stuck-branch.evidence.json", import.meta.url), "utf8"));

const selectedFuture = rankCachedFutures("route stuck branch", futures, context)[0];

test("creates expected DecisionPacket for route stuck branch", () => {
  const packet = createDecisionPacket("route stuck branch", selectedFuture, context);

  assert.deepEqual(packet, {
    user_hint: "route stuck branch",
    context_snapshot_id: "ctx-route-stuck-branch-001",
    selected_future_id: "future-qa-reproduce-checks",
    active_repo: "/Users/0xvox/multica-ultimate-workbench",
    active_branch: "smokehouse",
    issue_anchor_preference: "existing",
    risk_tolerance: "medium",
    desired_speed: "fast",
    user_visible_summary: "Route stuck branch through QA evidence before patching.",
    sidecar_confidence: 0.82
  });
});

test("compiles expected WorkbenchCompileResult", () => {
  const packet = createDecisionPacket("route stuck branch", selectedFuture, context);
  const adapters = createFixtureAdapters({ context, futures, evidence });
  const result = compileDecision(packet, adapters);

  assert.deepEqual(result, {
    issue_anchor: {
      mode: "existing",
      issue_id: "EVENS-007",
      title: "Review open PRs and repo status"
    },
    route: "qa-review",
    target_agent: "QA Verifier",
    scoped_instruction: "Reproduce the stuck branch state for smokehouse. Read git status, diff summary, and PR #37 check state. Report command output and PR check readback. Do not edit files or change branches.",
    evidence_required: [
      "git status --short output",
      "git diff --stat output",
      "GitHub PR #37 check readback",
      "QA verdict PASS/FLAG/BLOCK with residual risk"
    ],
    risk_tier: "MEDIUM",
    pre_send_gate: "evidence-expectation",
    closeout_gate: "full-temporal-pincer",
    pincer_required: true,
    confirmation_text: "Send QA to reproduce checks on EVENS-007. Evidence: command output + PR check readback. Risk: medium."
  });
});

test("compiles focus guard automation future without live mutation", () => {
  const focusFuture = rankCachedFutures("我真的需要下一步 automation babysitter 防止被新想法打断", futures, context)[0];
  const packet = createDecisionPacket("我真的需要下一步 automation babysitter 防止被新想法打断", focusFuture, context);
  const adapters = createFixtureAdapters({ context, futures, evidence });
  const result = compileDecision(packet, adapters);

  assert.equal(packet.selected_future_id, "future-focus-guard-next-action");
  assert.equal(result.route, "focus-guard");
  assert.equal(result.target_agent, "ADHD Closure Babysitter");
  assert.equal(result.risk_tier, "LOW");
  assert.equal(result.pre_send_gate, "none");
  assert.equal(result.closeout_gate, "evidence-gate");
  assert.equal(result.pincer_required, false);
  assert.match(result.scoped_instruction, /Do exactly this next/);
  assert.match(result.confirmation_text, /Focus Loop Check-in/);
});

test("compiler rejects packet without issue anchor preference", () => {
  const packet = createDecisionPacket("route stuck branch", selectedFuture, context);
  const adapters = createFixtureAdapters({ context, futures, evidence });
  assert.throws(
    () => compileDecision({ ...packet, issue_anchor_preference: undefined }, adapters),
    /issue_anchor_preference/
  );
});

test("scoped instruction expands beyond raw shorthand", () => {
  const packet = createDecisionPacket("route stuck branch", selectedFuture, context);
  const adapters = createFixtureAdapters({ context, futures, evidence });
  const result = compileDecision(packet, adapters);

  assert.notEqual(result.scoped_instruction, packet.user_hint);
  assert.match(result.scoped_instruction, /Do not edit files or change branches/);
});
