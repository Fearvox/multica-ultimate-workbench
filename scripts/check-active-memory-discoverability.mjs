#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = process.cwd();
const packetPath = resolve(repoRoot, 'issue-templates/active-memory-packet.md');
const text = readFileSync(packetPath, 'utf8');

const requiredKeys = [
  'Workbench',
  'Windburn',
  'Evensong',
  'Research Vault',
  'active memory',
  'Goal Mode',
];

const missingKeys = requiredKeys.filter((key) => !text.includes(`"${key}"`));
const requiredFields = [
  'claim',
  'source_refs',
  'evidence_type',
  'causal_delta',
  'trust_state',
  'confidence',
  'exploration_momentum',
  'created_at',
  'observed_at',
  'last_verified_at',
  'privacy',
  'write_decision',
  'retrieval_keys',
  'next_verification',
];
const missingFields = requiredFields.filter((field) => !text.includes(`${field}:`));

const sourceRefs = [
  'https://blog.walrus.xyz/memwal-long-term-memory-for-ai-agents/',
  'https://www.arxiv.org/pdf/2603.19935',
  'https://arxiv.org/abs/2604.07877v1',
  'https://arxiv.org/html/2602.22769v2',
  'docs/windburn-cognitive-cache-direction.md',
  'docs/windburn-divergence-gated-trust-research.md',
  'skills/workbench-goal-mode-v2/SKILL.md',
];
const missingSources = sourceRefs.filter((ref) => !text.includes(ref));

const result = {
  packet_path: 'issue-templates/active-memory-packet.md',
  required_keys: requiredKeys,
  missing_keys: missingKeys,
  missing_fields: missingFields,
  missing_example_sources: missingSources,
  discoverability_verified:
    missingKeys.length === 0 && missingFields.length === 0 && missingSources.length === 0,
};

console.log(JSON.stringify(result, null, 2));

if (!result.discoverability_verified) {
  process.exitCode = 1;
}
