#!/usr/bin/env node
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const classifier = join(repoRoot, "scripts", "windburn-materiality-classify.mjs");
const packetDir = join(repoRoot, ".learning", "fixtures", "divergence-gate", "packets");
const expectedDir = join(repoRoot, ".learning", "fixtures", "divergence-gate", "expected");

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
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
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
      if (!trimmed || trimmed.startsWith("#")) { i += 1; continue; }
      const currentIndent = countIndent(line);
      if (currentIndent < indent) break;
      if (currentIndent > indent) throw new Error(`Unexpected indentation near: ${trimmed}`);
      if (trimmed.startsWith("- ")) break;
      const pair = splitKeyValue(trimmed);
      if (!pair) throw new Error(`Expected key/value line near: ${trimmed}`);
      const [key, rawValue] = pair;
      const value = rawValue.trim();
      if (value) { object[key] = parseScalar(value); i += 1; continue; }
      const childIndent = nextContentIndent(lines, i + 1);
      if (childIndent === null || childIndent <= currentIndent) { object[key] = null; i += 1; continue; }
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
      if (!trimmed || trimmed.startsWith("#")) { i += 1; continue; }
      const currentIndent = countIndent(line);
      if (currentIndent < indent) break;
      if (currentIndent > indent) throw new Error(`Unexpected sequence indentation near: ${trimmed}`);
      if (!trimmed.startsWith("- ")) break;
      const itemText = trimmed.slice(2).trim();
      if (!itemText) {
        const childIndent = nextContentIndent(lines, i + 1);
        if (childIndent === null || childIndent <= currentIndent) { items.push(null); i += 1; }
        else { const parsed = parseMapping(i + 1, childIndent); items.push(parsed.value); i = parsed.index; }
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
        } else i += 1;
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

function loadExpected(file) {
  return parseFrontmatter(extractFrontmatter(readFileSync(file, "utf8"), file));
}

function runClassify(packetId) {
  const packet = join(packetDir, `${packetId}.md`);
  const result = spawnSync(process.execPath, [classifier, "classify", "--format", "json", "--packet", packet], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  let json = null;
  try {
    json = JSON.parse(result.stdout);
  } catch {
    // Keep raw stdout/stderr in assertion messages.
  }
  return { ...result, json };
}

const expectedFiles = readdirSync(expectedDir)
  .filter((name) => name.endsWith(".md"))
  .sort();

assert(expectedFiles.length >= 3, "expected at least three materiality expectation fixtures");

for (const name of expectedFiles) {
  const expected = loadExpected(join(expectedDir, name));
  const result = runClassify(expected.packet_id);
  const expectedExit = expected.expected_verdict === "BLOCK" ? 2 : expected.expected_verdict === "FLAG" ? 1 : 0;

  assert.equal(result.status, expectedExit, `${name}: stderr=${result.stderr}\nstdout=${result.stdout}`);
  assert(result.json, `${name}: classifier must emit JSON`);
  assert.equal(result.json.verdict, expected.expected_verdict, name);
  assert.equal(result.json.belief_id, expected.belief_id, name);
  assert.equal(result.json.packet_id, expected.packet_id, name);
  assert.equal(result.json.material_count, expected.expected_material_count, name);
  assert.equal(result.json.adjacent_count, expected.expected_adjacent_count, name);
  assert.equal(result.json.speculative_count, expected.expected_speculative_count, name);
  assert.equal(result.json.off_scope_count, expected.expected_off_scope_count, name);
  assert.equal(result.json.false_divergence_tax, expected.seeded_divergence_tax, name);
  assert.equal(result.json.authority_violation_count, 0, name);
  assert.equal(result.json.authority_violation, false, name);
  assert.equal(result.json.promotion_blocked, expected.expected_promotion_outcome === "block", name);

  const packetText = readFileSync(join(packetDir, `${expected.packet_id}.md`), "utf8");
  const labelsByIndex = new Map(result.json.labels.map((label) => [label.alternative_index, label]));
  for (const expectedLabel of expected.expected_labels ?? []) {
    const actual = labelsByIndex.get(expectedLabel.alternative_index);
    assert(actual, `${name}: missing label ${expectedLabel.alternative_index}`);
    assert.equal(actual.label, expectedLabel.expected_label, `${name}: label ${expectedLabel.alternative_index}`);
    assert.equal(actual.action, expectedLabel.expected_action, `${name}: action ${expectedLabel.alternative_index}`);
    assert(actual.original_claim_phrase && packetText.includes(actual.original_claim_phrase), `${name}: original claim citation must quote packet text`);
    assert(actual.alternative_phrase && packetText.includes(actual.alternative_phrase), `${name}: alternative citation must quote packet text`);
    assert(actual.reasoning && actual.reasoning.length >= 20, `${name}: label needs reasoning`);
  }
}

console.log("windburn-materiality-classify fixtures pass");
