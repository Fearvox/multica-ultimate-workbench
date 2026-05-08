#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const validator = join(repoRoot, "scripts", "workbench-closeout-validator.mjs");

const PUBLIC_SURFACE_PATTERNS = [
  { rule: "local-absolute-path", pattern: /(^|[\s(])\/Users\/[^\s)]+/ },
  { rule: "home-absolute-path", pattern: /(^|[\s(])\/home\/[^\s)]+/ },
  { rule: "bearer-token", pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/i },
  { rule: "secret-assignment", pattern: /\b(?:token|secret|password|api[_-]?key|private[_-]?key)\s*[:=]\s*[^\s`'"]{8,}/i },
  { rule: "ipv4-address", pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/ },
];

function usage() {
  return [
    "Usage: workbench-closeout-audit-linear-adapter --event-file PATH [--format json|text]",
    "",
    "Reads a sanitized Linear closeout event, runs the strict closeout validator,",
    "and emits an audit-only follow-up payload. It never writes Linear status.",
  ].join("\n");
}

function parseArgs(argv) {
  const args = { eventFile: null, format: "text" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--event-file") {
      args.eventFile = argv[++i];
    } else if (arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  if (!["json", "text"].includes(args.format)) {
    throw new Error(`Unsupported format: ${args.format}`);
  }
  return args;
}

function readEvent(path) {
  const event = JSON.parse(readFileSync(path, "utf8"));
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new Error("event must be a JSON object");
  }
  if (!event.target) throw new Error("event.target is required");
  if (!event.comment_body) throw new Error("event.comment_body is required");
  return {
    target: String(event.target),
    target_status: event.target_status ? String(event.target_status) : null,
    comment_source: event.comment_source ? String(event.comment_source) : "linear",
    comment_body: String(event.comment_body),
    references: Array.isArray(event.references) ? event.references : [],
    affected_issues: Array.isArray(event.affected_issues) ? event.affected_issues : [],
    event_id: event.event_id ? String(event.event_id) : null,
  };
}

function scanPublicSurface(text) {
  const findings = [];
  for (const item of PUBLIC_SURFACE_PATTERNS) {
    if (item.pattern.test(text)) findings.push({ rule: item.rule });
  }
  return findings;
}

function runValidator(event) {
  const tempRoot = mkdtempSync(join(tmpdir(), "closeout-audit-"));
  try {
    const commentPath = join(tempRoot, "closeout.md");
    const referencesPath = join(tempRoot, "references.json");
    const affectedIssuesPath = join(tempRoot, "affected-issues.json");
    writeFileSync(commentPath, event.comment_body, "utf8");
    writeFileSync(referencesPath, JSON.stringify(event.references, null, 2), "utf8");
    writeFileSync(affectedIssuesPath, JSON.stringify(event.affected_issues, null, 2), "utf8");

    const args = [
      validator,
      "--format",
      "json",
      "--comment-file",
      commentPath,
      "--references-json",
      referencesPath,
      "--affected-issues-json",
      affectedIssuesPath,
    ];
    if (event.target_status) args.push("--target-status", event.target_status);

    const result = spawnSync(process.execPath, args, {
      cwd: repoRoot,
      encoding: "utf8",
    });
    if (!result.stdout) {
      throw new Error(result.stderr || "validator emitted no JSON");
    }
    return JSON.parse(result.stdout);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function summarizeReferenceChecks(validation) {
  if (validation.violations.some((item) => item.rule === "contains-reference-not-merged")) {
    return "BLOCK: contains reference not merged";
  }
  if (validation.warnings.some((item) => item.rule === "contains-reference-state-not-provided")) {
    return "FLAG: contains reference state missing";
  }
  return validation.reference_types.length ? `PASS: ${validation.reference_types.join(", ")}` : "PASS: none";
}

function summarizeRemainingSync(validation) {
  const syncWarnings = validation.warnings.filter((item) =>
    item.rule === "cross-issue-remaining-sync-not-proven" ||
    item.rule === "remaining-not-synced-to-affected-issue"
  );
  return syncWarnings.length ? `FLAG: ${syncWarnings.map((item) => item.rule).join(", ")}` : "PASS";
}

function evaluate(event) {
  const validation = runValidator(event);
  const privacyFindings = scanPublicSurface(event.comment_body);
  const validatorVerdict = privacyFindings.length ? "BLOCK" : validation.validator_verdict;
  const followUpAction = validatorVerdict === "PASS" ? "none" : "create-flag-follow-up";

  return {
    report_type: "WORKBENCH_CLOSEOUT_AUDIT",
    target: event.target,
    target_status: event.target_status,
    comment_source: event.comment_source,
    event_id: event.event_id,
    fields_present: validation.fields_present,
    closeout_verdict: validation.closeout_verdict,
    validator_verdict: validatorVerdict,
    reference_checks: summarizeReferenceChecks(validation),
    remaining_sync: summarizeRemainingSync(validation),
    follow_up_action: followUpAction,
    follow_up_payload: followUpAction === "none" ? null : {
      title: `[AUTO-RD] Closeout audit follow-up for ${event.target}`,
      target: event.target,
      source_event_id: event.event_id,
      validator_verdict: validatorVerdict,
      warnings: validation.warnings,
      violations: [
        ...validation.violations,
        ...privacyFindings.map((item) => ({ rule: item.rule })),
      ],
      status_mutation_policy: "audit-only; do not block or rewrite status",
    },
    privacy_check: privacyFindings.length ? `BLOCK: ${privacyFindings.map((item) => item.rule).join(", ")}` : "PASS",
    VERDICT: validatorVerdict,
  };
}

function printText(result) {
  return [
    "WORKBENCH_CLOSEOUT_AUDIT",
    `target: ${result.target}`,
    `target_status: ${result.target_status || "none"}`,
    `comment_source: ${result.comment_source}`,
    `fields_present: ${result.fields_present.join(", ") || "none"}`,
    `closeout_verdict: ${result.closeout_verdict || "none"}`,
    `validator_verdict: ${result.validator_verdict}`,
    `reference_checks: ${result.reference_checks}`,
    `remaining_sync: ${result.remaining_sync}`,
    `follow_up_action: ${result.follow_up_action}`,
    `privacy_check: ${result.privacy_check}`,
    `VERDICT: ${result.VERDICT}`,
  ].join("\n");
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }
  if (!args.eventFile) throw new Error("Missing --event-file");

  const result = evaluate(readEvent(args.eventFile));
  if (args.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(printText(result));
  }
  process.exit(0);
} catch (error) {
  console.error(error.message);
  console.error(usage());
  process.exit(2);
}
