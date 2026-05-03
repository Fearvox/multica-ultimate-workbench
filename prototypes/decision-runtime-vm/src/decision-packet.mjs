import { validateDecisionPacket } from "./contracts.mjs";

export function createDecisionPacket(userHint, selectedFuture, context, options = {}) {
  if (!selectedFuture?.id) {
    throw new Error("selectedFuture is required");
  }
  if (!context?.context_snapshot_id) {
    throw new Error("context with context_snapshot_id is required");
  }

  const packet = {
    user_hint: userHint,
    context_snapshot_id: context.context_snapshot_id,
    selected_future_id: selectedFuture.id,
    active_repo: context.repo,
    active_branch: context.branch,
    issue_anchor_preference: options.issue_anchor_preference ?? inferIssueAnchorPreference(selectedFuture),
    risk_tolerance: options.risk_tolerance ?? inferRiskTolerance(selectedFuture),
    desired_speed: options.desired_speed ?? inferDesiredSpeed(selectedFuture),
    user_visible_summary: options.user_visible_summary ?? summarizeFuture(userHint, selectedFuture),
    sidecar_confidence: round(selectedFuture.confidence ?? 0)
  };

  validateDecisionPacket(packet, [selectedFuture], context);
  return packet;
}

function inferIssueAnchorPreference(future) {
  if (future.issue_anchor?.mode === "existing") return "existing";
  if (future.issue_anchor?.mode === "proposed") return "create";
  return "infer";
}

function inferRiskTolerance(future) {
  if (future.risk_tier === "HIGH") return "high";
  if (future.risk_tier === "LOW") return "low";
  return "medium";
}

function inferDesiredSpeed(future) {
  return future.latency_estimate === "fast" ? "fast" : "thorough";
}

function summarizeFuture(userHint, future) {
  if (userHint === "route stuck branch" && future.id === "future-qa-reproduce-checks") {
    return "Route stuck branch through QA evidence before patching.";
  }
  return `${future.title}: ${future.intent}`;
}

function round(value) {
  return Math.round(value * 100) / 100;
}
