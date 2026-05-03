#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const VALID_RELEVANCE = new Set(["direct", "adjacent", "speculative", "off_scope"]);
const VALID_EXPECTED_COST = new Set(["low", "medium", "high"]);
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
    "Usage: windburn-divergence-gate validate-packet [--format json|text] <packet-file.md>",
    "",
    "Exit codes:",
    "  0 = pass",
    "  2 = one or more blocking violations",
  ].join("\n");
}

function parseArgs(argv) {
  const args = { command: null, format: "text", file: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (!args.command) {
      args.command = arg;
    } else if (!args.file) {
      args.file = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (!["json", "text"].includes(args.format)) {
    throw new Error(`Unsupported format: ${args.format}`);
  }
  if (args.command && args.command !== "validate-packet") {
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
  if (end === -1) {
    throw new Error(`${file} has an unterminated YAML frontmatter block`);
  }

  return normalized.slice(4, end);
}

function countIndent(line) {
  return line.match(/^ */)[0].length;
}

function nextContentIndent(lines, start) {
  for (let i = start; i < lines.length; i += 1) {
    if (lines[i].trim() && !lines[i].trim().startsWith("#")) {
      return countIndent(lines[i]);
    }
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
      if (currentIndent > indent) {
        throw new Error(`Unexpected indentation near: ${trimmed}`);
      }
      if (trimmed.startsWith("- ")) break;

      const pair = splitKeyValue(trimmed);
      if (!pair) {
        throw new Error(`Expected key/value line near: ${trimmed}`);
      }

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
      if (currentIndent > indent) {
        throw new Error(`Unexpected sequence indentation near: ${trimmed}`);
      }
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

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isIso8601Utc(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

function violation(rule, severity, detail, fix, path) {
  const item = { rule, severity, detail, fix };
  if (path) item.path = path;
  return item;
}

function requireField(packet, key, violations) {
  if (!hasOwn(packet, key)) {
    violations.push(
      violation(
        "missing-required-field",
        "BLOCK",
        `required field ${key} is missing`,
        `add ${key} to the packet frontmatter`,
        key,
      ),
    );
    return false;
  }
  return true;
}

function requireStringField(object, key, violations, path) {
  if (!hasOwn(object, key) || !isNonEmptyString(object[key])) {
    violations.push(
      violation(
        "field-requires-string",
        "BLOCK",
        `${path}.${key} must be a non-empty string`,
        `populate ${path}.${key}`,
        `${path}.${key}`,
      ),
    );
    return false;
  }
  return true;
}

function requireStringArray(packet, key, violations) {
  if (!requireField(packet, key, violations)) return;
  if (!Array.isArray(packet[key]) || packet[key].some((item) => typeof item !== "string")) {
    violations.push(
      violation(
        "field-requires-string-array",
        "BLOCK",
        `${key} must be an array of strings`,
        `set ${key} to a YAML sequence of strings`,
        key,
      ),
    );
  }
}

function collectAuthorityViolations(value, path, violations) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectAuthorityViolations(item, `${path}[${index}]`, violations);
    });
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    const normalized = normalizeFieldName(key);
    if (AUTHORITY_FIELD_NAMES.has(normalized)) {
      violations.push(
        violation(
          "authority-violation",
          "BLOCK",
          `challenger packet contains authority-bearing field ${childPath}`,
          "remove confidence, trust, source-truth, and freshness mutations from the packet",
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
        violation(
          "authority-violation",
          "BLOCK",
          `challenger packet contains direct verification verdict ${childPath}: ${child}`,
          "remove verified/trusted/source-truth verdicts from challenger output",
          childPath,
        ),
      );
    }
    collectAuthorityViolations(child, childPath, violations);
  }
}

function validateAlternatives(packet, violations) {
  if (!requireField(packet, "alternatives", violations)) return;
  if (!Array.isArray(packet.alternatives)) {
    violations.push(
      violation(
        "field-requires-array",
        "BLOCK",
        "alternatives must be an array",
        "set alternatives to a YAML sequence",
        "alternatives",
      ),
    );
    return;
  }
  if (packet.alternatives.length < 2) {
    violations.push(
      violation(
        "alternatives-minimum",
        "BLOCK",
        `alternatives must contain at least 2 entries; got ${packet.alternatives.length}`,
        "add at least two challenger alternatives",
        "alternatives",
      ),
    );
  }

  packet.alternatives.forEach((alternative, index) => {
    const path = `alternatives[${index}]`;
    if (!alternative || typeof alternative !== "object" || Array.isArray(alternative)) {
      violations.push(
        violation(
          "alternative-requires-object",
          "BLOCK",
          `${path} must be a mapping`,
          "write each alternative as a YAML mapping",
          path,
        ),
      );
      return;
    }

    requireStringField(alternative, "claim", violations, path);
    requireStringField(alternative, "why_it_might_matter", violations, path);

    if (!hasOwn(alternative, "falsification_test") || !isNonEmptyString(alternative.falsification_test)) {
      violations.push(
        violation(
          "alternative-field-required",
          "BLOCK",
          `${path}.falsification_test must be a non-empty string`,
          "add a concrete falsification test",
          `${path}.falsification_test`,
        ),
      );
    }
    if (!hasOwn(alternative, "discard_condition") || !isNonEmptyString(alternative.discard_condition)) {
      violations.push(
        violation(
          "alternative-field-required",
          "BLOCK",
          `${path}.discard_condition must be a non-empty string`,
          "add a concrete discard condition",
          `${path}.discard_condition`,
        ),
      );
    }

    if (!VALID_RELEVANCE.has(alternative.relevance)) {
      violations.push(
        violation(
          "invalid-alternative-relevance",
          "BLOCK",
          `${path}.relevance must be one of ${Array.from(VALID_RELEVANCE).join(", ")}; got ${alternative.relevance}`,
          "set relevance to direct, adjacent, speculative, or off_scope",
          `${path}.relevance`,
        ),
      );
    }
    if (!VALID_EXPECTED_COST.has(alternative.expected_cost)) {
      violations.push(
        violation(
          "invalid-alternative-expected-cost",
          "BLOCK",
          `${path}.expected_cost must be one of ${Array.from(VALID_EXPECTED_COST).join(", ")}; got ${alternative.expected_cost}`,
          "set expected_cost to low, medium, or high",
          `${path}.expected_cost`,
        ),
      );
    }
  });
}

function validatePacket(packet, file) {
  const violations = [];
  const warnings = [];

  collectAuthorityViolations(packet, "", violations);

  for (const key of [
    "schema_version",
    "belief_id",
    "challenger_model",
    "generated_at_utc",
    "original_claim",
    "confidence_change_allowed",
  ]) {
    requireField(packet, key, violations);
  }

  if (packet.schema_version !== 1) {
    violations.push(
      violation(
        "unsupported-schema-version",
        "BLOCK",
        `schema_version must be 1; got ${packet.schema_version}`,
        "set schema_version: 1",
        "schema_version",
      ),
    );
  }
  if (!isNonEmptyString(packet.belief_id)) {
    violations.push(
      violation(
        "field-requires-string",
        "BLOCK",
        "belief_id must be a non-empty string",
        "set belief_id to the source belief id",
        "belief_id",
      ),
    );
  }
  if (!(packet.challenger_model === null || isNonEmptyString(packet.challenger_model))) {
    violations.push(
      violation(
        "field-requires-nullable-string",
        "BLOCK",
        "challenger_model must be a string or null",
        "set challenger_model to a model name or null",
        "challenger_model",
      ),
    );
  }
  if (!isIso8601Utc(packet.generated_at_utc)) {
    violations.push(
      violation(
        "field-requires-iso8601-utc",
        "BLOCK",
        "generated_at_utc must be an ISO-8601 UTC timestamp",
        "set generated_at_utc to a timestamp like 2026-05-03T21:30:00Z",
        "generated_at_utc",
      ),
    );
  }
  if (!isNonEmptyString(packet.original_claim)) {
    violations.push(
      violation(
        "field-requires-string",
        "BLOCK",
        "original_claim must be a non-empty string",
        "copy the source belief claim into original_claim",
        "original_claim",
      ),
    );
  }
  if (packet.confidence_change_allowed !== false) {
    violations.push(
      violation(
        "confidence-change-not-allowed",
        "BLOCK",
        "confidence_change_allowed must be false",
        "set confidence_change_allowed: false",
        "confidence_change_allowed",
      ),
    );
  }

  validateAlternatives(packet, violations);
  requireStringArray(packet, "hidden_premises", violations);
  requireStringArray(packet, "untested_boundaries", violations);
  requireStringArray(packet, "retrigger_conditions", violations);

  return {
    verdict: violations.length > 0 ? "BLOCK" : "PASS",
    violations,
    warnings,
    packet_id: packet.packet_id ?? basename(file, ".md"),
    belief_id: packet.belief_id ?? null,
  };
}

function formatText(result) {
  const lines = [`${result.verdict}: ${result.packet_id}`];
  for (const item of result.violations) {
    lines.push(`BLOCK ${item.rule}: ${item.detail}`);
  }
  for (const item of result.warnings) {
    lines.push(`FLAG ${item.rule}: ${item.detail}`);
  }
  return lines.join("\n");
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help || !args.command || !args.file) {
      console.log(usage());
      process.exit(args?.help ? 0 : 2);
    }

    const markdown = readFileSync(args.file, "utf8");
    const frontmatter = extractFrontmatter(markdown, args.file);
    const packet = parseFrontmatter(frontmatter);
    const result = validatePacket(packet, args.file);

    if (args.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatText(result));
    }

    process.exit(result.violations.length > 0 ? 2 : 0);
  } catch (error) {
    const result = {
      verdict: "BLOCK",
      violations: [
        violation("validator-input-error", "BLOCK", error.message, "fix the input file or CLI invocation"),
      ],
      warnings: [],
      packet_id: args?.file ? basename(args.file, ".md") : null,
      belief_id: null,
    };
    if (args?.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(2);
  }
}

main();
