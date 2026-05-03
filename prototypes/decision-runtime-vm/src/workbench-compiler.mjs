import { validateCompileResult } from "./contracts.mjs";

export function compileDecision(packet, adapters) {
  if (!packet.issue_anchor_preference) {
    throw new Error("issue_anchor_preference is required before Workbench compile");
  }
  if (!adapters?.multica || !adapters?.github) {
    throw new Error("fixture adapters are required");
  }

  if (packet.selected_future_id === "future-focus-guard-next-action") {
    return compileFocusGuardDecision(packet, adapters);
  }

  if (packet.selected_future_id !== "future-qa-reproduce-checks") {
    throw new Error(`Unsupported prototype future: ${packet.selected_future_id}`);
  }

  const issueAnchor = adapters.multica.bindOrCreateIssue(packet.issue_anchor_preference);
  const issue = adapters.multica.getIssue(issueAnchor.issue_id);
  const pullRequest = adapters.github.readPullRequest(37);

  if (!issueAnchor.issue_id || !issue) {
    throw new Error("issue anchor must exist before scoped instruction");
  }
  if (!pullRequest) {
    throw new Error("GitHub PR check readback is unavailable");
  }

  const result = {
    issue_anchor: {
      mode: issueAnchor.mode,
      issue_id: issueAnchor.issue_id,
      title: issue.title
    },
    route: "qa-review",
    target_agent: "QA Verifier",
    scoped_instruction: `Reproduce the stuck branch state for ${packet.active_branch}. Read git status, diff summary, and PR #${pullRequest.number} check state. Report command output and PR check readback. Do not edit files or change branches.`,
    evidence_required: [
      "git status --short output",
      "git diff --stat output",
      `GitHub PR #${pullRequest.number} check readback`,
      "QA verdict PASS/FLAG/BLOCK with residual risk"
    ],
    risk_tier: "MEDIUM",
    pre_send_gate: "evidence-expectation",
    closeout_gate: "full-temporal-pincer",
    pincer_required: true,
    confirmation_text: `Send QA to reproduce checks on ${issueAnchor.issue_id}. Evidence: command output + PR check readback. Risk: medium.`
  };

  validateCompileResult(result, packet.user_hint);
  return result;
}

function compileFocusGuardDecision(packet, adapters) {
  const focus = adapters.automationGuard?.readFocusState();
  const signals = adapters.automationGuard?.readSignals() ?? [];
  const activeSignals = signals.filter((signal) => signal.status === "ACTIVE");

  if (!focus?.one_next_action || activeSignals.length === 0) {
    throw new Error("focus guard requires active automation signals and one_next_action");
  }

  const result = {
    issue_anchor: {
      mode: "proposed",
      issue_id: "LOCAL-FOCUS-001",
      title: "Automation focus guard next action"
    },
    route: "focus-guard",
    target_agent: "ADHD Closure Babysitter",
    scoped_instruction: `Stay on MAIN LINE: ${focus.main_line}. Do exactly this next: ${focus.one_next_action}. Keep SIDE LINE to: ${focus.side_line}. Park new ideas unless they block this action. Do not mutate live automations from prototype mode.`,
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

  validateCompileResult(result, packet.user_hint);
  return result;
}
