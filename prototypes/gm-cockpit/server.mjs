#!/usr/bin/env node
import http from 'node:http';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, 'public');
const port = Number(process.env.GM_COCKPIT_PORT || 4877);
const glancesUrl = process.env.GLANCES_URL || 'http://127.0.0.1:61208/api/4/all';
const workbenchRepo = process.env.MUW_REPO || process.cwd();

const run = async (cmd, args = [], opts = {}) => {
  try {
    const { stdout, stderr } = await execFileP(cmd, args, {
      timeout: opts.timeout || 2500,
      maxBuffer: opts.maxBuffer || 256_000,
      cwd: opts.cwd,
      env: { ...process.env, LC_ALL: 'C' },
    });
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    return {
      ok: false,
      stdout: (error.stdout || '').trim(),
      stderr: (error.stderr || error.message || '').trim(),
      code: error.code ?? null,
    };
  }
};

const bytes = (n) => {
  if (!Number.isFinite(n)) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = n;
  let i = 0;
  while (Math.abs(v) >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v >= 10 || i === 0 ? v.toFixed(0) : v.toFixed(1)}${units[i]}`;
};

const severity = ({ cpu = 0, mem = 0, swap = 0, hermesCpu = 0 }) => {
  if (swap >= 90 || hermesCpu >= 95) return 'critical';
  if (swap >= 75 || mem >= 80 || cpu >= 85 || hermesCpu >= 75) return 'watch';
  return 'clear';
};

const statusRank = { clear: 0, watch: 1, critical: 2, unavailable: 1 };
const tierRank = { P0: 0, P1: 1, P2: 2, PARKED: 3 };

const sanitizeText = (value, limit = 220) => {
  const text = String(value ?? '')
    .replace(/\/Users\/[^\s,;:)]+/g, '[local-path]')
    .replace(/(^|\s)\/(?:Applications|opt|Library|System|private|tmp|var)\/[^\s,;:)]+/g, '$1[local-path]')
    .replace(/file:\/\/[^\s,;:)]+/g, '[file-url]')
    .replace(/(?:\d{1,3}\.){3}\d{1,3}/g, '[host]')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(/(token|api[_-]?key|secret|password)=\S+/gi, '$1=[redacted]')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
};

const parseJson = (text) => {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

const adapter = ({ ok = true, status = 'clear', items = [], receipt = 'no receipt' }) => ({
  ok,
  status,
  items: items
    .map((item) => ({
      tier: ['P0', 'P1', 'P2', 'PARKED'].includes(item.tier) ? item.tier : 'P2',
      title: sanitizeText(item.title, 96),
      detail: sanitizeText(item.detail, 180),
      evidence: sanitizeText(item.evidence, 120),
    }))
    .slice(0, 6),
  receipt: sanitizeText(receipt, 180),
});

const unavailableAdapter = (title, detail, receipt) => adapter({
  ok: false,
  status: 'unavailable',
  items: [{ tier: 'P2', title, detail, evidence: 'UNAVAILABLE: read-only probe' }],
  receipt,
});

const mergeStatus = (...statuses) => statuses.reduce((acc, status) => (
  statusRank[status] > statusRank[acc] ? status : acc
), 'clear');

const adapterActions = (...adapters) => adapters
  .flatMap((entry) => entry?.items || [])
  .sort((a, b) => (tierRank[a.tier] ?? 9) - (tierRank[b.tier] ?? 9))
  .slice(0, 4);

async function getGlances() {
  try {
    const res = await fetch(glancesUrl, { signal: AbortSignal.timeout(1800) });
    if (!res.ok) throw new Error(`Glances HTTP ${res.status}`);
    return { ok: true, data: await res.json() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function getGit() {
  const root = await run('git', ['rev-parse', '--show-toplevel'], { cwd: workbenchRepo });
  if (!root.ok) return { ok: false, label: 'not a git checkout', detail: root.stderr, stderr: root.stderr, code: root.code ?? null };
  const status = await run('git', ['status', '--short', '--branch'], { cwd: root.stdout });
  if (!status.ok) {
    return { ok: false, label: 'git status failed', detail: status.stderr || 'git status --short --branch failed', stderr: status.stderr, code: status.code ?? null };
  }
  const head = await run('git', ['rev-parse', '--short', 'HEAD'], { cwd: root.stdout });
  if (!head.ok) {
    return { ok: false, label: 'git head failed', detail: head.stderr || 'git rev-parse --short HEAD failed', stderr: head.stderr, code: head.code ?? null };
  }
  const branch = await run('git', ['branch', '--show-current'], { cwd: root.stdout });
  if (!branch.ok) {
    return { ok: false, label: 'git branch failed', detail: branch.stderr || 'git branch --show-current failed', stderr: branch.stderr, code: branch.code ?? null };
  }
  const dirtyLines = status.stdout.split('\n').filter((line) => line && !line.startsWith('##'));
  return {
    ok: true,
    root: root.stdout,
    branch: branch.stdout,
    head: head.stdout,
    status: status.stdout,
    dirtyCount: dirtyLines.length,
    dirtyLines: dirtyLines.slice(0, 8),
  };
}

function parseHermesCronList(text) {
  const jobs = [];
  let current = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    const header = line.match(/^([a-f0-9]{8,})\s+\[([^\]]+)\]/i);
    if (header) {
      current = { id: header[1], state: header[2], name: 'unnamed job' };
      jobs.push(current);
      continue;
    }
    if (!current) continue;
    const field = line.match(/^([A-Za-z ]+):\s+(.+)$/);
    if (!field) continue;
    const key = field[1].toLowerCase().replace(/\s+/g, '_');
    current[key] = sanitizeText(field[2], 140);
  }
  return jobs;
}

async function getAutomation() {
  const hermesPath = await run('/bin/zsh', ['-lc', 'command -v hermes || true']);
  if (!hermesPath.stdout) {
    return unavailableAdapter(
      'Hermes cron unavailable',
      'hermes binary is not on PATH for this cockpit server.',
      'hermes: command not found',
    );
  }

  const [status, list] = await Promise.all([
    run(hermesPath.stdout, ['cron', 'status'], { timeout: 3000, maxBuffer: 64_000 }),
    run(hermesPath.stdout, ['cron', 'list'], { timeout: 3000, maxBuffer: 96_000 }),
  ]);

  if (!status.ok && !list.ok) {
    return unavailableAdapter(
      'Hermes cron probe failed',
      status.stderr || list.stderr || 'cron status/list produced no usable output.',
      'hermes cron: unavailable',
    );
  }

  const statusText = sanitizeText(status.stdout || status.stderr, 320);
  const jobs = parseHermesCronList(list.stdout || '');
  const gatewayRunning = /gateway is running|cron jobs will fire/i.test(statusText);
  const failed = jobs.filter((job) => /fail|error|blocked/i.test(`${job.last_run || ''} ${job.state || ''}`));
  const paused = jobs.filter((job) => /paused|disabled/i.test(job.state || ''));
  const items = [];

  for (const job of failed.slice(0, 3)) {
    items.push({
      tier: 'P0',
      title: `Cron failure: ${job.name}`,
      detail: job.last_run || 'Scheduled job reports a failed/error state.',
      evidence: 'LIVE_VERIFIED: hermes cron list',
    });
  }
  if (!gatewayRunning) {
    items.push({
      tier: 'P0',
      title: 'Cron gateway is not confirmed running',
      detail: statusText || 'hermes cron status did not confirm gateway health.',
      evidence: 'FLAGGED: hermes cron status',
    });
  }
  for (const job of paused.slice(0, Math.max(0, 3 - items.length))) {
    items.push({
      tier: 'P1',
      title: `Cron paused: ${job.name}`,
      detail: job.next_run ? `next run would be ${job.next_run}` : 'Paused scheduled job needs operator awareness.',
      evidence: 'LIVE_VERIFIED: hermes cron list',
    });
  }
  if (items.length === 0) {
    for (const job of jobs.slice(0, 3)) {
      items.push({
        tier: 'P2',
        title: job.name,
        detail: job.next_run ? `next run ${job.next_run}` : `state ${job.state || 'unknown'}`,
        evidence: 'LIVE_VERIFIED: hermes cron list',
      });
    }
  }

  return adapter({
    ok: status.ok || list.ok,
    status: failed.length || !gatewayRunning ? 'critical' : paused.length ? 'watch' : 'clear',
    items: items.length ? items : [{ tier: 'P2', title: 'No Hermes cron jobs surfaced', detail: 'cron list returned no scheduled jobs.', evidence: 'LIVE_VERIFIED: hermes cron list' }],
    receipt: `hermes cron: ${gatewayRunning ? 'gateway running' : 'gateway not confirmed'}; ${jobs.length} job(s)`,
  });
}

const issueList = async (status) => {
  const result = await run('multica', ['issue', 'list', '--status', status, '--limit', '12', '--output', 'json'], { timeout: 3500, maxBuffer: 192_000 });
  if (!result.ok) return { ok: false, status, error: result.stderr || result.stdout || `exit ${result.code ?? 'unknown'}` };
  const parsed = parseJson(result.stdout);
  if (!parsed.ok) return { ok: false, status, error: parsed.error };
  return { ok: true, status, total: Number(parsed.data.total || 0), issues: Array.isArray(parsed.data.issues) ? parsed.data.issues : [] };
};

function summarizeIssue(issue) {
  const identifier = issue.identifier || (Number.isFinite(issue.number) ? `DAS-${issue.number}` : 'issue');
  return `${identifier}: ${issue.title || 'untitled'}`;
}

async function getWorkbench() {
  const multicaPath = await run('/bin/zsh', ['-lc', 'command -v multica || true']);
  if (!multicaPath.stdout) {
    return unavailableAdapter(
      'Multica CLI unavailable',
      'multica binary is not on PATH for this cockpit server.',
      'multica: command not found',
    );
  }

  const [review, progress, blocked, runtimes] = await Promise.all([
    issueList('in_review'),
    issueList('in_progress'),
    issueList('blocked'),
    run('multica', ['runtime', 'list', '--output', 'json'], { timeout: 3500, maxBuffer: 256_000 }),
  ]);

  const issueResults = [review, progress, blocked];
  const issueOk = issueResults.some((result) => result.ok);
  if (!issueOk) {
    return unavailableAdapter(
      'Workbench issue state unavailable',
      issueResults.map((result) => `${result.status}: ${sanitizeText(result.error, 80)}`).join(' | '),
      'multica issue list: unavailable',
    );
  }

  const runtimeParsed = runtimes.ok ? parseJson(runtimes.stdout) : { ok: false, data: [] };
  const runtimeRows = runtimeParsed.ok && Array.isArray(runtimeParsed.data) ? runtimeParsed.data : [];
  const onlineRuntimes = runtimeRows.filter((runtime) => runtime.status === 'online').length;
  const staleProgress = (progress.issues || []).filter((issue) => {
    const updated = Date.parse(issue.updated_at || '');
    return Number.isFinite(updated) && Date.now() - updated > 12 * 60 * 60 * 1000;
  });
  const emptyOutput = [...(review.issues || []), ...(progress.issues || []), ...(blocked.issues || [])]
    .filter((issue) => /empty output|empty-output|failed/i.test(`${issue.title || ''} ${issue.description || ''}`));

  const items = [];
  for (const issue of (blocked.issues || []).slice(0, 3)) {
    items.push({ tier: 'P0', title: `Blocked: ${summarizeIssue(issue)}`, detail: `priority ${issue.priority || 'normal'}; needs unblock routing`, evidence: 'LIVE_VERIFIED: multica issue list' });
  }
  for (const issue of emptyOutput.slice(0, Math.max(0, 3 - items.length))) {
    items.push({ tier: 'P0', title: `Run/output risk: ${summarizeIssue(issue)}`, detail: 'title or description mentions failed/empty output; verify run finalization before PASS.', evidence: 'FLAGGED: issue text scan' });
  }
  if (review.ok && review.total > 0) {
    items.push({ tier: 'P1', title: `${review.total} issue(s) in review`, detail: review.issues.slice(0, 2).map(summarizeIssue).join(' · ') || 'review queue has work', evidence: 'LIVE_VERIFIED: multica issue list' });
  }
  if (staleProgress.length) {
    items.push({ tier: 'P1', title: `${staleProgress.length} stale in-progress issue(s)`, detail: staleProgress.slice(0, 2).map(summarizeIssue).join(' · '), evidence: 'FLAGGED: updated_at > 12h' });
  }
  if (runtimeRows.length) {
    items.push({ tier: 'P2', title: `${onlineRuntimes}/${runtimeRows.length} runtimes online`, detail: runtimeRows.slice(0, 3).map((runtime) => `${runtime.provider || runtime.name}: ${runtime.status}`).join(' · '), evidence: 'LIVE_VERIFIED: multica runtime list' });
  }

  return adapter({
    ok: true,
    status: (blocked.total || emptyOutput.length) ? 'critical' : (review.total || staleProgress.length) ? 'watch' : 'clear',
    items: items.length ? items : [{ tier: 'P2', title: 'Workbench queue is quiet', detail: 'No blocked, in-review, or stale in-progress issue surfaced in bounded probe.', evidence: 'LIVE_VERIFIED: multica issue list' }],
    receipt: `multica: review ${review.total ?? 'n/a'}, progress ${progress.total ?? 'n/a'}, blocked ${blocked.total ?? 'n/a'}, runtimes ${onlineRuntimes}/${runtimeRows.length || 0}`,
  });
}

async function getKnowledge() {
  const candidates = [
    process.env.RESEARCH_VAULT_DIR,
    process.env.RESEARCH_VAULT_PATH,
    process.env.RV_DIR,
  ].filter(Boolean);
  const localRoot = candidates.find((candidate) => existsSync(candidate));
  if (localRoot) {
    const count = await run('/bin/zsh', ['-lc', 'find "$1" -type f \\( -name "*.md" -o -name "*.mdx" -o -name "*.json" \\) 2>/dev/null | wc -l', '_', localRoot], { timeout: 3000, maxBuffer: 32_000 });
    const total = Number(count.stdout.trim());
    return adapter({
      ok: count.ok,
      status: count.ok ? 'clear' : 'watch',
      items: [{
        tier: 'P2',
        title: 'Research Vault filesystem probe',
        detail: count.ok ? `${Number.isFinite(total) ? total : 0} knowledge file(s) counted from configured vault root.` : 'Configured vault root exists but count probe failed.',
        evidence: count.ok ? 'LIVE_VERIFIED: local RV path count' : 'FLAGGED: local RV path count',
      }],
      receipt: count.ok ? `research vault: configured local root, ${Number.isFinite(total) ? total : 0} file(s)` : 'research vault: local root count failed',
    });
  }

  const probes = [
    ['research-vault', ['status', '--json']],
    ['rv', ['status', '--json']],
    ['vault_status', []],
  ];
  for (const [cmd, args] of probes) {
    const exists = await run('/bin/zsh', ['-lc', `command -v ${cmd} || true`]);
    if (!exists.stdout) continue;
    const result = await run(exists.stdout, args, { timeout: 3000, maxBuffer: 96_000 });
    if (!result.ok) {
      return adapter({
        ok: false,
        status: 'watch',
        items: [{ tier: 'P1', title: 'Research Vault command failed', detail: result.stderr || result.stdout || 'status command failed', evidence: `FLAGGED: ${cmd}` }],
        receipt: `research vault: ${cmd} failed`,
      });
    }
    const parsed = parseJson(result.stdout);
    const summary = parsed.ok ? parsed.data : {};
    const total = summary.total || summary.count || summary.entries || summary.registry_count || 'unknown';
    return adapter({
      ok: true,
      status: 'clear',
      items: [{ tier: 'P2', title: 'Research Vault reachable', detail: `registry count ${total}; read-only status command responded.`, evidence: `LIVE_VERIFIED: ${cmd}` }],
      receipt: `research vault: ${cmd} reachable`,
    });
  }

  return unavailableAdapter(
    'Research Vault status unavailable',
    'No RV MCP bridge, local vault env path, or status CLI was visible to the cockpit server.',
    'research vault: unavailable read-only probe',
  );
}

async function getTools() {
  const names = ['fastfetch', 'btop', 'btm', 'glances', 'macmon', 'node'];
  const entries = [];
  for (const name of names) {
    const r = await run('/bin/zsh', ['-lc', `command -v ${name} || true`]);
    entries.push({ name, path: r.stdout ? '[server-path-redacted]' : null, ok: Boolean(r.stdout) });
  }
  return entries;
}

const sampleMacmonLine = (macmonPath, timeout = 4500) => new Promise((resolve) => {
  const child = spawn(macmonPath, ['pipe', '--interval', '1000'], {
    env: { ...process.env, LC_ALL: 'C' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  let settled = false;

  const finish = (result) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    child.stdout.removeAllListeners();
    child.stderr.removeAllListeners();
    child.removeAllListeners();
    if (!child.killed) child.kill('SIGTERM');
    resolve(result);
  };

  const timer = setTimeout(() => {
    finish({ ok: false, stdout: '', stderr: stderr.trim() || 'macmon emitted no sample before timeout', code: 'TIMEOUT' });
  }, timeout);

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
    const line = stdout.split('\n').find((entry) => entry.trim());
    if (line) finish({ ok: true, stdout: line.trim(), stderr: stderr.trim() });
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });
  child.on('error', (error) => {
    finish({ ok: false, stdout: '', stderr: stderr.trim() || error.message, code: error.code ?? null });
  });
  child.on('close', (code) => {
    if (settled) return;
    const line = stdout.split('\n').find((entry) => entry.trim());
    if (line) {
      finish({ ok: true, stdout: line.trim(), stderr: stderr.trim() });
      return;
    }
    finish({
      ok: false,
      stdout: '',
      stderr: stderr.trim() || `macmon exited without a sample${code === null ? '' : ` (code ${code})`}`,
      code: code ?? null,
    });
  });
});

async function getMacmon() {
  const present = await run('/bin/zsh', ['-lc', 'command -v macmon || true']);
  if (!present.stdout) return { ok: false, present: false, error: 'macmon not found in PATH' };
  const sample = await sampleMacmonLine(present.stdout);
  const line = sample.stdout.split('\n').find(Boolean);
  if (!line) return { ok: false, present: true, error: sanitizeText(sample.stderr || 'macmon emitted no sample', 180) };
  try {
    const data = JSON.parse(line);
    return {
      ok: true,
      present: true,
      power: { system: data.sys_power, all: data.all_power, cpu: data.cpu_power, gpu: data.gpu_power, ram: data.ram_power },
      temp: data.temp || {},
      usage: { cpu: data.cpu_usage_pct, gpu: Array.isArray(data.gpu_usage) ? data.gpu_usage[1] : null },
      memory: data.memory || {},
      timestamp: data.timestamp,
    };
  } catch (error) {
    return { ok: false, present: true, error: sanitizeText(`macmon JSON parse failed: ${error.message}`, 180) };
  }
}

async function getProcesses(glances) {
  const list = glances?.processlist || [];
  const mapProc = (p) => ({
    pid: p.pid,
    name: sanitizeText(p.name || p.cmdline?.[0] || 'process', 80),
    command: sanitizeText(Array.isArray(p.cmdline) ? p.cmdline.join(' ') : (p.cmdline || p.name || ''), 180),
    cpu: Number(p.cpu_percent || 0),
    mem: Number(p.memory_percent || 0),
    status: p.status || '',
  });
  const top = [...list]
    .sort((a, b) => (b.cpu_percent || 0) - (a.cpu_percent || 0))
    .slice(0, 8)
    .map(mapProc);
  const hermes = list
    .filter((p) => `${p.name || ''} ${Array.isArray(p.cmdline) ? p.cmdline.join(' ') : p.cmdline || ''}`.toLowerCase().includes('hermes'))
    .sort((a, b) => (b.cpu_percent || 0) - (a.cpu_percent || 0))
    .slice(0, 5)
    .map(mapProc);
  const brave = list
    .filter((p) => `${p.name || ''} ${Array.isArray(p.cmdline) ? p.cmdline.join(' ') : p.cmdline || ''}`.toLowerCase().includes('brave browser'))
    .sort((a, b) => (b.cpu_percent || 0) - (a.cpu_percent || 0))
    .slice(0, 5)
    .map(mapProc);
  return { top, hermes, brave };
}

function buildActions(glances, git, tools, processes, adapters = []) {
  const cpu = Number(glances?.cpu?.total || 0);
  const mem = Number(glances?.mem?.percent || 0);
  const swap = Number(glances?.memswap?.percent || 0);
  const hotHermes = Math.max(0, ...processes.hermes.map((p) => p.cpu));
  const actions = adapterActions(...adapters);
  if (swap >= 90) actions.push({ tier: 'P0', title: 'Swap pressure is critical', detail: `swap ${swap.toFixed(1)}% — inspect memory-heavy jobs before starting more agents`, evidence: 'LIVE_VERIFIED: Glances API' });
  if (hotHermes >= 90) actions.push({ tier: 'P0', title: 'Hermes gateway is hot', detail: `top Hermes process ${hotHermes.toFixed(1)}% CPU — verify expected workload vs runaway loop`, evidence: 'LIVE_VERIFIED: processlist' });
  if (git.ok && git.dirtyCount > 0) actions.push({ tier: 'P0', title: 'Workbench tree has local drift', detail: `${git.dirtyCount} dirty/untracked path(s) in prototype worktree`, evidence: 'LIVE_VERIFIED: git status' });
  if (!tools.find((t) => t.name === 'macmon')?.ok) actions.push({ tier: 'P1', title: 'macmon adapter missing', detail: 'install/finish macmon, then wire chip telemetry as a side card', evidence: 'LIVE_VERIFIED: command -v' });
  actions.push({ tier: 'P1', title: 'Keep Glances as telemetry pane, not final UI', detail: 'data quality is good; hierarchy/action guidance must be ours', evidence: 'CONFIRMED: local dogfood' });
  return actions
    .sort((a, b) => (tierRank[a.tier] ?? 9) - (tierRank[b.tier] ?? 9))
    .slice(0, 6);
}

async function snapshot() {
  const [glancesResult, git, tools, macmon, automation, workbench, knowledge] = await Promise.all([
    getGlances(),
    getGit(),
    getTools(),
    getMacmon(),
    getAutomation(),
    getWorkbench(),
    getKnowledge(),
  ]);
  const glances = glancesResult.ok ? glancesResult.data : null;
  const processes = await getProcesses(glances);
  const cpu = Number(glances?.cpu?.total || 0);
  const mem = Number(glances?.mem?.percent || 0);
  const swap = Number(glances?.memswap?.percent || 0);
  const load = glances?.load || {};
  const hermesCpu = Math.max(0, ...processes.hermes.map((p) => p.cpu));
  const state = mergeStatus(severity({ cpu, mem, swap, hermesCpu }), automation.status, workbench.status, knowledge.status);
  return {
    generatedAt: new Date().toISOString(),
    state,
    headline: state === 'critical' ? 'Operator state needs intervention' : state === 'watch' ? 'Operator state is useful with flags' : 'Operator state is clear enough to cook',
    glances: glancesResult.ok ? {
      ok: true,
      system: glances.system || {},
      uptime: glances.uptime || '',
      ip: glances.ip || {},
      cpu: { total: cpu, cores: glances.cpu?.cpucore || null },
      mem: { percent: mem, used: bytes(glances.mem?.used), total: bytes(glances.mem?.total), available: bytes(glances.mem?.available) },
      swap: { percent: swap, used: bytes(glances.memswap?.used), total: bytes(glances.memswap?.total) },
      load: { min1: load.min1, min5: load.min5, min15: load.min15 },
      fs: (glances.fs || []).slice(0, 6).map((f) => ({ mnt: f.mnt_point, percent: f.percent, used: bytes(f.used), size: bytes(f.size) })),
    } : { ok: false, error: glancesResult.error },
    git,
    tools,
    macmon,
    automation,
    workbench,
    knowledge,
    processes,
    actions: buildActions(glances, git, tools, processes, [automation, workbench, knowledge]),
    receipts: [
      `Glances: ${glancesResult.ok ? glancesUrl : glancesResult.error}`,
      `Git: ${git.ok ? `${git.branch}@${git.head}` : git.detail}`,
      `Workbench: ${workbench.receipt}`,
      `Automation: ${automation.receipt}`,
      `Knowledge: ${knowledge.receipt}`,
      `Tools: ${tools.filter((t) => t.ok).map((t) => t.name).join(', ') || 'none'}`,
      macmon.ok ? `macmon: ${Number(macmon.power.system || 0).toFixed(1)}W system, CPU ${Number(macmon.temp.cpu_temp_avg || 0).toFixed(0)}°C` : `macmon: ${macmon.error}`,
    ],
  };
}

const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };

const server = http.createServer(async (req, res) => {
  try {
    const baseHost = req.headers.host || `127.0.0.1:${port}`;
    const url = new URL(req.url || '/', `http://${baseHost}`);
    if (url.pathname === '/api/snapshot') {
      const body = JSON.stringify(await snapshot());
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      res.end(body);
      return;
    }
    const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
    const file = path.resolve(publicDir, rel);
    const relative = path.relative(publicDir, file);
    const insidePublicDir = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
    if (!insidePublicDir || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch (error) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`GM cockpit listening on http://127.0.0.1:${port}`);
  console.log(`Glances source: ${glancesUrl}`);
});
