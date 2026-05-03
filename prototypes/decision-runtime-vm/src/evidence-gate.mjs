export function evaluateEvidence(compileResult, evidence, context = {}) {
  const present = evidence.evidence_present ?? [];
  const missingFromFixture = evidence.evidence_missing ?? [];
  const missing = compileResult.evidence_required
    .map((required) => findMissingProof(required, present, missingFromFixture))
    .filter(Boolean);

  return {
    satisfied: missing.length === 0,
    missing,
    sourceAuthority: {
      repo: context.source_authority?.repo ?? "primary",
      github: context.source_authority?.github ?? "primary",
      multica: context.source_authority?.multica ?? "primary",
      capy: context.source_authority?.capy ?? "supporting"
    },
    readyForCloseout: missing.length === 0 && evidence.pr_checks !== "failing" && evidence.issue_state === "done"
  };
}

function findMissingProof(required, present, missingFromFixture) {
  const normalizedRequired = normalize(required);
  if (present.some((item) => evidenceMatches(normalizedRequired, normalize(item)))) {
    return null;
  }

  const explicit = missingFromFixture.find((item) => evidenceMatches(normalizedRequired, normalize(item)));
  if (explicit) return explicit;

  return required;
}

function evidenceMatches(required, candidate) {
  const requiredKind = evidenceKind(required);
  const candidateKind = evidenceKind(candidate);
  if (requiredKind && candidateKind && requiredKind !== candidateKind) {
    return false;
  }
  return candidate.includes(required) || required.includes(candidate) || keywordsOverlap(required, candidate);
}

function evidenceKind(value) {
  if (value.includes("status")) return "git-status";
  if (value.includes("diff")) return "git-diff";
  if (value.includes("github") || value.includes("pr ") || value.includes("check readback")) return "github-pr";
  if (value.includes("qa verdict")) return "qa-verdict";
  return "";
}

function keywordsOverlap(left, right) {
  const leftTerms = new Set(left.split(" ").filter((term) => term.length > 2));
  const rightTerms = new Set(right.split(" ").filter((term) => term.length > 2));
  let overlap = 0;
  for (const term of leftTerms) {
    if (rightTerms.has(term)) overlap += 1;
  }
  return overlap >= Math.min(leftTerms.size, rightTerms.size);
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .replace(/with residual risk/g, "")
    .replace(/fresh /g, "")
    .replace(/#[0-9]+/g, "")
    .replace(/--[a-z-]+/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
