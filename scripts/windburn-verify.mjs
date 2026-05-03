#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";

const EXTERNAL_EVIDENCE_TYPES = new Set([
  "benchmark",
  "experiment",
  "review",
  "external_observation",
]);

const HOT_MOMENTUM_LEVELS = new Set(["high", "critical"]);

function usage() {
  return [
    "Usage: windburn-verify [--format json|text] [--strict] <belief-file.md>",
    "",
    "Exit codes:",
    "  0 = pass",
    "  1 = one or more warnings",
    "  2 = one or more blocking violations",
  ].join("\n");
}

function parseArgs(argv) {
  const args = { format: "text", strict: false, file: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "--strict") {
      args.strict = true;
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
  return object != null && Object.prototype.hasOwnProperty.call(object, key);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function isEmpty(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function evidenceHasExternalSource(evidence) {
  return asArray(evidence).some((entry) => {
    if (typeof entry === "string") {
      const match = entry.match(/source[_-]?type\s*[:=]\s*([A-Za-z0-9_-]+)/i);
      return match ? EXTERNAL_EVIDENCE_TYPES.has(match[1].toLowerCase()) : false;
    }
    if (entry && typeof entry === "object") {
      const sourceType = entry.source_type ?? entry.sourceType;
      return typeof sourceType === "string" && EXTERNAL_EVIDENCE_TYPES.has(sourceType.toLowerCase());
    }
    return false;
  });
}

function evidenceHasSupervisorReview(evidence) {
  return asArray(evidence).some((entry) => {
    if (typeof entry === "string") return /supervisor|review/i.test(entry);
    if (entry && typeof entry === "object") {
      const sourceType = entry.source_type ?? entry.sourceType;
      const text = Object.values(entry).join(" ");
      return sourceType === "review" || /supervisor|review/i.test(text);
    }
    return false;
  });
}

function hasChallengeReview(belief) {
  if (!isEmpty(belief.counterEvidence)) return true;
  if (!isEmpty(belief.challenge_review)) return true;
  if (!isEmpty(belief.challengeReview)) return true;
  if (!isEmpty(belief.challenge_reviewed_at)) return true;
  if (!isEmpty(belief.challengeReviewedAt)) return true;
  if (!isEmpty(belief.counterEvidenceReview)) return true;
  if (!isEmpty(belief.counter_evidence_review)) return true;
  if (!isEmpty(belief.falsification_attempts)) return true;
  if (!isEmpty(belief.falsificationAttempts)) return true;
  return false;
}

function violation(rule, severity, detail, fix) {
  return { rule, severity, detail, fix };
}

function getTemporal(belief) {
  const temporal = belief.temporal && typeof belief.temporal === "object" ? belief.temporal : {};
  return {
    created_at: temporal.created_at ?? belief.created_at ?? belief.createdAt,
    observed_at: temporal.observed_at ?? belief.observed_at ?? belief.observedAt,
    last_verified_at:
      hasOwn(temporal, "last_verified_at") ? temporal.last_verified_at : belief.last_verified_at ?? belief.lastVerifiedAt,
    last_accessed_at: temporal.last_accessed_at ?? belief.last_accessed_at ?? belief.lastAccessedAt,
    age_bucket: temporal.age_bucket ?? belief.age_bucket ?? belief.ageBucket,
    bucket_transition_at: temporal.bucket_transition_at ?? belief.bucket_transition_at ?? belief.bucketTransitionAt,
    has_last_verified_at: hasOwn(temporal, "last_verified_at") || hasOwn(belief, "last_verified_at") || hasOwn(belief, "lastVerifiedAt"),
    has_age_bucket: hasOwn(temporal, "age_bucket") || hasOwn(belief, "age_bucket") || hasOwn(belief, "ageBucket"),
  };
}

function getExplorationMomentum(belief) {
  const raw = belief.explorationMomentum ?? belief.exploration_momentum;
  if (typeof raw === "string") {
    return {
      level: raw,
      last_action_at: belief.last_action_at ?? belief.lastActionAt ?? null,
    };
  }
  if (raw && typeof raw === "object") {
    return {
      level: raw.level,
      numeric: raw.numeric,
      declared_at: raw.declared_at,
      last_action_at: raw.last_action_at ?? raw.lastActionAt ?? null,
    };
  }
  return {
    level: null,
    last_action_at: belief.last_action_at ?? belief.lastActionAt ?? null,
  };
}

function parseTimestamp(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function isHotMomentumStale(belief) {
  const temporal = getTemporal(belief);
  const momentum = getExplorationMomentum(belief);
  const level = typeof momentum.level === "string" ? momentum.level.toLowerCase() : null;

  if (!HOT_MOMENTUM_LEVELS.has(level)) return null;
  if (temporal.age_bucket === "fresh") return null;

  const lastActionAt = parseTimestamp(momentum.last_action_at);
  const bucketTransitionAt = parseTimestamp(temporal.bucket_transition_at);

  if (!lastActionAt) {
    return "high exploration momentum has no last_action_at";
  }
  if (!bucketTransitionAt) {
    return "high exploration momentum has no bucket_transition_at for staleness comparison";
  }
  if (lastActionAt < bucketTransitionAt) {
    return "high exploration momentum last_action_at is older than bucket_transition_at";
  }
  return null;
}

function verifyBelief(belief, file) {
  const violations = [];
  const warnings = [];
  const trustState = belief.trustState;
  const confidence = Number(belief.confidence);
  const temporal = getTemporal(belief);

  if (trustState === "verified" && !hasChallengeReview(belief)) {
    violations.push(
      violation(
        "verified-requires-challenge-review",
        "BLOCK",
        'trustState is "verified" but no counter-evidence or challenge review record is present',
        "attach a challenge review/falsification record, or downgrade trustState to hypothesis",
      ),
    );
  }

  if (Number.isFinite(confidence) && confidence >= 0.8 && !evidenceHasExternalSource(belief.evidence)) {
    violations.push(
      violation(
        "high-confidence-requires-external-evidence",
        "BLOCK",
        `confidence ${confidence.toFixed(2)} >= 0.80 with no external evidence source`,
        "attach benchmark, experiment, review, or external_observation evidence, or reduce confidence below 0.80",
      ),
    );
  }

  if (hasOwn(belief, "promotion_request") && isEmpty(belief.promotion_request?.required_evidence)) {
    violations.push(
      violation(
        "promotion-request-requires-required-evidence",
        "BLOCK",
        "promotion_request is present but required_evidence is empty",
        "populate promotion_request.required_evidence with at least one concrete item",
      ),
    );
  }

  if (trustState !== "parking" && (!temporal.has_last_verified_at || !temporal.has_age_bucket)) {
    warnings.push(
      violation(
        "staleness-fields-required",
        "FLAG",
        "non-parking belief is missing last_verified_at or age_bucket field",
        "populate last_verified_at and age_bucket; last_verified_at may be null when no external verification has occurred",
      ),
    );
  }

  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    violations.push(
      violation(
        "confidence-bounds",
        "BLOCK",
        `confidence must be a number between 0.0 and 1.0; got ${belief.confidence}`,
        "set confidence to a value between 0.0 and 1.0",
      ),
    );
  }

  if (
    trustState === "trusted" &&
    belief.promotion_request?.requested_state !== "trusted" &&
    !evidenceHasSupervisorReview(belief.evidence)
  ) {
    warnings.push(
      violation(
        "trusted-requires-supervisor-review",
        "FLAG",
        "trusted state has no trusted promotion request or Supervisor review evidence",
        "add Supervisor review evidence or downgrade to verified",
      ),
    );
  }

  if (typeof belief.claim !== "string" || belief.claim.trim().length < 10) {
    violations.push(
      violation(
        "claim-must-be-present",
        "BLOCK",
        "claim is empty or shorter than 10 characters",
        "write a non-trivial claim",
      ),
    );
  }

  const evidenceText = asArray(belief.evidence)
    .map((entry) => (typeof entry === "string" ? entry : JSON.stringify(entry)))
    .join(" ");
  if (belief.decayPolicy === "session" && isEmpty(belief.episodeId) && !/episodeId|episode_id/i.test(evidenceText)) {
    warnings.push(
      violation(
        "session-beliefs-require-episode-reference",
        "FLAG",
        "session-scoped belief has no episodeId reference",
        "add episode evidence or change decayPolicy",
      ),
    );
  }

  const staleMomentumReason = isHotMomentumStale(belief);
  if (staleMomentumReason) {
    warnings.push(
      violation(
        "hot-momentum-requires-recent-action",
        "FLAG",
        staleMomentumReason,
        "take an exploration action, downgrade explorationMomentum, or accept the flag",
      ),
    );
  }

  const verdict = violations.length > 0 ? "BLOCK" : warnings.length > 0 ? "FLAG" : "PASS";
  return {
    file,
    id: belief.id ?? basename(file),
    verdict,
    violations,
    warnings,
  };
}

function formatText(result) {
  const lines = [`${result.verdict}: ${result.file}`];
  for (const item of result.violations) {
    lines.push(`BLOCK ${item.rule}: ${item.detail}`);
  }
  for (const item of result.warnings) {
    lines.push(`FLAG ${item.rule}: ${item.detail}`);
  }
  return lines.join("\n");
}

function readBeliefFile(file) {
  const markdown = readFileSync(file, "utf8");
  const frontmatter = extractFrontmatter(markdown, file);
  return {
    markdown,
    frontmatter,
    belief: parseFrontmatter(frontmatter),
  };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help || !args.file) {
      console.log(usage());
      process.exit(args.help ? 0 : 2);
    }

    const { belief } = readBeliefFile(args.file);
    const result = verifyBelief(belief, args.file);

    if (args.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatText(result));
    }

    if (result.violations.length > 0 || (args.strict && result.warnings.length > 0)) {
      process.exit(2);
    }
    process.exit(result.warnings.length > 0 ? 1 : 0);
  } catch (error) {
    const result = {
      verdict: "BLOCK",
      violations: [
        violation("verifier-input-error", "BLOCK", error.message, "fix the input file or CLI invocation"),
      ],
      warnings: [],
    };
    if (args?.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

export {
  asArray,
  extractFrontmatter,
  getExplorationMomentum,
  getTemporal,
  hasOwn,
  isEmpty,
  parseFrontmatter,
  parseTimestamp,
  readBeliefFile,
  verifyBelief,
  violation,
};
