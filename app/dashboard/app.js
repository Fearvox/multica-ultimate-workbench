/**
 * Multica Fleet Dashboard — spec-driven renderer.
 *
 * Consumes fleet JSON from /api/fleet.json (served by runtime-panel.sh --json)
 * and renders runtime cards.  All data is from our own trusted pipeline:
 * runtime-registry/*.json + runner evidence via SSH.  No user input.
 */

const FLEET_API = "/api/fleet.json";
const REFRESH_MS = 15_000;

const $ = (sel) => document.querySelector(sel);

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "className") node.className = v;
    else if (k === "textContent") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
    else node.setAttribute(k, v);
  });
  children.forEach((c) => {
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  });
  return node;
}

function statusBadge(status) {
  const span = el("span", { className: `status-badge ${status}` });
  span.innerHTML = `<span class="status-dot ${status}"></span> ${status}`;
  return span;
}

function yn(b, { warn } = {}) {
  if (b === true) return '<span class="check">&#10003;</span>';
  if (warn) return '<span class="warn">&#9679;</span>';
  return '<span class="cross">&#10007;</span>';
}

function metric(label, valueHTML) {
  const div = el("div", { className: "metric" });
  const labelEl = el("span", { className: "metric-label", textContent: label });
  const valueEl = el("span", { className: "metric-value" });
  valueEl.innerHTML = valueHTML;
  div.appendChild(labelEl);
  div.appendChild(valueEl);
  return div;
}

function renderRuntime(r) {
  const live = r.live || {};
  const perms = r.permissions || {};
  const status = live.status || "UNKNOWN";

  const top = el("div", { className: "card-top" });
  top.appendChild(el("span", { className: "card-instance", textContent: r.instance || r.runtime_id }));
  top.appendChild(statusBadge(status));

  const metrics = el("div", { className: "metrics" });
  metrics.appendChild(metric("Provider", `${r.provider || "?"} / ${r.model || "?"}`));

  const smokeVerdict = live.smoke_verdict
    ? `${live.smoke_verdict} — ${live.smoke_reason || ""}`
    : "? — ?";
  metrics.appendChild(metric("Smoke", smokeVerdict));

  const tmuxInfo = live.tmux_present
    ? `observed (${live.tmux_session_count ?? 0} session)`
    : "not observed";
  metrics.appendChild(metric("Tmux", tmuxInfo));

  const authInfo = `codex ${yn(live.codex_auth, {warn:true})} &nbsp;hermes ${yn(live.hermes_auth, {warn:true})} &nbsp;provider ${yn(live.provider_env, {warn:true})}`;
  metrics.appendChild(metric("Auth", authInfo));

  metrics.appendChild(metric("Shell", perms.shell || "?"));
  metrics.appendChild(metric("Mutation", perms.remote_mutation ? "enabled" : "read-only"));

  const evidenceInfo = live.evidence_at
    ? `${live.source || "?"} @ ${live.evidence_at.slice(0, 19)}`
    : (live.reason || "?");
  metrics.appendChild(metric("Evidence", evidenceInfo));

  metrics.appendChild(metric("Repo", r.repo || "?"));
  metrics.appendChild(metric("Host ref", r.host_env_ref || "?"));

  const card = el("article", { className: "runtime-card" });
  card.appendChild(top);
  card.appendChild(metrics);

  const actions = r.allowed_actions || [];
  if (actions.length) {
    const actionsDiv = el("div", { className: "allowed-actions" });
    actions.forEach((a) => {
      actionsDiv.appendChild(el("span", { className: "action-tag", textContent: a }));
    });
    card.appendChild(actionsDiv);
  }

  return card;
}

function renderFleet(spec) {
  const grid = $("#fleet-grid");
  const empty = $("#empty-state");
  grid.innerHTML = "";

  if (!spec.fleet || spec.fleet.length === 0) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  spec.fleet.forEach((r) => grid.appendChild(renderRuntime(r)));
}

function renderMeta(spec) {
  $("#generated-at").textContent = (spec.generated_at_utc || "").slice(0, 19) + "Z";
  $("#registry-count").textContent = `${spec.registry_count ?? spec.fleet.length} runtime(s)`;
}

function renderError(message) {
  const banner = $("#error-banner");
  banner.textContent = message;
  banner.hidden = false;
}

async function fetchFleet() {
  const resp = await fetch(FLEET_API, { cache: "no-store" });
  if (!resp.ok) throw new Error(`API ${resp.status}: ${resp.statusText}`);
  return resp.json();
}

async function refresh() {
  const dot = $("#refresh-dot");
  const label = $("#refresh-label");
  try {
    const spec = await fetchFleet();
    renderFleet(spec);
    renderMeta(spec);
    const banner = $("#error-banner");
    banner.hidden = true;
    dot.classList.remove("stale");
    label.textContent = "live";
  } catch (err) {
    dot.classList.add("stale");
    label.textContent = "stale";
    renderError(err.message);
  }
}

refresh();
setInterval(refresh, REFRESH_MS);
