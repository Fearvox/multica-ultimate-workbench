#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packetPath = join(repoRoot, "issue-templates", "active-memory-packet.md");
const packetPathRelative = "issue-templates/active-memory-packet.md";
const requiredKeys = [
  "Workbench",
  "Windburn",
  "Evensong",
  "Research Vault",
  "active memory",
  "Goal Mode",
];
const requiredFields = [
  "claim",
  "source_refs",
  "evidence_type",
  "causal_delta",
  "trust_state",
  "confidence",
  "exploration_momentum",
  "created_at",
  "observed_at",
  "last_verified_at",
  "privacy",
  "write_decision",
  "retrieval_keys",
  "next_verification",
];
const sourceRefs = [
  "https://blog.walrus.xyz/memwal-long-term-memory-for-ai-agents/",
  "https://www.arxiv.org/pdf/2603.19935",
  "https://arxiv.org/abs/2604.07877v1",
  "https://arxiv.org/html/2602.22769v2",
  "docs/windburn-cognitive-cache-direction.md",
  "docs/windburn-divergence-gated-trust-research.md",
  "skills/workbench-goal-mode-v2/SKILL.md",
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasYamlListScalar(text, value) {
  const escaped = escapeRegex(value);
  const pattern = new RegExp(`^\\s*-\\s*(?:"${escaped}"|'${escaped}'|${escaped})\\s*$`, "m");
  return pattern.test(text);
}

function printJson(result) {
  console.log(JSON.stringify(result, null, 2));
}

let text;
try {
  text = readFileSync(packetPath, "utf8");
} catch (error) {
  printJson({
    packet_path: packetPathRelative,
    required_keys: requiredKeys,
    missing_keys: requiredKeys,
    missing_fields: requiredFields,
    missing_example_sources: sourceRefs,
    discoverability_verified: false,
    verdict: "BLOCK",
    error: `Cannot read ${packetPathRelative}: ${error.message}`,
  });
  process.exit(2);
}

const missingKeys = requiredKeys.filter((key) => !hasYamlListScalar(text, key));
const missingFields = requiredFields.filter((field) => !text.includes(`${field}:`));
const missingSources = sourceRefs.filter((ref) => !text.includes(ref));
const result = {
  packet_path: packetPathRelative,
  required_keys: requiredKeys,
  missing_keys: missingKeys,
  missing_fields: missingFields,
  missing_example_sources: missingSources,
  discoverability_verified:
    missingKeys.length === 0 && missingFields.length === 0 && missingSources.length === 0,
};

printJson(result);

if (!result.discoverability_verified) {
  process.exitCode = 1;
}
