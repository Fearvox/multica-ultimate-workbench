#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const fixturePathRelative = "issue-templates/rv-search-claim-fixture.md";
const fixturePath = join(repoRoot, fixturePathRelative);

const requiredStrings = [
  "RV_SEARCH_CLAIM_FIXTURE",
  "query_term",
  "expected_claims",
  "expected_source_surfaces",
  "acceptable_fallback_sources",
  "empty_result_classification",
  "minimum_evidence_before_new_research_issue",
  "true_negative",
  "index_gap",
  "tool_selection_gap",
  "vault_degraded",
  "DAS-1212",
  "DAS-1689",
  "DAS-1481",
  "DAS-1724",
  "DAS-1789",
  "https://arxiv.org/abs/2602.00933",
];

const currentRepoRefs = [
  "SYNTHESIS.md",
  "docs/remote-rv-mcp.md",
  "issue-templates/active-memory-packet.md",
  "issue-templates/rv-mcp-remote-preflight.md",
  "scripts/check-active-memory-discoverability.mjs",
  "skills/workbench-l2-pressure-gate/SKILL.md",
];

const forbiddenPatterns = [
  /file:\/\//,
  /\/Users\//,
  /\/root\//,
  /\/home\//,
  /_local[-]cred/,
  /Workbench\s+Max/,
];

function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

let text = "";
try {
  text = readFileSync(fixturePath, "utf8").replace(/\r\n/g, "\n");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  printResult({
    fixture_path: fixturePathRelative,
    fixture_valid: false,
    error: `Cannot read ${fixturePathRelative}: ${message}`,
  });
  process.exit(1);
}

const missingStrings = requiredStrings.filter((value) => !text.includes(value));
const missingCurrentRepoRefs = currentRepoRefs.filter((ref) => !text.includes(ref));
const missingCurrentRepoFiles = currentRepoRefs.filter((ref) => !existsSync(join(repoRoot, ref)));
const forbiddenMatches = forbiddenPatterns
  .filter((pattern) => pattern.test(text))
  .map((pattern) => pattern.toString());

const result = {
  fixture_path: fixturePathRelative,
  missing_strings: missingStrings,
  missing_current_repo_refs: missingCurrentRepoRefs,
  missing_current_repo_files: missingCurrentRepoFiles,
  forbidden_matches: forbiddenMatches,
  fixture_valid:
    missingStrings.length === 0 &&
    missingCurrentRepoRefs.length === 0 &&
    missingCurrentRepoFiles.length === 0 &&
    forbiddenMatches.length === 0,
};

printResult(result);

if (!result.fixture_valid) {
  process.exitCode = 1;
}
