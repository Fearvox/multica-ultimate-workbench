#!/usr/bin/env node
import { readFileSync } from "node:fs";

const REQUIRED_HEADINGS = ["CHANGED", "VERIFIED", "REMAINING", "PRS / LINKS", "VERDICT"];
const VALID_VERDICTS = new Set(["PASS", "FLAG", "BLOCK"]);
const VALID_REFERENCE_TYPES = new Set([
  "contains",
  "dogfood-platform",
  "discovered-via",
  "cross-issue-side-effect",
]);

function usage() {
  return [
    "Usage: workbench-closeout-validator [--format json|text] --comment-file PATH [options]",
    "",
    "Options:",
    "  --target-status STATUS       Lifecycle status requested by the closeout.",
    "  --references-json PATH       JSON array of {type,id,merged,state,head_on_main}.",
    "  --affected-issues-json PATH  JSON array of {id,remaining_synced}.",
    "",
    "Exit codes:",
    "  0 = PASS",
    "  1 = FLAG",
    "  2 = BLOCK",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    format: "text",
    commentFile: null,
    targetStatus: null,
    referencesJson: null,
    affectedIssuesJson: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "--comment-file") {
      args.commentFile = argv[++i];
    } else if (arg === "--target-status") {
      args.targetStatus = argv[++i];
    } else if (arg === "--references-json") {
      args.referencesJson = argv[++i];
    } else if (arg === "--affected-issues-json") {
      args.affectedIssuesJson = argv[++i];
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

function parseComment(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const headingPattern = /^(CHANGED|VERIFIED|REMAINING|PRS \/ LINKS|VERDICT):[ \t]*(.*)$/gm;
  const matches = [...normalized.matchAll(headingPattern)];
  const sections = {};
  const violations = [];

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const heading = match[1];
    const inline = match[2] || "";
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : normalized.length;
    const body = [inline, normalized.slice(start, end)]
      .join("\n")
      .trim();
    if (sections[heading] !== undefined) {
      violations.push({ rule: "duplicate-heading", heading });
    }
    sections[heading] = body;
  }

  const foundOrder = matches.map((match) => match[1]);
  for (const heading of REQUIRED_HEADINGS) {
    if (sections[heading] === undefined) {
      violations.push({ rule: "missing-heading", heading });
    }
  }
  if (
    foundOrder.length >= REQUIRED_HEADINGS.length &&
    REQUIRED_HEADINGS.some((heading, index) => foundOrder[index] !== heading)
  ) {
    violations.push({
      rule: "heading-order-mismatch",
      expected: REQUIRED_HEADINGS.join(" -> "),
      actual: foundOrder.join(" -> "),
    });
  }

  const verdict = (sections.VERDICT || "").trim();
  if (verdict && !VALID_VERDICTS.has(verdict)) {
    violations.push({ rule: "invalid-verdict", value: verdict });
  }

  if (sections.REMAINING !== undefined && !sections.REMAINING.trim()) {
    violations.push({ rule: "empty-remaining" });
  }

  return { sections, verdict, violations };
}

function normalizeStatus(status) {
  return String(status || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function validateStatus(verdict, targetStatus) {
  if (!targetStatus || !verdict) return [];
  const status = normalizeStatus(targetStatus);
  const violations = [];

  if (status === "done" && verdict !== "PASS") {
    violations.push({
      rule: "done-requires-pass",
      status: targetStatus,
      verdict,
    });
  }
  if (status === "blocked" && verdict !== "BLOCK") {
    violations.push({
      rule: "blocked-requires-block",
      status: targetStatus,
      verdict,
    });
  }
  if (status === "readyformerge" && verdict === "BLOCK") {
    violations.push({
      rule: "ready-for-merge-cannot-be-block",
      status: targetStatus,
      verdict,
    });
  }

  return violations;
}

function loadJsonArray(path, label) {
  if (!path) return [];
  const value = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be a JSON array`);
  }
  return value;
}

function extractReferenceTypes(section) {
  const types = [];
  const pattern = /Reference type:\s*(contains|dogfood-platform|discovered-via|cross-issue-side-effect)\b/g;
  for (const match of section.matchAll(pattern)) {
    types.push(match[1]);
  }
  return types;
}

function validateReferences(section, references) {
  const violations = [];
  const warnings = [];
  const sectionTypes = extractReferenceTypes(section);

  for (const type of sectionTypes) {
    if (!VALID_REFERENCE_TYPES.has(type)) {
      violations.push({ rule: "invalid-reference-type", type });
    }
  }

  const containsInText = sectionTypes.includes("contains");
  if (containsInText && references.length === 0) {
    warnings.push({ rule: "contains-reference-state-not-provided" });
  }

  for (const reference of references) {
    if (!VALID_REFERENCE_TYPES.has(reference.type)) {
      violations.push({
        rule: "invalid-reference-type",
        type: reference.type,
        id: reference.id || null,
      });
      continue;
    }

    if (reference.type === "contains") {
      const merged =
        reference.merged === true ||
        reference.state === "merged" ||
        reference.head_on_main === true;
      if (!merged) {
        violations.push({
          rule: "contains-reference-not-merged",
          id: reference.id || null,
          state: reference.state || null,
        });
      }
    }
  }

  return { violations, warnings, sectionTypes };
}

function validateCrossIssueSync(remaining, referenceTypes, affectedIssues) {
  const warnings = [];
  const hasRemaining = remaining.trim() !== "(none)";
  const crossIssue = referenceTypes.includes("cross-issue-side-effect") || affectedIssues.length > 1;

  if (!hasRemaining || !crossIssue) return warnings;

  if (affectedIssues.length === 0) {
    warnings.push({ rule: "cross-issue-remaining-sync-not-proven" });
    return warnings;
  }

  for (const issue of affectedIssues) {
    if (issue.remaining_synced !== true) {
      warnings.push({
        rule: "remaining-not-synced-to-affected-issue",
        issue: issue.id || null,
      });
    }
  }

  return warnings;
}

function evaluate({ comment, targetStatus, references, affectedIssues }) {
  const parsed = parseComment(comment);
  const violations = [...parsed.violations];
  const warnings = [];

  violations.push(...validateStatus(parsed.verdict, targetStatus));

  const referenceResult = validateReferences(parsed.sections["PRS / LINKS"] || "", references);
  violations.push(...referenceResult.violations);
  warnings.push(...referenceResult.warnings);

  warnings.push(
    ...validateCrossIssueSync(
      parsed.sections.REMAINING || "",
      referenceResult.sectionTypes,
      affectedIssues,
    ),
  );

  let verdict = "PASS";
  if (warnings.length > 0) verdict = "FLAG";
  if (violations.length > 0) verdict = "BLOCK";

  return {
    report_type: "WORKBENCH_CLOSEOUT_VALIDATION",
    target_status: targetStatus || null,
    closeout_verdict: parsed.verdict || null,
    validator_verdict: verdict,
    fields_present: REQUIRED_HEADINGS.filter((heading) => parsed.sections[heading] !== undefined),
    reference_types: referenceResult.sectionTypes,
    follow_up_required: verdict !== "PASS",
    follow_up_verdict: verdict === "PASS" ? null : "FLAG",
    warnings,
    violations,
  };
}

function printText(result) {
  const lines = [
    "WORKBENCH_CLOSEOUT_VALIDATION",
    `target_status: ${result.target_status || "none"}`,
    `closeout_verdict: ${result.closeout_verdict || "none"}`,
    `validator_verdict: ${result.validator_verdict}`,
    `follow_up_required: ${result.follow_up_required ? "yes" : "no"}`,
  ];

  if (result.reference_types.length) {
    lines.push(`reference_types: ${result.reference_types.join(", ")}`);
  }
  if (result.warnings.length) {
    lines.push("warnings:", ...result.warnings.map((warning) => `- ${warning.rule}`));
  }
  if (result.violations.length) {
    lines.push("violations:", ...result.violations.map((violation) => `- ${violation.rule}`));
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
  if (!args.commentFile) throw new Error("Missing --comment-file");

  const result = evaluate({
    comment: readFileSync(args.commentFile, "utf8"),
    targetStatus: args.targetStatus,
    references: loadJsonArray(args.referencesJson, "references"),
    affectedIssues: loadJsonArray(args.affectedIssuesJson, "affected issues"),
  });

  if (args.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(printText(result));
  }
  process.exit(exitCode(result.validator_verdict));
} catch (error) {
  console.error(error.message);
  console.error(usage());
  process.exit(2);
}
