#!/usr/bin/env node
import { readFileSync } from "node:fs";

const MUTATION_ACTIONS = new Set([
  "comment",
  "patch",
  "push",
  "merge",
  "status",
  "linear_write",
  "slack_post",
]);

function usage() {
  return [
    "Usage: capy-git-dialogue-guardrail [--format json|text] <event-summary.json>",
    "",
    "Exit codes:",
    "  0 = PASS",
    "  1 = FLAG",
    "  2 = BLOCK",
  ].join("\n");
}

function parseArgs(argv) {
  const args = { format: "text", file: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (!args.file) {
      args.file = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (!["json", "text"].includes(args.format)) {
    throw new Error(`Unsupported format: ${args.format}`);
  }

  return args;
}

function classifyActor(login) {
  const value = String(login || "").toLowerCase();
  if (!value) return "system";
  if (value.includes("capy")) return "capy_bot";
  if (value.includes("[bot]") || value.endsWith("-bot") || value.includes("bot")) {
    return "other_bot";
  }
  if (["github", "system", "web-flow"].includes(value)) return "system";
  return "human";
}

function isTruthy(value) {
  return value === true || value === "true" || value === "yes";
}

function detectChurn(input) {
  const churn = input.churn || {};
  if (isTruthy(churn.detected)) return true;

  const commits = Number(churn.capy_commits || 0);
  const comments = Number(churn.capy_comments || 0);
  const reviews = Number(churn.capy_reviews || 0);

  return commits >= 3 || comments >= 5 || reviews >= 2;
}

function normalizeIds(ids) {
  if (!ids || ids === "none") return "none";
  if (Array.isArray(ids)) return ids.length ? ids.join(",") : "none";
  return String(ids);
}

function evaluate(input) {
  const violations = [];
  const warnings = [];

  if (!input.repo) violations.push({ rule: "payload-repo-required" });
  if (!input.event_author) violations.push({ rule: "event-author-required" });

  const eventAuthor = input.event_author || "unknown";
  const actorClassification = classifyActor(eventAuthor);
  const headAuthorClassification = classifyActor(input.head_author || input.current_head_author);
  const requestedAction = input.requested_action || "observe";
  const mutationRequested = MUTATION_ACTIONS.has(requestedAction);
  const humanRequestPresent = isTruthy(input.human_request_present);
  const capyAuthoredSurface =
    actorClassification === "capy_bot" || headAuthorClassification === "capy_bot";
  const churnDetected = detectChurn(input);
  const patchAttempts = Number(input.patch_attempts_for_batch || 0);
  const patchBudgetExhausted =
    ["patch", "push"].includes(requestedAction) && patchAttempts >= 1;

  let mutationAllowed = mutationRequested ? "yes" : "no";
  let circuitBreakerState = "within-budget";
  let actionTaken = requestedAction;
  let verdict = "PASS";

  if (violations.length > 0) {
    mutationAllowed = "no";
    circuitBreakerState = "invalid-event-summary";
    actionTaken = "block";
    verdict = "BLOCK";
  } else if (churnDetected) {
    mutationAllowed = "no";
    circuitBreakerState = "operator-gated-churn";
    actionTaken = "block";
    warnings.push({ rule: "capy-self-churn-detected" });
    verdict = "FLAG";
  } else if (mutationRequested && capyAuthoredSurface && !humanRequestPresent) {
    mutationAllowed = "no";
    circuitBreakerState = "operator-gated-self-authored";
    actionTaken = "observe";
    warnings.push({ rule: "self-authored-event-cannot-authorize-mutation" });
    verdict = "FLAG";
  } else if (patchBudgetExhausted && !humanRequestPresent) {
    mutationAllowed = "no";
    circuitBreakerState = "patch-budget-exhausted";
    actionTaken = "block";
    warnings.push({ rule: "per-pr-patch-budget-exhausted" });
    verdict = "FLAG";
  } else if (!mutationRequested) {
    mutationAllowed = "no";
    actionTaken = "observe";
  }

  return {
    report_type: "CAPY_GIT_DIALOGUE_GUARDRAIL",
    repo: input.repo || null,
    event_author: eventAuthor,
    actor_classification: actorClassification,
    human_request_present: humanRequestPresent ? "yes" : "no",
    last_capy_commit_sha: input.last_capy_commit_sha || "none",
    last_capy_comment_ids: normalizeIds(input.last_capy_comment_ids),
    mutation_allowed: mutationAllowed,
    circuit_breaker_state: circuitBreakerState,
    action_taken: actionTaken,
    verdict,
    warnings,
    violations,
  };
}

function printText(result) {
  const lines = [
    "CAPY_GIT_DIALOGUE_GUARDRAIL",
    `repo: ${result.repo || "unknown"}`,
    `event_author: ${result.event_author}`,
    `actor_classification: ${result.actor_classification}`,
    `human_request_present: ${result.human_request_present}`,
    `last_capy_commit_sha: ${result.last_capy_commit_sha}`,
    `last_capy_comment_ids: ${result.last_capy_comment_ids}`,
    `mutation_allowed: ${result.mutation_allowed}`,
    `circuit_breaker_state: ${result.circuit_breaker_state}`,
    `action_taken: ${result.action_taken}`,
    `verdict: ${result.verdict}`,
  ];

  if (result.warnings.length) {
    lines.push(
      "warnings:",
      ...result.warnings.map((warning) => `- ${warning.rule}`),
    );
  }
  if (result.violations.length) {
    lines.push(
      "violations:",
      ...result.violations.map((violation) => `- ${violation.rule}`),
    );
  }

  return lines.join("\n");
}

function exitCode(verdict) {
  if (verdict === "PASS") return 0;
  if (verdict === "FLAG") return 1;
  return 2;
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }
  if (!args.file) throw new Error("Missing event summary file");

  const input = JSON.parse(readFileSync(args.file, "utf8"));
  const result = evaluate(input);
  if (args.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(printText(result));
  }
  process.exit(exitCode(result.verdict));
} catch (error) {
  console.error(error.message);
  console.error(usage());
  process.exit(2);
}
