const STATES = [
  "IDLE",
  "PREDICTING",
  "USER_HINT",
  "FUTURE_SELECTED",
  "WORKBENCH_COMPILE",
  "HUMAN_CONFIRM",
  "DISPATCHED",
  "OBSERVING",
  "CLAIM_GATE",
  "LEARN"
];

const context = {
  context_snapshot_id: "ctx-route-stuck-branch-001",
  repo: "/Users/0xvox/multica-ultimate-workbench",
  branch: "smokehouse",
  dirty_state: "dirty",
  active_issue: "EVENS-007",
  agents: ["QA Verifier", "Developer", "Workbench Supervisor", "CAPY/VM Observer", "ADHD Closure Babysitter", "Focus Loop Check-in"],
  open_prs: [{ number: 37, state: "open", checks: "failing" }],
  evidence_available: ["git status", "diff summary", "PR check readback"],
  missing_evidence: ["fresh command output"],
  automation_signals: [
    {
      id: "adhd-closure-babysitter",
      name: "ADHD Closure Babysitter",
      kind: "cron",
      status: "ACTIVE",
      cadence: "hourly",
      role: "read-only closure audit across active workspaces"
    },
    {
      id: "focus-loop-check-in",
      name: "Focus Loop Check-in",
      kind: "heartbeat",
      status: "ACTIVE",
      cadence: "45 minutes",
      role: "current-thread focus nudge and parking-lot enforcement"
    }
  ],
  focus_guard: {
    main_line: "Close Workbench Decision Runtime automation visibility in the VM web control surface",
    side_line: "Verify Codex Computer Use can observe Superconductor",
    parking_lot: [
      "Superconductor-side Computer Use transport repair",
      "live automation adapter for this VM cell",
      "native sidecar interruption controls"
    ],
    one_next_action: "Show automation guard in this webpage and verify the static VM cell still passes tests",
    stop_now: [
      "Do not open another product lane",
      "Do not mutate live automations from prototype mode",
      "Park new ideas for 24 hours unless they block the main line"
    ],
    completion_percent: 65
  }
};

const cachedFutures = [
  {
    id: "future-focus-guard-next-action",
    title: "Close current main line from automation guard",
    route: "focus-guard",
    target_agent: "ADHD Closure Babysitter",
    risk_tier: "LOW",
    evidence_required: ["automation status readback", "main line selected", "parking lot updated"],
    confidence: 0.9,
    latency_estimate: "fast"
  },
  {
    id: "future-flight-recorder-first",
    title: "Run flight recorder first",
    route: "supervisor-gate",
    target_agent: "Workbench Supervisor",
    risk_tier: "LOW",
    evidence_required: ["RUN_DIGEST", "latest issue comments", "recent run summaries"],
    confidence: 0.76,
    latency_estimate: "fast"
  },
  {
    id: "future-qa-reproduce-checks",
    title: "Ask QA to reproduce checks",
    route: "qa-review",
    target_agent: "QA Verifier",
    risk_tier: "MEDIUM",
    evidence_required: ["git status --short output", "git diff --stat output", "GitHub PR #37 check readback"],
    confidence: 0.82,
    latency_estimate: "fast"
  },
  {
    id: "future-developer-patch-lane",
    title: "Route to Developer patch lane",
    route: "developer-patch",
    target_agent: "Developer",
    risk_tier: "HIGH",
    evidence_required: ["repro command output", "diff summary", "pre-send pincer result"],
    confidence: 0.48,
    latency_estimate: "medium"
  }
];

const evidence = {
  claim: "PASS",
  ui_state: "ready",
  issue_state: "in_review",
  repo_dirty_state: "dirty",
  pr_checks: "failing",
  evidence_present: ["git diff --stat output"],
  evidence_missing: [
    "fresh git status --short output",
    "GitHub PR #37 check readback",
    "QA verdict PASS/FLAG/BLOCK"
  ]
};

const model = {
  currentState: "PREDICTING",
  selectedFuture: null,
  packet: null,
  compileResult: null,
  pincer: null
};

const nodes = {
  statePill: document.querySelector("#state-pill"),
  timeline: document.querySelector("#timeline"),
  hint: document.querySelector("#hint-input"),
  select: document.querySelector("#select-button"),
  confirm: document.querySelector("#confirm-button"),
  futureList: document.querySelector("#future-list"),
  packet: document.querySelector("#decision-packet"),
  compile: document.querySelector("#compile-result"),
  issueAnchor: document.querySelector("#issue-anchor"),
  instruction: document.querySelector("#instruction-preview"),
  capyNote: document.querySelector("#capy-note"),
  verdict: document.querySelector("#gate-verdict"),
  required: document.querySelector("#evidence-required"),
  missing: document.querySelector("#missing-proof"),
  risks: document.querySelector("#false-pass-risks"),
  automationList: document.querySelector("#automation-list"),
  mainLine: document.querySelector("#main-line"),
  sideLine: document.querySelector("#side-line"),
  nextAction: document.querySelector("#next-action"),
  completion: document.querySelector("#completion-meter"),
  parkingLot: document.querySelector("#parking-lot"),
  stopRules: document.querySelector("#stop-rules")
};

nodes.hint.addEventListener("input", () => {
  model.currentState = "USER_HINT";
  render();
});

nodes.select.addEventListener("click", () => {
  model.selectedFuture = rankCachedFutures(nodes.hint.value)[0];
  model.currentState = "FUTURE_SELECTED";
  model.packet = null;
  model.compileResult = null;
  model.pincer = null;
  render();
});

nodes.confirm.addEventListener("click", () => {
  const future = model.selectedFuture ?? rankCachedFutures(nodes.hint.value)[0];
  model.selectedFuture = future;
  model.packet = createDecisionPacket(nodes.hint.value, future);
  model.compileResult = compileDecision(model.packet);
  model.pincer = runCloseoutPincer(model.compileResult);
  model.currentState = "CLAIM_GATE";
  render();
});

bootstrapFromQuery();
render();

function render() {
  const ranked = rankCachedFutures(nodes.hint.value);
  nodes.statePill.textContent = model.currentState;
  renderTimeline();
  renderFutures(ranked);
  renderAutomationGuard();
  renderArtifacts();
}

function renderTimeline() {
  const activeIndex = STATES.indexOf(model.currentState);
  nodes.timeline.innerHTML = STATES.map((state, index) => {
    const active = index <= activeIndex ? " active" : "";
    return `<div class="state-cell${active}">${state}</div>`;
  }).join("");
}

function renderFutures(ranked) {
  nodes.futureList.innerHTML = ranked.map((future) => {
    const selected = model.selectedFuture?.id === future.id ? " selected" : "";
    return `
      <article class="future-card${selected}">
        <div class="future-title">
          <span>${future.title}</span>
          <span>${future.score.toFixed(2)}</span>
        </div>
        <div class="future-meta">
          <span>${future.route}</span>
          <span>${future.target_agent}</span>
          <span>${future.risk_tier}</span>
          <span>${future.latency_estimate}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderArtifacts() {
  nodes.packet.textContent = JSON.stringify(model.packet ?? {}, null, 2);
  nodes.compile.textContent = JSON.stringify(model.compileResult ?? {}, null, 2);
  nodes.required.innerHTML = toList(model.compileResult?.evidence_required ?? []);
  nodes.missing.innerHTML = toList(model.pincer?.missing_proof ?? []);
  nodes.risks.innerHTML = toList(model.pincer?.false_pass_risks ?? []);

  if (!model.compileResult) {
    nodes.issueAnchor.textContent = "not bound yet";
    nodes.instruction.textContent = "Select a future, then confirm compile. No live send occurs in this VM cell.";
    nodes.verdict.textContent = "WAITING";
    nodes.verdict.classList.remove("block");
    nodes.verdict.classList.remove("ready");
    nodes.capyNote.textContent = "CAPY/VM observer is supporting evidence only.";
    return;
  }

  nodes.issueAnchor.textContent = `issue anchor: ${model.compileResult.issue_anchor.issue_id}`;
  nodes.instruction.textContent = model.compileResult.scoped_instruction;
  nodes.verdict.textContent = model.pincer.verdict;
  nodes.verdict.classList.toggle("block", model.pincer.verdict === "BLOCK");
  nodes.verdict.classList.toggle("ready", model.pincer.verdict === "READY");
  nodes.capyNote.textContent = model.compileResult.route === "focus-guard"
    ? "Automation guard is fixture-backed here; live adapter remains parked."
    : "CAPY UI says ready; Temporal Pincer still BLOCKS because primary proof is missing.";
}

function renderAutomationGuard() {
  nodes.automationList.innerHTML = context.automation_signals.map((signal) => `
    <article class="guard-row">
      <div>
        <strong>${signal.name}</strong>
        <span>${signal.role}</span>
      </div>
      <div class="guard-meta">${signal.kind} / ${signal.cadence} / ${signal.status}</div>
    </article>
  `).join("");
  nodes.mainLine.textContent = context.focus_guard.main_line;
  nodes.sideLine.textContent = context.focus_guard.side_line;
  nodes.nextAction.textContent = context.focus_guard.one_next_action;
  nodes.completion.textContent = `${context.focus_guard.completion_percent}%`;
  nodes.parkingLot.innerHTML = toList(context.focus_guard.parking_lot);
  nodes.stopRules.innerHTML = toList(context.focus_guard.stop_now);
}

function rankCachedFutures(hint) {
  const terms = splitTerms(hint);
  const normalizedHint = String(hint).toLowerCase();
  return cachedFutures
    .map((future, index) => {
      let score = future.confidence + (future.target_agent === "QA Verifier" ? 0.18 : 0);
      const text = splitTerms(Object.values(future).flat().join(" "));
      for (const term of terms) {
        if (text.has(term)) score += 0.08;
      }
      if (terms.has("route") && terms.has("stuck") && terms.has("branch") && future.id === "future-qa-reproduce-checks") {
        score += 0.34;
      }
      if (future.route === "focus-guard") {
        score += 0.05;
        if (context.automation_signals.some((signal) => signal.status === "ACTIVE")) score += 0.14;
        if (terms.has("automation") || terms.has("babysitter") || terms.has("focus")) score += 0.18;
        if (/真的|需要|下一|主线|停车|打断|分心|闭环|新想法|要做|need|next|main|parking|interrupt|distract/.test(normalizedHint)) {
          score += 0.34;
        }
      }
      if (future.risk_tier === "HIGH") score -= 0.35;
      return { ...future, score, index };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index);
}

function createDecisionPacket(userHint, future) {
  return {
    user_hint: userHint,
    context_snapshot_id: context.context_snapshot_id,
    selected_future_id: future.id,
    active_repo: context.repo,
    active_branch: context.branch,
    issue_anchor_preference: future.route === "focus-guard" ? "create" : "existing",
    risk_tolerance: future.risk_tier === "LOW" ? "low" : "medium",
    desired_speed: "fast",
    user_visible_summary: future.route === "focus-guard"
      ? "Close the current main line and park new ideas."
      : "Route stuck branch through QA evidence before patching.",
    sidecar_confidence: future.confidence
  };
}

function compileDecision(packet) {
  if (packet.selected_future_id === "future-focus-guard-next-action") {
    return compileFocusGuardDecision();
  }

  return {
    issue_anchor: {
      mode: "existing",
      issue_id: context.active_issue,
      title: "Review open PRs and repo status"
    },
    route: "qa-review",
    target_agent: "QA Verifier",
    scoped_instruction: `Reproduce the stuck branch state for ${packet.active_branch}. Read git status, diff summary, and PR #37 check state. Report command output and PR check readback. Do not edit files or change branches.`,
    evidence_required: [
      "git status --short output",
      "git diff --stat output",
      "GitHub PR #37 check readback",
      "QA verdict PASS/FLAG/BLOCK with residual risk"
    ],
    risk_tier: "MEDIUM",
    pre_send_gate: "evidence-expectation",
    closeout_gate: "full-temporal-pincer",
    pincer_required: true,
    confirmation_text: `Send QA to reproduce checks on ${context.active_issue}. Evidence: command output + PR check readback. Risk: medium.`
  };
}

function compileFocusGuardDecision() {
  const activeSignals = context.automation_signals.filter((signal) => signal.status === "ACTIVE");
  return {
    issue_anchor: {
      mode: "proposed",
      issue_id: "LOCAL-FOCUS-001",
      title: "Automation focus guard next action"
    },
    route: "focus-guard",
    target_agent: "ADHD Closure Babysitter",
    scoped_instruction: `Stay on MAIN LINE: ${context.focus_guard.main_line}. Do exactly this next: ${context.focus_guard.one_next_action}. Keep SIDE LINE to: ${context.focus_guard.side_line}. Park new ideas unless they block this action. Do not mutate live automations from prototype mode.`,
    evidence_required: [
      "automation status readback",
      "main line selected",
      "parking lot updated",
      "Changed / Verified / Next one action closeout"
    ],
    risk_tier: "LOW",
    pre_send_gate: "none",
    closeout_gate: "evidence-gate",
    pincer_required: false,
    confirmation_text: `Use ${activeSignals.map((signal) => signal.name).join(" + ")} to close one action under 30 minutes. Risk: low.`
  };
}

function runCloseoutPincer(compileResult) {
  if (!compileResult.pincer_required) {
    return {
      verdict: "READY",
      reason: "Low-friction focus guard route needs evidence-gate closeout, not full Temporal Pincer.",
      missing_proof: [],
      false_pass_risks: [],
      next_route: compileResult.route
    };
  }

  return {
    verdict: "BLOCK",
    reason: "PASS claim lacks required evidence and conflicts with primary PR/check state.",
    missing_proof: evidence.evidence_missing,
    false_pass_risks: [
      "CAPY UI ready state is supporting evidence only",
      "dirty branch can hide unrelated changes",
      "failing PR checks contradict PASS"
    ],
    next_route: compileResult.route
  };
}

function toList(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function splitTerms(value) {
  return String(value)
    .toLowerCase()
    .split(/[^a-z0-9#]+/)
    .filter(Boolean)
    .reduce((set, term) => set.add(term.replace(/s$/, "")), new Set());
}

function bootstrapFromQuery() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("claim") !== "1") return;
  const future = rankCachedFutures(nodes.hint.value)[0];
  model.selectedFuture = future;
  model.packet = createDecisionPacket(nodes.hint.value, future);
  model.compileResult = compileDecision(model.packet);
  model.pincer = runCloseoutPincer(model.compileResult);
  model.currentState = "CLAIM_GATE";
}
