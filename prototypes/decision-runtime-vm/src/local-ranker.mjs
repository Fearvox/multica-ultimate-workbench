const RISK_PENALTY = Object.freeze({
  LOW: 0,
  MEDIUM: -0.02,
  HIGH: -0.25,
  CLOSEOUT: -0.1
});

const LATENCY_PENALTY = Object.freeze({
  fast: 0,
  medium: -0.04,
  slow: -0.1
});

export function rankCachedFutures(userHint, cachedFutures, context, options = {}) {
  if (options.onCheckpointCall && options.forceCheckpointForTest) {
    options.onCheckpointCall("forbidden-checkpoint");
  }
  const hintTerms = splitTerms(userHint);
  const normalizedHint = normalizeHint(userHint);
  return cachedFutures
    .map((future, index) => {
      const score_breakdown = scoreFuture(future, hintTerms, context, normalizedHint);
      const score = Object.values(score_breakdown).reduce((sum, item) => sum + item, 0);
      return {
        ...future,
        original_index: index,
        score: round(score),
        score_breakdown
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.original_index - right.original_index;
    });
}

export function scoreFuture(future, hintTerms, context, normalizedHint = "") {
  const futureText = [
    future.title,
    future.intent,
    future.route,
    future.target_agent,
    future.risk_tier,
    ...(future.evidence_required ?? [])
  ].join(" ");
  const futureTerms = splitTerms(futureText);

  return {
    hint_match: scoreHintMatch(hintTerms, futureTerms, future),
    context_fit: scoreContextFit(future, context),
    issue_anchor_fit: scoreIssueAnchorFit(future, context),
    executable_confidence: round((future.confidence ?? 0) * 0.35),
    evidence_availability: scoreEvidenceAvailability(future, context),
    agent_availability: context.agents?.includes(future.target_agent) ? 0.18 : -0.18,
    active_goal_progress: scoreActiveGoalProgress(future, context),
    automation_focus_fit: scoreAutomationFocusFit(future, hintTerms, context, normalizedHint),
    preference_prior: scorePreferencePrior(future),
    risk_penalty: RISK_PENALTY[future.risk_tier] ?? -0.05,
    latency_penalty: LATENCY_PENALTY[future.latency_estimate] ?? -0.02,
    stale_context_penalty: scoreStaleContextPenalty(future, context)
  };
}

function scoreHintMatch(hintTerms, futureTerms, future) {
  if (hintTerms.size === 0) return 0;
  const matched = Array.from(hintTerms).filter((term) => futureTerms.has(term)).length;
  let score = (matched / hintTerms.size) * 0.35;
  const routeStuck = hintTerms.has("route") && hintTerms.has("stuck") && hintTerms.has("branch");
  if (routeStuck && future.id === "future-qa-reproduce-checks") score += 0.28;
  if (routeStuck && future.id === "future-developer-patch-lane") score += 0.04;
  if (routeStuck && future.id === "future-flight-recorder-first") score += 0.08;
  return round(score);
}

function scoreContextFit(future, context) {
  let score = 0;
  const text = JSON.stringify(future).toLowerCase();
  if (context.branch && text.includes("branch")) score += 0.08;
  if (context.dirty_state === "dirty" && /verify|reproduce|evidence|status|diff/.test(text)) score += 0.14;
  if (context.open_prs?.some((pr) => pr.checks === "failing") && /check|pr|qa|reproduce/.test(text)) score += 0.16;
  return round(score);
}

function scoreIssueAnchorFit(future, context) {
  if (future.issue_anchor?.issue_id === context.active_issue) return 0.2;
  if (future.issue_anchor?.mode === "proposed") return 0.06;
  return -0.12;
}

function scoreEvidenceAvailability(future, context) {
  const available = (context.evidence_available ?? []).map(normalizeEvidence);
  const required = future.evidence_required ?? [];
  if (required.length === 0) return -0.2;
  const matched = required.filter((item) => {
    const normalized = normalizeEvidence(item);
    return available.some((evidence) => normalized.includes(evidence) || evidence.includes(normalized));
  }).length;
  return round((matched / required.length) * 0.22);
}

function scoreActiveGoalProgress(future, context) {
  const checksFailing = context.open_prs?.some((pr) => pr.checks === "failing");
  if (checksFailing && future.route === "qa-review") return 0.18;
  if (checksFailing && future.route === "supervisor-gate") return 0.1;
  if (checksFailing && future.route === "developer-patch") return 0.02;
  if (context.focus_guard?.one_next_action && future.route === "focus-guard") return 0.12;
  return 0;
}

function scoreAutomationFocusFit(future, hintTerms, context, normalizedHint) {
  if (future.route !== "focus-guard") return 0;
  let score = 0;
  if (context.automation_signals?.some((signal) => signal.status === "ACTIVE")) score += 0.14;
  if (hintTerms.has("automation") || hintTerms.has("babysitter") || hintTerms.has("focus")) score += 0.18;
  if (/真的|需要|下一|主线|停车|打断|分心|闭环|新想法|要做|need|next|main|parking|interrupt|distract/.test(normalizedHint)) {
    score += 0.34;
  }
  return round(score);
}

function scorePreferencePrior(future) {
  if (future.route === "qa-review") return 0.06;
  if (future.route === "supervisor-gate") return 0.04;
  if (future.route === "focus-guard") return 0.05;
  return 0;
}

function scoreStaleContextPenalty(future, context) {
  if (context.dirty_state === "dirty" && future.risk_tier === "HIGH") return -0.16;
  if (context.missing_evidence?.length && future.risk_tier === "LOW") return -0.03;
  return 0;
}

function splitTerms(value) {
  return String(value)
    .toLowerCase()
    .split(/[^a-z0-9#]+/)
    .filter(Boolean)
    .reduce((set, term) => set.add(stem(term)), new Set());
}

function normalizeHint(value) {
  return String(value).toLowerCase();
}

function stem(term) {
  if (term.endsWith("ing") && term.length > 5) return term.slice(0, -3);
  if (term.endsWith("ed") && term.length > 4) return term.slice(0, -2);
  if (term.endsWith("s") && term.length > 3 && !term.startsWith("#")) return term.slice(0, -1);
  return term;
}

function normalizeEvidence(value) {
  return String(value)
    .toLowerCase()
    .replace(/--[a-z-]+/g, "")
    .replace(/#[0-9]+/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}
