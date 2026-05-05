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
function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

function readPacketText(filePath) {
  try {
    return readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printResult({
      packet_path: packetPathRelative,
      required_keys: requiredKeys,
      missing_keys: requiredKeys,
      missing_fields: requiredFields,
      missing_example_sources: sourceRefs,
      discoverability_verified: false,
      error: `Cannot read ${packetPathRelative}: ${message}`,
    });
    process.exit(1);
  }
}

function collectRetrievalKeys(markdown) {
  const blocks = markdown.matchAll(/^retrieval_keys:\s*\n((?:[ \t]+-\s.*\n?)*)/gm);
  const keys = new Set();

  for (const [, block] of blocks) {
    for (const line of block.split("\n")) {
      const match = line.match(/^\s*-\s*(?:"([^"]+)"|'([^']+)'|([^#\n]+?))\s*$/);
      if (!match) {
        continue;
      }
      const value = (match[1] ?? match[2] ?? match[3])?.trim();
      if (value) {
        keys.add(value);
      }
    }
  }

  return keys;
}

const text = readPacketText(packetPath);
const retrievalKeys = collectRetrievalKeys(text);
const missingKeys = requiredKeys.filter((key) => !retrievalKeys.has(key));
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

printResult(result);

if (!result.discoverability_verified) {
  process.exitCode = 1;
}
