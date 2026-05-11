#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const files = {
  stack: "docs/runtime-orchestration-stack.md",
  template: "issue-templates/runtime-stack-preflight.md",
  agents: "AGENTS.md",
  synthesis: "SYNTHESIS.md",
};

const required = {
  stack: [
    "Hermes",
    "OpenCode",
    "Pi",
    "memory/queue/profile",
    "execution brain",
    "observation layer",
    "PASS",
    "FLAG",
    "BLOCK",
    "RUNTIME_STACK_PREFLIGHT",
    "issue-templates/runtime-stack-preflight.md",
  ],
  template: [
    "RUNTIME_STACK_PREFLIGHT",
    "target_issue_or_goal",
    "requested_runtime_family",
    "selected_layer",
    "source_authority",
    "repo_anchor",
    "tool_envelope",
    "permission_boundary",
    "observer_surface",
    "memory_or_rv_boundary",
    "handoff_surface",
    "timeout_or_cleanup_policy",
    "public_surface_scan",
    "routing_decision",
    "operator_approval_needed",
    "RUNTIME_STACK_PREFLIGHT_CLOSEOUT",
    "VERDICT: PASS | FLAG | BLOCK",
  ],
  agents: [
    "docs/runtime-orchestration-stack.md",
    "issue-templates/runtime-stack-preflight.md",
    "scripts/check-runtime-stack-preflight.mjs",
  ],
  synthesis: [
    "Runtime Orchestration Stack",
    "Hermes",
    "OpenCode",
    "Pi",
    "issue-templates/runtime-stack-preflight.md",
  ],
};

const forbiddenPatterns = [
  { label: "local_unix_absolute_path", regex: /(?:^|[\s"'(])\/(?:Users|root|home)\/[^\s"'`)]+/m },
  { label: "github_token", regex: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { label: "openai_or_provider_key", regex: /\b(?:sk|xai|anthropic|hf)_[A-Za-z0-9_-]{20,}\b/i },
  { label: "authorization_bearer", regex: /Authorization:[ \t]*Bearer\s+[A-Za-z0-9._-]+/i },
  { label: "private_key_block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: "public_ipv4", regex: /\b(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:\d{1,3})){3}\b/ },
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8").replace(/\r\n/g, "\n");
}

const result = {
  checked_files: files,
  missing_terms: {},
  forbidden_hits: {},
  runtime_stack_preflight_verified: true,
};

for (const [key, relativePath] of Object.entries(files)) {
  let text;
  try {
    text = read(relativePath);
  } catch (error) {
    result.missing_terms[key] = [`cannot read ${relativePath}: ${error.message}`];
    result.runtime_stack_preflight_verified = false;
    continue;
  }

  const missing = required[key].filter((term) => !text.includes(term));
  if (missing.length > 0) {
    result.missing_terms[key] = missing;
    result.runtime_stack_preflight_verified = false;
  }

  const hits = forbiddenPatterns.filter(({ regex }) => regex.test(text)).map(({ label }) => label);
  if (hits.length > 0) {
    result.forbidden_hits[key] = hits;
    result.runtime_stack_preflight_verified = false;
  }
}

console.log(JSON.stringify(result, null, 2));

if (!result.runtime_stack_preflight_verified) {
  process.exitCode = 1;
}
