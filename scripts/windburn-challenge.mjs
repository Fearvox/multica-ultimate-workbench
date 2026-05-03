#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readBeliefFile } from "./windburn-verify.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const verifier = join(repoRoot, "scripts", "windburn-verify.mjs");
const promotionGate = join(repoRoot, "scripts", "windburn-promotion-gate.mjs");

function usage() {
  return [
    "Usage: windburn-challenge review [--format json|text] --belief <belief-file.md> --packet <packet-file.md> [--belief-dir <dir>]",
    "",
    "Runs the local-only Windburn challenge review bridge:",
    "  1. run windburn-verify on the belief",
    "  2. run windburn-promotion-gate on the supplied DivergencePacket",
    "  3. compose one challenge-review verdict without mutating trust or confidence",
    "",
    "Exit codes:",
    "  0 = PASS: verifier and promotion gate pass",
    "  1 = FLAG: no blockers, but warnings or adjacent follow-up exist",
    "  2 = BLOCK: belief self-consistency, packet, materiality, authority, or corpus gate failed",
  ].join("\n");
}

function parseArgs(argv) {
  const args = { command: null, format: "text", belief: null, packet: null, beliefDir: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--format") args.format = argv[++i];
    else if (arg === "--belief") args.belief = argv[++i];
    else if (arg === "--packet") args.packet = argv[++i];
    else if (arg === "--belief-dir") args.beliefDir = argv[++i];
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (!args.command) args.command = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  if (!["json", "text"].includes(args.format)) throw new Error(`Unsupported format: ${args.format}`);
  if (args.command && args.command !== "review") throw new Error(`Unsupported command: ${args.command}`);
  return args;
}

function runJson(command, args, acceptedStatuses) {
  const result = spawnSync(process.execPath, [command, ...args], { cwd: repoRoot, encoding: "utf8" });
  let json = null;
  try {
    json = JSON.parse(result.stdout);
  } catch {
    throw new Error(
      `${basename(command)} emitted non-JSON or no JSON; status=${result.status}; stderr=${result.stderr}; stdout=${result.stdout}`,
    );
  }
  if (!acceptedStatuses.has(result.status)) {
    throw new Error(
      `${basename(command)} exited with unexpected status ${result.status}; stderr=${result.stderr}; stdout=${result.stdout}`,
    );
  }
  return { status: result.status, json };
}

function basePromotion(action = "block_for_input_error", eligible = false) {
  return {
    eligible,
    action,
    writes_trust_state: false,
    writes_confidence: false,
    writes_source_truth: false,
  };
}

function baseResult(args) {
  return {
    verdict: "BLOCK",
    no_provider_calls: true,
    belief_file: args.belief ?? null,
    belief_id: null,
    packet_file: args.packet ?? null,
    packet_id: args.packet ? basename(args.packet, ".md") : null,
    challenge_required: false,
    challenge_reasons: [],
    stages: {
      verify_belief: { skipped: true, reason: "not-run" },
      promotion_gate: { skipped: true, reason: "not-run" },
    },
    promotion: basePromotion(),
    required_actions: [],
    summary: "Challenge review did not complete.",
  };
}

function addUnique(items, item) {
  if (!items.includes(item)) items.push(item);
}

function mergeRequiredActions(verifyResult, gateResult) {
  const actions = [];
  if ((verifyResult.violations ?? []).length > 0) addUnique(actions, "fix_belief_self_consistency");
  if ((verifyResult.warnings ?? []).length > 0) addUnique(actions, "review_belief_flags");
  for (const action of gateResult.required_actions ?? []) addUnique(actions, action);
  return actions;
}

function hasViolation(verifyResult, rule) {
  return (verifyResult.violations ?? []).some((item) => item.rule === rule);
}

function detectChallengeReasons(belief, verifyResult, gateResult) {
  const reasons = [];
  if (belief?.promotion_request?.requested_state) addUnique(reasons, "promotion_request");
  if (hasViolation(verifyResult, "verified-requires-challenge-review")) {
    addUnique(reasons, "verified_requires_challenge_review");
  }
  if (!gateResult?.skipped) addUnique(reasons, "supplied_divergence_packet");
  return reasons;
}

function composeVerdict(verifyResult, gateResult) {
  const verifierBlocked = (verifyResult.violations ?? []).length > 0;
  const verifierFlagged = (verifyResult.warnings ?? []).length > 0;
  if (verifierBlocked) return "BLOCK";
  if (gateResult.verdict === "BLOCK") return "BLOCK";
  if (verifierFlagged || gateResult.verdict === "FLAG") return "FLAG";
  return "PASS";
}

function composePromotion(verdict, verifyResult, gateResult) {
  if ((verifyResult.violations ?? []).length > 0) {
    return basePromotion("block_for_belief_self_consistency", false);
  }
  if (gateResult?.promotion) {
    return {
      eligible: verdict === "BLOCK" ? false : gateResult.promotion.eligible === true,
      action: gateResult.promotion.action,
      writes_trust_state: false,
      writes_confidence: false,
      writes_source_truth: false,
    };
  }
  return basePromotion(verdict === "PASS" ? "promote" : "block_for_missing_gate", verdict === "PASS");
}

function summaryFor(result) {
  if (result.verdict === "BLOCK" && result.promotion.action === "block_for_belief_self_consistency") {
    return "BLOCK: Belief self-consistency violations must be fixed before promotion review can count.";
  }
  if (result.verdict === "BLOCK") {
    return "BLOCK: Challenge review found a packet, materiality, authority, or corpus blocker.";
  }
  if (result.verdict === "FLAG") {
    return "FLAG: No hard blocker, but verifier warnings or adjacent alternatives require follow-up before promotion is clean.";
  }
  return "PASS: Belief verifier and supplied challenge packet are locally clear for promotion review.";
}

function review(args) {
  const result = baseResult(args);
  const { belief } = readBeliefFile(args.belief);

  const verifyStage = runJson(verifier, ["--format", "json", args.belief], new Set([0, 1, 2])).json;
  result.stages.verify_belief = verifyStage;
  result.belief_id = verifyStage.id ?? belief.id ?? null;

  const gateArgs = ["decide", "--format", "json", "--packet", args.packet];
  if (args.beliefDir) gateArgs.push("--belief-dir", args.beliefDir);
  const gateStage = runJson(promotionGate, gateArgs, new Set([0, 1, 2])).json;
  result.stages.promotion_gate = gateStage;
  result.packet_id = gateStage.packet_id ?? result.packet_id;

  result.challenge_reasons = detectChallengeReasons(belief, verifyStage, gateStage);
  result.challenge_required = result.challenge_reasons.length > 0;
  result.verdict = composeVerdict(verifyStage, gateStage);
  result.required_actions = mergeRequiredActions(verifyStage, gateStage);
  result.promotion = composePromotion(result.verdict, verifyStage, gateStage);
  result.summary = summaryFor(result);
  return result;
}

function exitCode(verdict) {
  if (verdict === "PASS") return 0;
  if (verdict === "FLAG") return 1;
  return 2;
}

function formatText(result) {
  return [
    `${result.verdict}: ${result.belief_id ?? basename(result.belief_file ?? "unknown")}`,
    result.summary,
    `challenge_required=${result.challenge_required} reasons=${result.challenge_reasons.join(",") || "none"}`,
    `promotion=${result.promotion.action} eligible=${result.promotion.eligible}`,
    `required_actions=${result.required_actions.length ? result.required_actions.join(",") : "none"}`,
    `verify_belief=${result.stages.verify_belief.verdict}`,
    `promotion_gate=${result.stages.promotion_gate.verdict}`,
    `no_provider_calls=${result.no_provider_calls}`,
  ].join("\n");
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help || !args.command || !args.belief || !args.packet) {
      console.log(usage());
      process.exit(args?.help ? 0 : 2);
    }
    const result = review(args);
    if (args.format === "json") console.log(JSON.stringify(result, null, 2));
    else console.log(formatText(result));
    process.exit(exitCode(result.verdict));
  } catch (error) {
    const result = baseResult(args ?? { belief: null, packet: null });
    result.summary = `BLOCK: ${error.message}`;
    result.required_actions = ["fix_challenge_input"];
    if (args?.format === "json") console.log(JSON.stringify(result, null, 2));
    else console.error(result.summary);
    process.exit(2);
  }
}

main();
