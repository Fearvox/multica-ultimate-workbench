#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const validator = join(repoRoot, "scripts", "windburn-divergence-gate.mjs");
const classifier = join(repoRoot, "scripts", "windburn-materiality-classify.mjs");
const corpusEvaluator = join(repoRoot, "scripts", "windburn-materiality-corpus-eval.mjs");

function usage() {
  return [
    "Usage: windburn-promotion-gate decide [--format json|text] --packet <packet-file.md> [--belief-dir <dir>]",
    "",
    "Runs the local-only Windburn promotion gate:",
    "  1. validate DivergencePacket schema and authority boundary",
    "  2. classify materiality of alternatives",
    "  3. optionally run the corpus evaluator as a drift guard",
    "  4. emit a promotion decision summary without mutating trust or confidence",
    "",
    "Exit codes:",
    "  0 = PASS: promotion eligible with no blocking or adjacent follow-up",
    "  1 = FLAG: promotion eligible only after adjacent follow-up is parked",
    "  2 = BLOCK: validation, materiality, authority, or corpus gate failed",
  ].join("\n");
}

function parseArgs(argv) {
  const args = { command: null, format: "text", packet: null, beliefDir: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--format") args.format = argv[++i];
    else if (arg === "--packet") args.packet = argv[++i];
    else if (arg === "--belief-dir") args.beliefDir = argv[++i];
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (!args.command) args.command = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  if (!["json", "text"].includes(args.format)) throw new Error(`Unsupported format: ${args.format}`);
  if (args.command && args.command !== "decide") throw new Error(`Unsupported command: ${args.command}`);
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

function skipped(reason) {
  return { skipped: true, reason };
}

function baseResult(args) {
  return {
    verdict: "BLOCK",
    packet_file: args.packet ?? null,
    packet_id: args.packet ? basename(args.packet, ".md") : null,
    belief_id: null,
    no_provider_calls: true,
    stages: {
      validate_packet: skipped("not-run"),
      classify_packet: skipped("not-run"),
      corpus_eval: skipped("not-requested"),
    },
    required_actions: [],
    promotion: {
      eligible: false,
      action: "block_for_input_error",
      writes_trust_state: false,
      writes_confidence: false,
      writes_source_truth: false,
    },
    summary: "Promotion gate did not complete.",
  };
}

function validationBlocked(result, validation) {
  result.verdict = "BLOCK";
  result.stages.validate_packet = validation;
  result.stages.classify_packet = skipped("packet validation failed");
  result.stages.corpus_eval = skipped("packet validation failed");
  result.belief_id = validation.belief_id ?? null;
  result.packet_id = validation.packet_id ?? result.packet_id;
  result.required_actions = ["fix_divergence_packet"];
  result.promotion = {
    eligible: false,
    action: "block_for_packet_validation",
    writes_trust_state: false,
    writes_confidence: false,
    writes_source_truth: false,
  };
  result.summary = "BLOCK: DivergencePacket failed schema or authority-boundary validation.";
  return result;
}

function applyClassifierDecision(result, classification) {
  result.stages.classify_packet = classification;
  result.belief_id = classification.belief_id ?? result.belief_id;
  result.packet_id = classification.packet_id ?? result.packet_id;

  if ((classification.authority_violation_count ?? 0) > 0) {
    result.verdict = "BLOCK";
    result.required_actions = ["fix_divergence_packet"];
    result.promotion = {
      eligible: false,
      action: "block_for_authority_violation",
      writes_trust_state: false,
      writes_confidence: false,
      writes_source_truth: false,
    };
    result.summary = "BLOCK: Challenger packet attempted to carry authority-bearing state.";
    return result;
  }

  if ((classification.material_count ?? 0) > 0) {
    result.verdict = "BLOCK";
    result.required_actions = ["supervisor_materiality_review"];
    result.promotion = {
      eligible: false,
      action: "block_for_material_review",
      writes_trust_state: false,
      writes_confidence: false,
      writes_source_truth: false,
    };
    result.summary = "BLOCK: Material alternatives exist; promotion needs external review.";
    return result;
  }

  if ((classification.adjacent_count ?? 0) > 0) {
    result.verdict = "FLAG";
    result.required_actions = ["park_adjacent_alternatives"];
    result.promotion = {
      eligible: true,
      action: "promote_after_parking_adjacent",
      writes_trust_state: false,
      writes_confidence: false,
      writes_source_truth: false,
    };
    result.summary = "FLAG: No material blockers, but adjacent alternatives should be parked before promotion.";
    return result;
  }

  result.verdict = "PASS";
  result.required_actions = [];
  result.promotion = {
    eligible: true,
    action: "promote",
    writes_trust_state: false,
    writes_confidence: false,
    writes_source_truth: false,
  };
  result.summary = "PASS: Packet is valid and alternatives do not block promotion.";
  return result;
}

function applyCorpusGate(result, corpus) {
  result.stages.corpus_eval = corpus;
  if (corpus.verdict === "PASS") return result;

  result.verdict = "BLOCK";
  result.required_actions = Array.from(new Set([...result.required_actions, "fix_corpus_gate"]));
  result.promotion = {
    eligible: false,
    action: "block_for_corpus_eval",
    writes_trust_state: false,
    writes_confidence: false,
    writes_source_truth: false,
  };
  result.summary = "BLOCK: Corpus drift guard failed; do not promote until aggregate fixtures pass.";
  return result;
}

function exitCode(verdict) {
  if (verdict === "PASS") return 0;
  if (verdict === "FLAG") return 1;
  return 2;
}

function formatText(result) {
  const lines = [
    `${result.verdict}: ${result.packet_id}`,
    result.summary,
    `promotion=${result.promotion.action} eligible=${result.promotion.eligible}`,
    `required_actions=${result.required_actions.length ? result.required_actions.join(",") : "none"}`,
    `no_provider_calls=${result.no_provider_calls}`,
  ];
  const validation = result.stages.validate_packet;
  if (!validation.skipped) lines.push(`validate_packet=${validation.verdict}`);
  const classification = result.stages.classify_packet;
  if (!classification.skipped) {
    lines.push(
      `classify_packet=${classification.verdict} material=${classification.material_count} adjacent=${classification.adjacent_count} speculative=${classification.speculative_count} off_scope=${classification.off_scope_count}`,
    );
  }
  const corpus = result.stages.corpus_eval;
  if (!corpus.skipped) lines.push(`corpus_eval=${corpus.verdict} metrics=${JSON.stringify(corpus.metrics)}`);
  return lines.join("\n");
}

function decide(args) {
  const result = baseResult(args);
  const validation = runJson(
    validator,
    ["validate-packet", "--format", "json", args.packet],
    new Set([0, 2]),
  ).json;

  result.stages.validate_packet = validation;
  result.belief_id = validation.belief_id ?? null;
  result.packet_id = validation.packet_id ?? result.packet_id;

  if (validation.verdict !== "PASS") return validationBlocked(result, validation);

  const classification = runJson(
    classifier,
    ["classify", "--format", "json", "--packet", args.packet],
    new Set([0, 1, 2]),
  ).json;
  applyClassifierDecision(result, classification);

  if (args.beliefDir) {
    const corpus = runJson(
      corpusEvaluator,
      ["evaluate", "--format", "json", "--belief-dir", args.beliefDir],
      new Set([0, 2]),
    ).json;
    applyCorpusGate(result, corpus);
  }

  return result;
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help || !args.command || !args.packet) {
      console.log(usage());
      process.exit(args?.help ? 0 : 2);
    }
    const result = decide(args);
    if (args.format === "json") console.log(JSON.stringify(result, null, 2));
    else console.log(formatText(result));
    process.exit(exitCode(result.verdict));
  } catch (error) {
    const result = baseResult(args ?? { packet: null });
    result.summary = `BLOCK: ${error.message}`;
    result.required_actions = ["fix_promotion_gate_input"];
    if (args?.format === "json") console.log(JSON.stringify(result, null, 2));
    else console.error(result.summary);
    process.exit(2);
  }
}

main();
