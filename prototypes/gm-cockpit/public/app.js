const $ = (id) => document.getElementById(id);
const pct = (n) => Number.isFinite(Number(n)) ? `${Number(n).toFixed(1)}%` : '—';
const short = (s, n = 94) => (s || '').length > n ? `${s.slice(0, n - 1)}…` : (s || '—');
const escapeHtml = (value) => String(value ?? '—').replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
})[char]);

function classState(state) {
  return state === 'critical' ? 'critical' : state === 'watch' ? 'watch' : 'clear';
}

function renderAction(a) {
  return `<div class="action">
    <div class="tier ${a.tier}">${a.tier}</div>
    <div><h3>${a.title}</h3><p>${a.detail}</p><small>${a.evidence}</small></div>
  </div>`;
}

function renderProc(p) {
  const hot = p.cpu >= 80 ? ' hot' : '';
  const command = p.command || p.name || '—';
  const escapedCommand = escapeHtml(command);
  return `<div class="proc${hot}"><strong>${p.cpu.toFixed(1)}%</strong><span>${p.mem.toFixed(1)}% mem</span><code title="${escapedCommand}">${escapeHtml(short(command, 110))}</code></div>`;
}

function renderTools(tools) {
  return tools.map((t) => `<span class="tool ${t.ok ? 'ok' : 'missing'}">${t.ok ? '●' : '○'} ${t.name}</span>`).join('');
}

async function tick() {
  try {
    const res = await fetch('/api/snapshot', { cache: 'no-store' });
    const data = await res.json();
    const state = classState(data.state);
    $('headline').textContent = data.state === 'critical' ? 'GM, pressure is real.' : data.state === 'watch' ? 'GM, let it cook carefully.' : 'GM, we are clear.';
    $('subline').textContent = `${data.headline}. Evidence refreshed ${new Date(data.generatedAt).toLocaleTimeString()}.`;
    $('healthState').textContent = data.state;
    $('healthOrb').className = `health-orb ${state}`;
    $('healthCard').style.borderColor = data.state === 'critical' ? 'rgba(255,95,87,.45)' : data.state === 'watch' ? 'rgba(255,209,102,.38)' : 'rgba(131,255,159,.28)';

    if (data.glances.ok) {
      const sys = data.glances.system;
      $('hostLine').textContent = `${sys.hostname || 'local'} · ${sys.os_name || 'Darwin'} · uptime ${data.glances.uptime || '—'}`;
      $('cpuValue').textContent = pct(data.glances.cpu.total);
      $('cpuMeta').textContent = `${data.glances.cpu.cores || '—'} cores`;
      $('memValue').textContent = pct(data.glances.mem.percent);
      $('memMeta').textContent = `${data.glances.mem.used} / ${data.glances.mem.total}`;
      $('swapValue').textContent = pct(data.glances.swap.percent);
      $('swapMeta').textContent = `${data.glances.swap.used} / ${data.glances.swap.total}`;
      $('loadValue').textContent = [data.glances.load.min1, data.glances.load.min5, data.glances.load.min15].map((v) => Number(v || 0).toFixed(2)).join(' / ');
    } else {
      $('hostLine').textContent = `Glances unavailable: ${data.glances.error}`;
    }

    if (data.macmon?.ok) {
      const p = data.macmon.power;
      const t = data.macmon.temp;
      $('macmonState').innerHTML = `<div class="chip-grid">
        <div><span>SYS</span><strong>${Number(p.system || 0).toFixed(1)}W</strong></div>
        <div><span>CPU</span><strong>${Number(p.cpu || 0).toFixed(1)}W</strong></div>
        <div><span>GPU</span><strong>${Number(p.gpu || 0).toFixed(1)}W</strong></div>
        <div><span>TEMP</span><strong>${Number(t.cpu_temp_avg || 0).toFixed(0)}°C</strong></div>
      </div>`;
    } else {
      $('macmonState').textContent = data.macmon?.present
        ? `macmon present but sample failed: ${data.macmon.error}`
        : 'macmon not detected by server PATH yet. When install finishes, refresh; it becomes the pretty chip side-card.';
    }

    $('actions').innerHTML = data.actions.map(renderAction).join('');
    $('hermesList').innerHTML = data.processes.hermes.length ? data.processes.hermes.map(renderProc).join('') : '<p class="muted">No Hermes process surfaced in Glances processlist.</p>';
    $('processList').innerHTML = [
      ...(data.processes.brave?.length ? [`<div class="section-kicker">Brave renderers</div>`, ...data.processes.brave.map(renderProc)] : []),
      `<div class="section-kicker">System hot list</div>`,
      ...data.processes.top.map(renderProc),
    ].join('');
    $('gitStatus').textContent = data.git.ok ? data.git.status : `Git unavailable: ${data.git.detail || data.git.label}`;
    $('toolStrip').innerHTML = renderTools(data.tools);
    $('updated').textContent = `updated ${new Date(data.generatedAt).toLocaleTimeString()}`;
  } catch (error) {
    $('headline').textContent = 'GM, cockpit adapter failed.';
    $('subline').textContent = error.message;
  }
}

tick();
setInterval(tick, 3000);
