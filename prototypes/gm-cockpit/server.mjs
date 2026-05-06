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

async function getTools() {
  const names = ['fastfetch', 'btop', 'btm', 'glances', 'macmon', 'node'];
  const entries = [];
  for (const name of names) {
    const r = await run('/bin/zsh', ['-lc', `command -v ${name} || true`]);
    entries.push({ name, path: r.stdout || null, ok: Boolean(r.stdout) });
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
  if (!line) return { ok: false, present: true, error: sample.stderr || 'macmon emitted no sample' };
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
    return { ok: false, present: true, error: `macmon JSON parse failed: ${error.message}` };
  }
}

async function getProcesses(glances) {
  const list = glances?.processlist || [];
  const mapProc = (p) => ({
    pid: p.pid,
    name: p.name || p.cmdline?.[0] || 'process',
    command: Array.isArray(p.cmdline) ? p.cmdline.join(' ') : (p.cmdline || p.name || ''),
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

function buildActions(glances, git, tools, processes) {
  const cpu = Number(glances?.cpu?.total || 0);
  const mem = Number(glances?.mem?.percent || 0);
  const swap = Number(glances?.memswap?.percent || 0);
  const hotHermes = Math.max(0, ...processes.hermes.map((p) => p.cpu));
  const actions = [];
  if (swap >= 90) actions.push({ tier: 'P0', title: 'Swap pressure is critical', detail: `swap ${swap.toFixed(1)}% — inspect memory-heavy jobs before starting more agents`, evidence: 'LIVE_VERIFIED: Glances API' });
  if (hotHermes >= 90) actions.push({ tier: 'P0', title: 'Hermes gateway is hot', detail: `top Hermes process ${hotHermes.toFixed(1)}% CPU — verify expected workload vs runaway loop`, evidence: 'LIVE_VERIFIED: processlist' });
  if (git.ok && git.dirtyCount > 0) actions.push({ tier: 'P0', title: 'Workbench tree has local drift', detail: `${git.dirtyCount} dirty/untracked path(s) in prototype worktree`, evidence: 'LIVE_VERIFIED: git status' });
  if (!tools.find((t) => t.name === 'macmon')?.ok) actions.push({ tier: 'P1', title: 'macmon adapter missing', detail: 'install/finish macmon, then wire chip telemetry as a side card', evidence: 'LIVE_VERIFIED: command -v' });
  actions.push({ tier: 'P1', title: 'Keep Glances as telemetry pane, not final UI', detail: 'data quality is good; hierarchy/action guidance must be ours', evidence: 'CONFIRMED: local dogfood' });
  return actions.slice(0, 6);
}

async function snapshot() {
  const [glancesResult, git, tools, macmon] = await Promise.all([getGlances(), getGit(), getTools(), getMacmon()]);
  const glances = glancesResult.ok ? glancesResult.data : null;
  const processes = await getProcesses(glances);
  const cpu = Number(glances?.cpu?.total || 0);
  const mem = Number(glances?.mem?.percent || 0);
  const swap = Number(glances?.memswap?.percent || 0);
  const load = glances?.load || {};
  const hermesCpu = Math.max(0, ...processes.hermes.map((p) => p.cpu));
  const state = severity({ cpu, mem, swap, hermesCpu });
  return {
    generatedAt: new Date().toISOString(),
    state,
    headline: state === 'critical' ? 'Machine is useful but under pressure' : state === 'watch' ? 'Machine is live; keep an eye on pressure' : 'Machine is clear enough to cook',
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
    processes,
    actions: buildActions(glances, git, tools, processes),
    receipts: [
      `Glances: ${glancesResult.ok ? glancesUrl : glancesResult.error}`,
      `Git: ${git.ok ? `${git.branch}@${git.head}` : git.detail}`,
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
