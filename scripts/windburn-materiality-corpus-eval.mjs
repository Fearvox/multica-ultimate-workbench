#!/usr/bin/env node
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const classifier = join(repoRoot, "scripts", "windburn-materiality-classify.mjs");
const EXPECTED_MATERIALITIES = new Set(["material", "adjacent", "speculative", "none"]);

function usage() {
  return [
    "Usage: windburn-materiality-corpus-eval evaluate [--format json|text] --belief-dir <dir>",
    "",
    "Generates local-only DivergencePackets from belief fixture expectations,",
    "runs the materiality classifier, and reports aggregate corpus metrics.",
  ].join("\n");
}

function parseArgs(argv) {
  const args = { command: null, format: "text", beliefDir: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "--belief-dir") {
      args.beliefDir = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (!args.command) {
      args.command = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  if (!["json", "text"].includes(args.format)) throw new Error(`Unsupported format: ${args.format}`);
  if (args.command && args.command !== "evaluate") throw new Error(`Unsupported command: ${args.command}`);
  return args;
}

function extractFrontmatter(markdown, file) {
  if (!markdown.startsWith("---\n") && !markdown.startsWith("---\r\n")) {
    throw new Error(`${file} has no YAML frontmatter block`);
  }
  const normalized = markdown.replace(/\r\n/g, "\n");
  const end = normalized.indexOf("\n---", 4);
  if (end === -1) throw new Error(`${file} has an unterminated YAML frontmatter block`);
  return normalized.slice(4, end);
}

function countIndent(line) {
  return line.match(/^ */)[0].length;
}

function nextContentIndent(lines, start) {
  for (let i = start; i < lines.length; i += 1) {
    if (lines[i].trim() && !lines[i].trim().startsWith("#")) return countIndent(lines[i]);
  }
  return null;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed === "null" || trimmed === "~") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "[]") return [];
  if (trimmed === "{}") return {};
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function splitKeyValue(text) {
  const match = text.match(/^([A-Za-z0-9_-]+):(.*)$/);
  if (!match) return null;
  return [match[1], match[2]];
}

function parseFrontmatter(frontmatter) {
  const lines = frontmatter.split("\n");

  function parseMapping(index, indent) {
    const object = {};
    let i = index;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        i += 1;
        continue;
      }
      const currentIndent = countIndent(line);
      if (currentIndent < indent) break;
      if (currentIndent > indent) throw new Error(`Unexpected indentation near: ${trimmed}`);
      if (trimmed.startsWith("- ")) break;

      const pair = splitKeyValue(trimmed);
      if (!pair) throw new Error(`Expected key/value line near: ${trimmed}`);
      const [key, rawValue] = pair;
      const value = rawValue.trim();
      if (value) {
        object[key] = parseScalar(value);
        i += 1;
        continue;
      }

      const childIndent = nextContentIndent(lines, i + 1);
      if (childIndent === null || childIndent <= currentIndent) {
        object[key] = null;
        i += 1;
        continue;
      }
      const childTrimmed = lines[i + 1].trim();
      if (childTrimmed.startsWith("- ")) {
        const parsed = parseSequence(i + 1, childIndent);
        object[key] = parsed.value;
        i = parsed.index;
      } else {
        const parsed = parseMapping(i + 1, childIndent);
        object[key] = parsed.value;
        i = parsed.index;
      }
    }
    return { value: object, index: i };
  }

  function parseSequence(index, indent) {
    const items = [];
    let i = index;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        i += 1;
        continue;
      }
      const currentIndent = countIndent(line);
      if (currentIndent < indent) break;
      if (currentIndent > indent) throw new Error(`Unexpected sequence indentation near: ${trimmed}`);
      if (!trimmed.startsWith("- ")) break;

      const itemText = trimmed.slice(2).trim();
      if (!itemText) {
        const childIndent = nextContentIndent(lines, i + 1);
        if (childIndent === null || childIndent <= currentIndent) {
          items.push(null);
          i += 1;
        } else {
          const parsed = parseMapping(i + 1, childIndent);
          items.push(parsed.value);
          i = parsed.index;
        }
        continue;
      }

      const inlinePair = splitKeyValue(itemText);
      if (inlinePair) {
        const [key, rawValue] = inlinePair;
        const item = { [key]: parseScalar(rawValue.trim()) };
        const childIndent = nextContentIndent(lines, i + 1);
        if (childIndent !== null && childIndent > currentIndent) {
          const parsed = parseMapping(i + 1, childIndent);
          Object.assign(item, parsed.value);
          i = parsed.index;
        } else {
          i += 1;
        }
        items.push(item);
        continue;
      }

      items.push(parseScalar(itemText));
      i += 1;
    }
    return { value: items, index: i };
  }

  return parseMapping(0, 0).value;
}

function quoteYaml(value) {
  return JSON.stringify(String(value));
}

function loadBelief(file) {
  const markdown = readFileSync(file, "utf8");
  const data = parseFrontmatter(extractFrontmatter(markdown, file));
  const expectedMateriality = data.expected?.expected_materiality;
  if (!data.id || !data.claim) throw new Error(`${file} missing id or claim`);
  if (!EXPECTED_MATERIALITIES.has(expectedMateriality)) {
    throw new Error(`${file} has unsupported expected.expected_materiality: ${expectedMateriality}`);
  }
  return {
    file,
    id: data.id,
    claim: data.claim,
    expectedMateriality,
    seededHiddenFlaw: data.expected?.seeded_hidden_flaw === true,
    expectedPromotionOutcome: data.expected?.expected_promotion_outcome ?? null,
  };
}

function primaryAlternativeFor(belief) {
  if (belief.expectedMateriality === "material") {
    return {
      claim: `The seeded hidden flaw may make this belief false or misleading: ${belief.claim}`,
      relevance: "direct",
      why: "If true, this changes whether the belief should be promoted to source truth.",
      falsification: "Run an external verifier against the belief evidence and check whether the hidden flaw invalidates the claim.",
      discard: "Discard only if the external verifier resolves the hidden flaw without changing the claim scope.",
      cost: "medium",
    };
  }
  if (belief.expectedMateriality === "adjacent") {
    return {
      claim: `The claim may need a narrower wording boundary before broad reuse: ${belief.claim}`,
      relevance: "adjacent",
      why: "It sharpens scope but does not change the current trust decision.",
      falsification: "Compare the belief against its current valid scope and see whether the boundary changes promotion eligibility.",
      discard: "Discard if the current valid scope already captures this boundary.",
      cost: "low",
    };
  }
  if (belief.expectedMateriality === "speculative") {
    return {
      claim: `A hypothetical future benchmark might reward a different interpretation of this belief: ${belief.claim}`,
      relevance: "speculative",
      why: "It is future-facing and lacks current evidence that would change promotion.",
      falsification: "Look for an approved benchmark or operator request that makes this future condition current.",
      discard: "Discard if no current benchmark or operator request depends on this interpretation.",
      cost: "medium",
    };
  }
  return {
    claim: `This belief might imply a visual dashboard or UI presentation requirement: ${belief.claim}`,
    relevance: "off_scope",
    why: "It shifts from trust promotion to presentation, which is outside the original claim.",
    falsification: "Check whether the original belief is about UI presentation rather than trust promotion behavior.",
    discard: "Discard because the belief fixture concerns trust behavior, not dashboard presentation.",
    cost: "low",
  };
}

function controlAlternativeFor(belief) {
  return {
    claim: `This belief could require changing unrelated brand colors: ${belief.claim}`,
    relevance: "off_scope",
    why: "It is a control false-divergence alternative outside the trust-promotion claim.",
    falsification: "Check whether the source belief mentions brand color changes.",
    discard: "Discard because brand color changes are unrelated to the belief fixture.",
    cost: "low",
  };
}

function renderPacket(belief) {
  const packetId = `generated-${belief.id}`;
  const alternatives = [primaryAlternativeFor(belief), controlAlternativeFor(belief)];
  return `---
schema_version: 1
packet_id: ${packetId}
belief_id: ${belief.id}
challenger_model: null
generated_at_utc: "2026-05-03T22:45:00Z"
original_claim: ${quoteYaml(belief.claim)}
confidence_change_allowed: false
alternatives:
${alternatives
  .map(
    (alt) => `  - claim: ${quoteYaml(alt.claim)}
    relevance: ${alt.relevance}
    why_it_might_matter: ${quoteYaml(alt.why)}
    falsification_test: ${quoteYaml(alt.falsification)}
    discard_condition: ${quoteYaml(alt.discard)}
    expected_cost: ${alt.cost}`,
  )
  .join("\n")}
hidden_premises:
  - "Generated from sanitized corpus fixture metadata."
untested_boundaries:
  - "Generated packets are deterministic harness probes, not provider output."
retrigger_conditions:
  - "Rerun when belief fixture expectations change."
---

Generated local-only packet for corpus materiality evaluation. It expands hypothesis space only and carries no authority-bearing trust mutation.
`;
}

function runClassifier(packetFile) {
  const result = spawnSync(
    process.execPath,
    [classifier, "classify", "--format", "json", "--packet", packetFile],
    { cwd: repoRoot, encoding: "utf8" },
  );
  let json = null;
  try {
    json = JSON.parse(result.stdout);
  } catch {
    throw new Error(`classifier emitted non-JSON for ${packetFile}: ${result.stderr || result.stdout}`);
  }
  return { status: result.status, json };
}

function increment(object, key) {
  object[key] = (object[key] ?? 0) + 1;
}

function roundMetric(value) {
  return Number(value.toFixed(4));
}

function evaluateCorpus(beliefDir) {
  const beliefFiles = readdirSync(beliefDir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => join(beliefDir, name));
  const beliefs = beliefFiles.map(loadBelief);
  const tempRoot = mkdtempSync(join(tmpdir(), "windburn-materiality-corpus-"));

  const expectedLabelCounts = { material: 0, adjacent: 0, speculative: 0, none: 0 };
  const primaryLabelCounts = { material: 0, adjacent: 0, speculative: 0, off_scope: 0 };
  const failures = [];
  const results = [];
  let authorityViolationCount = 0;
  let actualMaterialCount = 0;
  let totalAlternatives = 0;
  let falseDivergenceTax = 0;
  let reviewCost = 0;
  let hiddenMaterialMissCount = 0;
  let materialExpectationMissCount = 0;

  try {
    for (const belief of beliefs) {
      increment(expectedLabelCounts, belief.expectedMateriality);
      const packetFile = join(tempRoot, `generated-${belief.id}.md`);
      writeFileSync(packetFile, renderPacket(belief));
      const { json } = runClassifier(packetFile);
      const primary = json.labels?.[0]?.label ?? null;
      const expectedPrimary = belief.expectedMateriality === "none" ? "off_scope" : belief.expectedMateriality;
      increment(primaryLabelCounts, primary ?? "missing");

      authorityViolationCount += json.authority_violation_count ?? 0;
      actualMaterialCount += json.material_count ?? 0;
      totalAlternatives += json.labels?.length ?? 0;
      falseDivergenceTax += json.false_divergence_tax ?? 0;
      reviewCost += json.review_cost ?? 0;

      if (belief.expectedMateriality === "material" && primary !== "material") {
        hiddenMaterialMissCount += 1;
        failures.push({ belief_id: belief.id, rule: "hidden-material-missed", expected: "material", actual: primary });
      }
      if (primary !== expectedPrimary) {
        materialExpectationMissCount += 1;
        failures.push({ belief_id: belief.id, rule: "primary-label-mismatch", expected: expectedPrimary, actual: primary });
      }
      if ((json.authority_violation_count ?? 0) !== 0) {
        failures.push({ belief_id: belief.id, rule: "authority-violation", count: json.authority_violation_count });
      }

      results.push({
        belief_id: belief.id,
        expected_materiality: belief.expectedMateriality,
        seeded_hidden_flaw: belief.seededHiddenFlaw,
        expected_primary_label: expectedPrimary,
        primary_label: primary,
        verdict: json.verdict,
        material_count: json.material_count,
        adjacent_count: json.adjacent_count,
        speculative_count: json.speculative_count,
        off_scope_count: json.off_scope_count,
        authority_violation_count: json.authority_violation_count,
        promotion_blocked: json.promotion_blocked,
      });
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  const corpusTotal = beliefs.length;
  const seededHiddenFlawCount = beliefs.filter((belief) => belief.seededHiddenFlaw).length;
  const materialBlockingPackets = results.filter((item) => item.material_count > 0).length;

  const metrics = {
    authority_violation_count: authorityViolationCount,
    hidden_material_miss_count: hiddenMaterialMissCount,
    material_expectation_miss_count: materialExpectationMissCount,
    actual_material_count: actualMaterialCount,
    material_divergence_yield: corpusTotal === 0 ? 0 : roundMetric(actualMaterialCount / corpusTotal),
    false_divergence_tax: falseDivergenceTax,
    false_divergence_tax_rate: totalAlternatives === 0 ? 0 : roundMetric(falseDivergenceTax / totalAlternatives),
    early_convergence_block_rate: corpusTotal === 0 ? 0 : roundMetric(materialBlockingPackets / corpusTotal),
    review_cost: reviewCost,
  };

  return {
    verdict: failures.length === 0 ? "PASS" : "BLOCK",
    corpus_total: corpusTotal,
    generated_packet_count: corpusTotal,
    seeded_hidden_flaw_count: seededHiddenFlawCount,
    expected_label_counts: expectedLabelCounts,
    primary_label_counts: primaryLabelCounts,
    metrics,
    failures,
    results,
  };
}

function formatText(result) {
  const lines = [
    `${result.verdict}: corpus_total=${result.corpus_total} generated_packet_count=${result.generated_packet_count}`,
    `expected=${JSON.stringify(result.expected_label_counts)} primary=${JSON.stringify(result.primary_label_counts)}`,
    `metrics=${JSON.stringify(result.metrics)}`,
  ];
  for (const failure of result.failures) {
    lines.push(`BLOCK ${failure.rule}: ${failure.belief_id} expected=${failure.expected} actual=${failure.actual}`);
  }
  return lines.join("\n");
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help || !args.command || !args.beliefDir) {
      console.log(usage());
      process.exit(args?.help ? 0 : 2);
    }
    const result = evaluateCorpus(args.beliefDir);
    if (args.format === "json") console.log(JSON.stringify(result, null, 2));
    else console.log(formatText(result));
    process.exit(result.verdict === "PASS" ? 0 : 2);
  } catch (error) {
    const result = {
      verdict: "BLOCK",
      corpus_total: 0,
      generated_packet_count: 0,
      seeded_hidden_flaw_count: 0,
      expected_label_counts: { material: 0, adjacent: 0, speculative: 0, none: 0 },
      primary_label_counts: { material: 0, adjacent: 0, speculative: 0, off_scope: 0 },
      metrics: {
        authority_violation_count: 1,
        hidden_material_miss_count: 0,
        material_expectation_miss_count: 0,
        actual_material_count: 0,
        material_divergence_yield: 0,
        false_divergence_tax: 0,
        false_divergence_tax_rate: 0,
        early_convergence_block_rate: 0,
        review_cost: 0,
      },
      failures: [{ rule: "corpus-eval-input-error", detail: error.message }],
      results: [],
    };
    if (args?.format === "json") console.log(JSON.stringify(result, null, 2));
    else console.error(error.message);
    process.exit(2);
  }
}

main();
