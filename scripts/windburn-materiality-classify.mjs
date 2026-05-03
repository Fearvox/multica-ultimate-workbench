#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const VALID_LABELS = new Set(["material", "adjacent", "speculative", "off_scope"]);
const AUTHORITY_FIELD_NAMES = new Set([
  "confidencedelta",
  "newconfidence",
  "truststate",
  "newtruststate",
  "sourcetruthwrite",
  "lastverifiedat",
  "agebucket",
]);
const AUTHORITY_VERDICTS = new Set(["verified", "trusted", "source-truth"]);

function usage() {
  return [
    "Usage: windburn-materiality-classify classify [--format json|text] --packet <packet-file.md>",
    "",
    "Exit codes:",
    "  0 = PASS: no material alternatives and no adjacent follow-up",
    "  1 = FLAG: no material alternatives, but adjacent follow-up exists",
    "  2 = BLOCK: material alternatives or authority violations exist",
  ].join("\n");
}

function parseArgs(argv) {
  const args = { command: null, format: "text", packet: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "--packet") {
      args.packet = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (!args.command) {
      args.command = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (!["json", "text"].includes(args.format)) {
    throw new Error(`Unsupported format: ${args.format}`);
  }
  if (args.command && args.command !== "classify") {
    throw new Error(`Unsupported command: ${args.command}`);
  }

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

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeFieldName(key) {
  return key.replace(/[-_\s]/g, "").toLowerCase();
}

function authorityViolation(rule, detail, path) {
  return { rule, severity: "BLOCK", detail, path };
}

function collectAuthorityViolations(value, path, violations) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectAuthorityViolations(item, `${path}[${index}]`, violations));
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    const normalized = normalizeFieldName(key);
    if (AUTHORITY_FIELD_NAMES.has(normalized)) {
      violations.push(
        authorityViolation(
          "authority-violation",
          `challenger packet contains authority-bearing field ${childPath}`,
          childPath,
        ),
      );
    }
    if (
      normalized === "verdict" &&
      typeof child === "string" &&
      AUTHORITY_VERDICTS.has(child.toLowerCase())
    ) {
      violations.push(
        authorityViolation(
          "authority-violation",
          `challenger packet contains direct verification verdict ${childPath}: ${child}`,
          childPath,
        ),
      );
    }
    collectAuthorityViolations(child, childPath, violations);
  }
}

function asText(...values) {
  return values
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLowerCase();
}

function containsAny(text, needles) {
  return needles.some((needle) => text.includes(needle));
}

function citationFromClaim(originalClaim) {
  if (typeof originalClaim !== "string") return "";
  return originalClaim.trim();
}

function classifyAlternative(alternative, index, originalClaim) {
  const labelHint = VALID_LABELS.has(alternative?.relevance) ? alternative.relevance : null;
  const text = asText(
    alternative?.claim,
    alternative?.why_it_might_matter,
    alternative?.falsification_test,
    alternative?.discard_condition,
  );

  let label;
  let trigger;

  if (labelHint === "off_scope" || containsAny(text, ["different routing problem", "outside", "off scope"])) {
    label = "off_scope";
    trigger = "the alternative shifts away from the original claim scope";
  } else if (
    labelHint === "speculative" ||
    containsAny(text, ["hypothetical", "future", "no existing", "weakly related", "poetic"])
  ) {
    label = "speculative";
    trigger = "the alternative is future-facing or lacks present evidence";
  } else if (
    labelHint === "adjacent" ||
    containsAny(text, ["sharpen", "wording", "does not change", "verification depth", "precision"])
  ) {
    label = "adjacent";
    trigger = "the alternative sharpens scope or verification without changing truth";
  } else if (
    labelHint === "direct" ||
    containsAny(text, ["rather than", "would change", "missing", "depends", "false", "collapse"])
  ) {
    label = "material";
    trigger = "the alternative could change whether the belief should be promoted";
  } else {
    label = "speculative";
    trigger = "the alternative is parseable but not strong enough to affect trust promotion";
  }

  const actionByLabel = {
    material: "block",
    adjacent: "park",
    speculative: "park",
    off_scope: "discard",
  };

  const result = {
    alternative_index: index,
    label,
    original_claim_phrase: citationFromClaim(originalClaim),
    alternative_phrase: typeof alternative?.claim === "string" ? alternative.claim.trim() : "",
    reasoning: `${trigger}; classifier output routes the alternative but does not change confidence, trust state, source truth, or freshness.`,
    action: actionByLabel[label],
  };

  if (label === "adjacent") {
    result.revisit_trigger = `Revisit if this boundary affects a future promotion: ${alternative.falsification_test}`;
  } else if (label === "speculative") {
    result.revisit_trigger = `Revisit only if concrete evidence appears: ${alternative.falsification_test}`;
  }

  return result;
}

function countLabels(labels, label) {
  return labels.filter((item) => item.label === label).length;
}

function classifyPacket(packet, file) {
  const authorityViolations = [];
  collectAuthorityViolations(packet, "", authorityViolations);

  const alternatives = Array.isArray(packet.alternatives) ? packet.alternatives : [];
  const labels = alternatives.map((alternative, index) =>
    classifyAlternative(alternative, index, packet.original_claim),
  );

  const materialCount = countLabels(labels, "material");
  const adjacentCount = countLabels(labels, "adjacent");
  const speculativeCount = countLabels(labels, "speculative");
  const offScopeCount = countLabels(labels, "off_scope");
  const authorityViolationCount = authorityViolations.length;
  const promotionBlocked = materialCount > 0 || authorityViolationCount > 0;
  const verdict = promotionBlocked ? "BLOCK" : adjacentCount > 0 ? "FLAG" : "PASS";

  return {
    verdict,
    belief_id: packet.belief_id ?? null,
    packet_id: packet.packet_id ?? basename(file, ".md"),
    material_count: materialCount,
    adjacent_count: adjacentCount,
    speculative_count: speculativeCount,
    off_scope_count: offScopeCount,
    labels,
    promotion_blocked: promotionBlocked,
    authority_violation: authorityViolationCount > 0,
    authority_violation_count: authorityViolationCount,
    authority_violations: authorityViolations,
    material_divergence_yield: alternatives.length === 0 ? 0 : materialCount / alternatives.length,
    false_divergence_tax: speculativeCount + offScopeCount,
    early_convergence_block_rate: promotionBlocked ? 1 : 0,
    review_cost: labels.length,
  };
}

function formatText(result) {
  const lines = [`${result.verdict}: ${result.packet_id}`];
  lines.push(
    `material=${result.material_count} adjacent=${result.adjacent_count} speculative=${result.speculative_count} off_scope=${result.off_scope_count}`,
  );
  for (const label of result.labels) {
    lines.push(`${label.action.toUpperCase()} ${label.label} alternatives[${label.alternative_index}]: ${label.reasoning}`);
  }
  for (const item of result.authority_violations) {
    lines.push(`BLOCK ${item.rule}: ${item.detail}`);
  }
  return lines.join("\n");
}

function exitCode(result) {
  if (result.verdict === "BLOCK") return 2;
  if (result.verdict === "FLAG") return 1;
  return 0;
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help || !args.command || !args.packet) {
      console.log(usage());
      process.exit(args?.help ? 0 : 2);
    }

    const markdown = readFileSync(args.packet, "utf8");
    const packet = parseFrontmatter(extractFrontmatter(markdown, args.packet));
    const result = classifyPacket(packet, args.packet);

    if (args.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatText(result));
    }

    process.exit(exitCode(result));
  } catch (error) {
    const result = {
      verdict: "BLOCK",
      belief_id: null,
      packet_id: args?.packet ? basename(args.packet, ".md") : null,
      material_count: 0,
      adjacent_count: 0,
      speculative_count: 0,
      off_scope_count: 0,
      labels: [],
      promotion_blocked: true,
      authority_violation: true,
      authority_violation_count: 1,
      authority_violations: [authorityViolation("classifier-input-error", error.message, null)],
      material_divergence_yield: 0,
      false_divergence_tax: 0,
      early_convergence_block_rate: 1,
      review_cost: 0,
    };
    if (args?.format === "json") console.log(JSON.stringify(result, null, 2));
    else console.error(error.message);
    process.exit(2);
  }
}

main();
