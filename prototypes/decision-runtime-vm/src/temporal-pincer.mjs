import { evaluateEvidence } from "./evidence-gate.mjs";

export function runCloseoutPincer({ claim, compileResult, evidence, capyObservation }) {
  if (compileResult.pincer_required === false) {
    return {
      verdict: "READY",
      reason: "Low-friction focus guard route needs evidence-gate closeout, not full Temporal Pincer.",
      missing_proof: [],
      false_pass_risks: [],
      next_route: compileResult.route
    };
  }

  const gate = evaluateEvidence(compileResult, evidence);
  const false_pass_risks = collectFalsePassRisks(evidence, capyObservation);
  const primaryConflict = evidence.pr_checks === "failing" || evidence.issue_state !== "done";

  if (claim === "PASS" && (gate.missing.length > 0 || primaryConflict)) {
    return {
      verdict: "BLOCK",
      reason: "PASS claim lacks required evidence and conflicts with primary PR/check state.",
      missing_proof: gate.missing,
      false_pass_risks,
      next_route: compileResult.route
    };
  }

  if (gate.missing.length > 0 || false_pass_risks.length > 0) {
    return {
      verdict: "FLAG",
      reason: "Closeout claim has residual evidence gaps.",
      missing_proof: gate.missing,
      false_pass_risks,
      next_route: compileResult.route
    };
  }

  return {
    verdict: "PASS",
    reason: "Required evidence is present and primary truth sources do not contradict the claim.",
    missing_proof: [],
    false_pass_risks: [],
    next_route: "close"
  };
}

function collectFalsePassRisks(evidence, capyObservation = {}) {
  const risks = [];
  if (capyObservation.ui_state === "ready" && capyObservation.source_authority === "supporting") {
    risks.push("CAPY UI ready state is supporting evidence only");
  }
  if (evidence.repo_dirty_state === "dirty") {
    risks.push("dirty branch can hide unrelated changes");
  }
  if (evidence.pr_checks === "failing") {
    risks.push("failing PR checks contradict PASS");
  }
  return risks;
}
