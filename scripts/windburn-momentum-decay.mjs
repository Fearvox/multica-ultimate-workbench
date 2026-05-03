#!/usr/bin/env node
import { basename } from "node:path";
import { pathToFileURL } from "node:url";
import {
  getExplorationMomentum,
  getTemporal,
  parseTimestamp,
  readBeliefFile,
  violation,
} from "./windburn-verify.mjs";

const DAY_MS = 24 * 60 * 60 * 1000;

const MOMENTUM_MAP = {
  critical: 1.0,
  high: 0.8,
  medium: 0.5,
  low: 0.25,
  dormant: 0.05,
};

function usage() {
  return [
    "Usage: windburn-momentum-decay [--dry-run] [--format json|text] [--now ISO8601] <belief-file.md>",
    "",
    "Prints the system-clock momentum decay that would apply to a belief.",
    "This MVP reports only; it never writes back to the belief file.",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    format: "json",
    now: new Date(),
    file: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "--now") {
      const raw = argv[++i];
      const parsed = Date.parse(raw);
      if (!Number.isFinite(parsed)) throw new Error(`Invalid --now timestamp: ${raw}`);
      args.now = new Date(parsed);
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

function round(value) {
  return Math.round(value * 100) / 100;
}

function daysBetween(fromMs, toMs) {
  return Math.max(0, (toMs - fromMs) / DAY_MS);
}

function addDays(ms, days) {
  return ms + days * DAY_MS;
}

function ageBucket(ageDays) {
  if (ageDays <= 3) return "fresh";
  if (ageDays <= 14) return "warm";
  if (ageDays <= 30) return "stale";
  return "cold";
}

function bucketTransition(createdAtMs, bucket) {
  if (bucket === "fresh") return createdAtMs;
  if (bucket === "warm") return addDays(createdAtMs, 3);
  if (bucket === "stale") return addDays(createdAtMs, 14);
  return addDays(createdAtMs, 30);
}

function numericFromMomentum(momentum) {
  if (typeof momentum.numeric === "number" && Number.isFinite(momentum.numeric)) {
    return momentum.numeric;
  }
  const level = typeof momentum.level === "string" ? momentum.level.toLowerCase() : null;
  if (level && Object.prototype.hasOwnProperty.call(MOMENTUM_MAP, level)) {
    return MOMENTUM_MAP[level];
  }
  throw new Error("belief is missing a valid explorationMomentum level or numeric value");
}

function levelFromNumeric(value) {
  if (value >= 0.9) return "critical";
  if (value >= 0.65) return "high";
  if (value >= 0.375) return "medium";
  if (value >= 0.15) return "low";
  return "dormant";
}

function computeMomentumDecay(belief, file, now = new Date()) {
  const temporal = getTemporal(belief);
  const momentum = getExplorationMomentum(belief);
  const createdAtMs = parseTimestamp(temporal.created_at);
  if (!createdAtMs) {
    throw new Error("belief is missing a valid temporal.created_at or created_at timestamp");
  }

  const nowMs = now.getTime();
  if (nowMs < createdAtMs) {
    throw new Error("--now is earlier than belief creation time");
  }

  const currentMomentum = numericFromMomentum(momentum);
  const dynamicAgeDays = daysBetween(createdAtMs, nowMs);
  const bucket = ageBucket(dynamicAgeDays);
  const bucketStartedAtMs = bucketTransition(createdAtMs, bucket);
  const daysInBucket = daysBetween(bucketStartedAtMs, nowMs);
  const lastActionAtMs = parseTimestamp(momentum.last_action_at);
  const hasRecentAction = lastActionAtMs != null && lastActionAtMs >= bucketStartedAtMs;

  let decayApplied = 0;
  let reason = "fresh_hold";
  let floor = 0.05;

  if (hasRecentAction) {
    reason = "recent_action_reset";
  } else if (bucket === "warm") {
    decayApplied = -0.15 * (daysInBucket / 11);
    reason = "inactivity_bleed";
  } else if (bucket === "stale") {
    decayApplied = -0.3 * (daysInBucket / 16);
    reason = "inactivity_bleed";
    floor = 0.25;
  } else if (bucket === "cold") {
    decayApplied = -0.05 * (daysInBucket / 7);
    reason = "inactivity_bleed";
    floor = 0.05;
  }

  const newNumeric = hasRecentAction ? currentMomentum : Math.max(floor, currentMomentum + decayApplied);
  const daysSinceLastAction = lastActionAtMs == null ? null : daysBetween(lastActionAtMs, nowMs);

  return {
    file,
    belief_id: belief.id ?? basename(file),
    dry_run: true,
    current_momentum: round(currentMomentum),
    current_momentum_level: momentum.level ?? levelFromNumeric(currentMomentum),
    age_bucket: bucket,
    stored_age_bucket: temporal.age_bucket ?? null,
    days_since_last_action: daysSinceLastAction == null ? null : round(daysSinceLastAction),
    days_in_bucket: round(daysInBucket),
    decay_applied: round(decayApplied),
    new_momentum_numeric: round(newNumeric),
    new_momentum_level: levelFromNumeric(newNumeric),
    reason,
  };
}

function formatText(result) {
  return [
    `${result.belief_id}: ${result.current_momentum} -> ${result.new_momentum_numeric}`,
    `age_bucket=${result.age_bucket}`,
    `new_momentum_level=${result.new_momentum_level}`,
    `reason=${result.reason}`,
  ].join("\n");
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
    const result = computeMomentumDecay(belief, args.file, args.now);
    if (args.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatText(result));
    }
    process.exit(0);
  } catch (error) {
    const result = {
      verdict: "BLOCK",
      violations: [
        violation("momentum-decay-input-error", "BLOCK", error.message, "fix the belief timestamp fields"),
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
  computeMomentumDecay,
  levelFromNumeric,
};
