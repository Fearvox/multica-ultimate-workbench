#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const templatePath = join(repoRoot, "issue-templates", "agent-failure-diagnosis-packet.md");
const templatePathRelative = "issue-templates/agent-failure-diagnosis-packet.md";

const requiredTerms = [
  "AGENT_FAILURE_DIAGNOSIS_PACKET",
  "observed_failure_layer",
  "first_unrecoverable_step",
  "provenance_inputs",
  "tool_model_runtime_surface",
  "evidence_status",
  "downstream_effect",
  "blocker_class",
  "duplicate_or_fanout_risk",
  "next_owner_action",
  "PASS",
  "FLAG",
  "BLOCK",
  "DAS-1212",
  "DAS-1455",
  "DAS-1481",
  "DAS-1724",
  "DAS-1847",
  "DAS-1902",
  "AgentRx",
  "PROV-AGENT",
  "MCP-Bench",
  "MCP-Atlas",
  "MCPAgentBench",
  "first unrecoverable step",
];

const sourceRefs = [
  "https://www.microsoft.com/en-us/research/publication/agentrx-diagnosing-ai-agent-failures-from-execution-trajectories/",
  "https://arxiv.org/abs/2602.02475",
  "https://arxiv.org/abs/2508.02866",
  "https://arxiv.org/abs/2508.20453",
  "https://arxiv.org/abs/2602.00933",
  "https://arxiv.org/abs/2512.24565",
];

const forbiddenPatterns = [
  { label: "local_unix_absolute_path", regex: /(?:^|[\s"'(])\/(?:Users|root|home)\/[^\s"'`)]+/m },
  { label: "signed_multica_static_url", regex: /https:\/\/static\.multica\.ai[^\s)]+(?:Policy|Signature|Key-Pair-Id)=/ },
  { label: "aws_access_key_id", regex: /AKIA[0-9A-Z]{16}/ },
  { label: "private_key_block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: "github_token", regex: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { label: "slack_token", regex: /xox[baprs]-[A-Za-z0-9-]{20,}/ },
  { label: "public_ipv4", regex: /\b(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:\d{1,3})){3}\b/ },
];

function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

let text;

try {
  text = readFileSync(templatePath, "utf8").replace(/\r\n/g, "\n");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  printResult({
    template_path: templatePathRelative,
    required_terms: requiredTerms,
    missing_terms: requiredTerms,
    missing_source_refs: sourceRefs,
    forbidden_hits: [],
    diagnosis_packet_verified: false,
    error: `Cannot read ${templatePathRelative}: ${message}`,
  });
  process.exit(1);
}

const missingTerms = requiredTerms.filter((term) => !text.includes(term));
const missingSourceRefs = sourceRefs.filter((ref) => !text.includes(ref));
const forbiddenHits = forbiddenPatterns
  .filter(({ regex }) => regex.test(text))
  .map(({ label }) => label);

const result = {
  template_path: templatePathRelative,
  missing_terms: missingTerms,
  missing_source_refs: missingSourceRefs,
  forbidden_hits: forbiddenHits,
  diagnosis_packet_verified:
    missingTerms.length === 0 && missingSourceRefs.length === 0 && forbiddenHits.length === 0,
};

printResult(result);

if (!result.diagnosis_packet_verified) {
  process.exitCode = 1;
}
