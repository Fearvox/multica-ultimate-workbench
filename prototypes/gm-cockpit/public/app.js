const $ = (id) => document.getElementById(id);
const pct = (n) => Number.isFinite(Number(n)) ? `${Number(n).toFixed(1)}%` : '—';
const short = (s, n = 94) => (s || '').length > n ? `${s.slice(0, n - 1)}…` : (s || '—');
const textValue = (value, fallback = '—') => {
  const text = value == null || value === '' ? fallback : String(value);
  return text;
};

function node(tag, { className, text, title } = {}, children = []) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (title !== undefined) element.title = title;
  for (const child of children) element.append(child);
  return element;
}

function classState(state) {
  return state === 'critical' ? 'critical' : state === 'watch' ? 'watch' : 'clear';
}

function swapClass(percent) {
  const value = Number(percent);
  if (value >= 90) return 'danger';
  if (value >= 75) return 'watch';
  return 'neutral';
}

function renderAction(a) {
  const tier = ['P0', 'P1', 'P2'].includes(a?.tier) ? a.tier : 'P1';
  const body = node('div', {}, [
    node('h3', { text: textValue(a?.title) }),
    node('p', { text: textValue(a?.detail) }),
    node('small', { text: textValue(a?.evidence) }),
  ]);
  return node('div', { className: 'action' }, [
    node('div', { className: `tier ${tier}`, text: tier }),
    body,
  ]);
}

function renderAdapter(adapter) {
  const status = ['clear', 'watch', 'critical', 'unavailable'].includes(adapter?.status)
    ? adapter.status
    : 'unavailable';
  const items = Array.isArray(adapter?.items) ? adapter.items : [];
  if (!items.length) {
    return [node('div', { className: 'adapter-card' }, [
      node('div', {}, [
        node('span', { className: `status-pill ${status}`, text: status }),
        node('h3', { text: 'No items surfaced' }),
        node('p', { text: 'Adapter returned no actionable state.' }),
        node('small', { text: 'UNAVAILABLE: empty adapter payload' }),
      ]),
    ])];
  }
  return items.map((item) => {
    const tier = ['P0', 'P1', 'P2', 'PARKED'].includes(item?.tier) ? item.tier : 'P2';
    return node('div', { className: 'adapter-card' }, [
      node('div', { className: `adapter-rank ${tier}`, text: tier }),
      node('div', {}, [
        node('div', { className: 'adapter-topline' }, [
          node('span', { className: `status-pill ${status}`, text: status }),
          node('small', { text: textValue(item?.evidence) }),
        ]),
        node('h3', { text: textValue(item?.title) }),
        node('p', { text: textValue(item?.detail) }),
      ]),
    ]);
  });
}

function setAdapter(prefix, adapter) {
  $(`${prefix}Receipt`).textContent = adapter?.receipt || 'unavailable';
  replaceChildren(`${prefix}Items`, renderAdapter(adapter));
}

function renderProc(p) {
  const cpu = Number(p?.cpu || 0);
  const mem = Number(p?.mem || 0);
  const command = textValue(p?.command || p?.name);
  return node('div', { className: `proc${cpu >= 80 ? ' hot' : ''}` }, [
    node('strong', { text: `${cpu.toFixed(1)}%` }),
    node('span', { text: `${mem.toFixed(1)}% mem` }),
    node('code', { text: short(command, 110), title: command }),
  ]);
}

function renderTools(tools) {
  return tools.map((t) => node('span', {
    className: `tool ${t.ok ? 'ok' : 'missing'}`,
    text: `${t.ok ? '●' : '○'} ${textValue(t.name)}`,
    title: t.ok ? 'available on server PATH' : 'not found on server PATH',
  }));
}

function renderMuted(text) {
  return node('p', { className: 'muted', text });
}

function renderMacmon(macmon) {
  if (macmon?.ok) {
    const p = macmon.power || {};
    const t = macmon.temp || {};
    return node('div', { className: 'chip-grid' }, [
      node('div', {}, [node('span', { text: 'SYS' }), node('strong', { text: `${Number(p.system || 0).toFixed(1)}W` })]),
      node('div', {}, [node('span', { text: 'CPU' }), node('strong', { text: `${Number(p.cpu || 0).toFixed(1)}W` })]),
      node('div', {}, [node('span', { text: 'GPU' }), node('strong', { text: `${Number(p.gpu || 0).toFixed(1)}W` })]),
      node('div', {}, [node('span', { text: 'TEMP' }), node('strong', { text: `${Number(t.cpu_temp_avg || 0).toFixed(0)}°C` })]),
    ]);
  }
  return document.createTextNode(
    macmon?.present
      ? `macmon present but sample failed: ${textValue(macmon.error)}`
      : 'macmon not detected by server PATH yet. When install finishes, refresh; it becomes the pretty chip side-card.',
  );
}

function replaceChildren(id, children) {
  $(id).replaceChildren(...children);
}

async function readSnapshot(res) {
  if (!res.ok) {
    const type = res.headers.get('content-type') || '';
    let detail = '';
    try {
      if (type.includes('application/json')) {
        const payload = await res.json();
        detail = payload?.error || payload?.message || JSON.stringify(payload);
      } else {
        detail = (await res.text()).trim();
      }
    } catch {
      detail = '';
    }
    throw new Error(`Snapshot request failed (${res.status} ${res.statusText})${detail ? `: ${detail}` : '. Check the local server logs.'}`);
  }

  const data = await res.json();
  if (!data || typeof data !== 'object' || !data.glances || !data.processes || !Array.isArray(data.actions) || !Array.isArray(data.tools)) {
    throw new Error('Snapshot payload malformed: expected cockpit snapshot object.');
  }
  return data;
}

async function tick() {
  try {
    const res = await fetch('/api/snapshot', { cache: 'no-store' });
    const data = await readSnapshot(res);
    const actions = Array.isArray(data.actions) ? data.actions : [];
    const hermes = Array.isArray(data.processes?.hermes) ? data.processes.hermes : [];
    const brave = Array.isArray(data.processes?.brave) ? data.processes.brave : [];
    const top = Array.isArray(data.processes?.top) ? data.processes.top : [];
    const tools = Array.isArray(data.tools) ? data.tools : [];
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
      $('swapMetric').className = `metric ${swapClass(data.glances.swap.percent)}`;
      $('loadValue').textContent = [data.glances.load.min1, data.glances.load.min5, data.glances.load.min15].map((v) => Number(v || 0).toFixed(2)).join(' / ');
    } else {
      $('cpuValue').textContent = '—';
      $('cpuMeta').textContent = '—';
      $('memValue').textContent = '—';
      $('memMeta').textContent = '—';
      $('swapValue').textContent = '—';
      $('swapMeta').textContent = '—';
      $('loadValue').textContent = '—';
      $('hostLine').textContent = `Glances unavailable: ${data.glances.error}`;
      $('swapMetric').className = 'metric neutral';
    }

    $('macmonState').replaceChildren(renderMacmon(data.macmon));
    setAdapter('workbench', data.workbench);
    setAdapter('automation', data.automation);
    setAdapter('knowledge', data.knowledge);
    replaceChildren('actions', actions.map(renderAction));
    replaceChildren('hermesList', hermes.length ? hermes.map(renderProc) : [renderMuted('No Hermes process surfaced in Glances processlist.')]);
    replaceChildren('processList', [
      ...(brave.length ? [node('div', { className: 'section-kicker', text: 'Brave renderers' }), ...brave.map(renderProc)] : []),
      node('div', { className: 'section-kicker', text: 'System hot list' }),
      ...top.map(renderProc),
    ]);
    $('gitStatus').textContent = data.git.ok ? data.git.status : `Git unavailable: ${data.git.detail || data.git.label}`;
    replaceChildren('toolStrip', renderTools(tools));
    $('updated').textContent = `updated ${new Date(data.generatedAt).toLocaleTimeString()}`;
  } catch (error) {
    $('headline').textContent = 'GM, cockpit adapter failed.';
    $('subline').textContent = error.message;
  }
}

tick();
setInterval(tick, 3000);
