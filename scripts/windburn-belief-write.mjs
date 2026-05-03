#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import {
  readBeliefFile,
  verifyBelief,
  violation,
} from "./windburn-verify.mjs";

function usage() {
  return [
    "Usage: windburn-belief-write --source <candidate.md> --dest <belief.md> [--strict] [--format json|text]",
    "",
    "Runs windburn-verify before writing a belief into its destination path.",
    "The verifier reports only; this script copies the file only if the report is non-blocking.",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    source: null,
    dest: null,
    strict: false,
    format: "json",
    overwrite: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--source") {
      args.source = argv[++i];
    } else if (arg === "--dest") {
      args.dest = argv[++i];
    } else if (arg === "--strict") {
      args.strict = true;
    } else if (arg === "--overwrite") {
      args.overwrite = true;
    } else if (arg === "--format") {
      args.format = argv[++i];
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

function writeBelief({ source, dest, strict = false, overwrite = false }) {
  if (!source) throw new Error("--source is required");
  if (!dest) throw new Error("--dest is required");

  const { belief } = readBeliefFile(source);
  const verification = verifyBelief(belief, source);
  const blocked = verification.violations.length > 0 || (strict && verification.warnings.length > 0);

  if (blocked) {
    return {
      verdict: "BLOCK",
      source,
      dest,
      written: false,
      verification,
    };
  }

  if (existsSync(dest) && !overwrite) {
    throw new Error(`destination already exists: ${dest}`);
  }

  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(source, dest);

  return {
    verdict: verification.warnings.length > 0 ? "FLAG" : "PASS",
    source,
    dest,
    written: true,
    verification,
  };
}

function formatText(result) {
  const lines = [`${result.verdict}: ${result.source} -> ${result.dest}`];
  lines.push(`written=${result.written}`);
  for (const item of result.verification?.violations ?? []) {
    lines.push(`BLOCK ${item.rule}: ${item.detail}`);
  }
  for (const item of result.verification?.warnings ?? []) {
    lines.push(`FLAG ${item.rule}: ${item.detail}`);
  }
  return lines.join("\n");
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log(usage());
      process.exit(0);
    }

    const result = writeBelief(args);
    if (args.format === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatText(result));
    }
    process.exit(result.verdict === "BLOCK" ? 2 : result.verdict === "FLAG" ? 1 : 0);
  } catch (error) {
    const result = {
      verdict: "BLOCK",
      written: false,
      verification: {
        verdict: "BLOCK",
        violations: [
          violation("belief-write-input-error", "BLOCK", error.message, "fix the CLI invocation or destination path"),
        ],
        warnings: [],
      },
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
  writeBelief,
};
