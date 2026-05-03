export const DECISION_PACKET_SCHEMA = Object.freeze({
  user_hint: "string",
  context_snapshot_id: "string",
  selected_future_id: "string",
  active_repo: "string",
  active_branch: "string",
  issue_anchor_preference: ["existing", "create", "infer"],
  risk_tolerance: ["low", "medium", "high"],
  desired_speed: ["fast", "thorough"],
  user_visible_summary: "string",
  sidecar_confidence: "number"
});

export const WORKBENCH_COMPILE_RESULT_SCHEMA = Object.freeze({
  issue_anchor: Object.freeze({
    mode: ["existing", "created", "proposed"],
    issue_id: "string?",
    title: "string?"
  }),
  route: "string",
  target_agent: "string",
  scoped_instruction: "string",
  evidence_required: "string[]",
  risk_tier: ["LOW", "MEDIUM", "HIGH", "CLOSEOUT"],
  pre_send_gate: ["none", "evidence-expectation", "lightweight-pincer"],
  closeout_gate: ["evidence-gate", "full-temporal-pincer"],
  pincer_required: "boolean",
  confirmation_text: "string"
});

const FORBIDDEN_PACKET_PATTERNS = [
  /raw[_ -]?screenshot/i,
  /raw[_ -]?transcript/i,
  /cookie/i,
  /oauth/i,
  /request[_ -]?payload/i,
  /authorization\s*:\s*bearer/i,
  /sk-[A-Za-z0-9_-]{20,}/,
  /gh[pousr]_[A-Za-z0-9_]{20,}/
];

export function validateDecisionPacket(packet, cachedFutures, context) {
  assertPlainObject(packet, "DecisionPacket");
  assertString(packet.user_hint, "user_hint");
  assertString(packet.context_snapshot_id, "context_snapshot_id");
  assertString(packet.selected_future_id, "selected_future_id");
  assertString(packet.active_repo, "active_repo");
  assertString(packet.active_branch, "active_branch");
  assertOneOf(packet.issue_anchor_preference, DECISION_PACKET_SCHEMA.issue_anchor_preference, "issue_anchor_preference");
  assertOneOf(packet.risk_tolerance, DECISION_PACKET_SCHEMA.risk_tolerance, "risk_tolerance");
  assertOneOf(packet.desired_speed, DECISION_PACKET_SCHEMA.desired_speed, "desired_speed");
  assertString(packet.user_visible_summary, "user_visible_summary");
  assertNumberInRange(packet.sidecar_confidence, "sidecar_confidence", 0, 1);

  if (!Array.isArray(cachedFutures)) {
    throw new Error("cachedFutures must be an array");
  }
  if (!cachedFutures.some((future) => future.id === packet.selected_future_id)) {
    throw new Error("selected_future_id must match one cached future");
  }
  if (context?.context_snapshot_id !== packet.context_snapshot_id) {
    throw new Error("context_snapshot_id must match context");
  }

  rejectForbiddenPacketMaterial(packet);
  return true;
}

export function validateCompileResult(result, userHint = "") {
  assertPlainObject(result, "WorkbenchCompileResult");
  assertPlainObject(result.issue_anchor, "issue_anchor");
  assertOneOf(result.issue_anchor.mode, WORKBENCH_COMPILE_RESULT_SCHEMA.issue_anchor.mode, "issue_anchor.mode");
  if (result.issue_anchor.issue_id !== undefined) assertString(result.issue_anchor.issue_id, "issue_anchor.issue_id");
  if (result.issue_anchor.title !== undefined) assertString(result.issue_anchor.title, "issue_anchor.title");
  assertString(result.route, "route");
  assertString(result.target_agent, "target_agent");
  assertString(result.scoped_instruction, "scoped_instruction");
  assertStringArray(result.evidence_required, "evidence_required");
  assertOneOf(result.risk_tier, WORKBENCH_COMPILE_RESULT_SCHEMA.risk_tier, "risk_tier");
  assertOneOf(result.pre_send_gate, WORKBENCH_COMPILE_RESULT_SCHEMA.pre_send_gate, "pre_send_gate");
  assertOneOf(result.closeout_gate, WORKBENCH_COMPILE_RESULT_SCHEMA.closeout_gate, "closeout_gate");
  if (typeof result.pincer_required !== "boolean") {
    throw new Error("pincer_required must be a boolean");
  }
  assertString(result.confirmation_text, "confirmation_text");

  if (result.scoped_instruction.trim() === userHint.trim()) {
    throw new Error("scoped_instruction cannot equal user_hint");
  }
  if (result.evidence_required.length === 0) {
    throw new Error("evidence_required must contain at least one measurable proof item");
  }
  if (result.risk_tier === "HIGH" && result.pre_send_gate !== "lightweight-pincer") {
    throw new Error("HIGH risk routes require lightweight-pincer pre_send_gate");
  }
  if (result.risk_tier === "CLOSEOUT" && result.closeout_gate !== "full-temporal-pincer") {
    throw new Error("CLOSEOUT routes require full-temporal-pincer closeout_gate");
  }

  return true;
}

export function rejectForbiddenPacketMaterial(value) {
  const flattened = flattenValues(value).join("\n");
  for (const pattern of FORBIDDEN_PACKET_PATTERNS) {
    if (pattern.test(flattened)) {
      throw new Error("DecisionPacket contains forbidden raw or secret-like material");
    }
  }
}

function flattenValues(value, output = []) {
  if (value === null || value === undefined) return output;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    output.push(String(value));
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) flattenValues(item, output);
    return output;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      output.push(key);
      flattenValues(item, output);
    }
  }
  return output;
}

function assertPlainObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
}

function assertString(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
}

function assertStringArray(value, name) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string" && item.length > 0)) {
    throw new Error(`${name} must be an array of non-empty strings`);
  }
}

function assertOneOf(value, allowed, name) {
  if (!allowed.includes(value)) {
    throw new Error(`${name} must be one of: ${allowed.join(", ")}`);
  }
}

function assertNumberInRange(value, name, min, max) {
  if (typeof value !== "number" || Number.isNaN(value) || value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
}
