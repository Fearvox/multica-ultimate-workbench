export const STATES = Object.freeze({
  IDLE: "IDLE",
  PREDICTING: "PREDICTING",
  USER_HINT: "USER_HINT",
  FUTURE_SELECTED: "FUTURE_SELECTED",
  WORKBENCH_COMPILE: "WORKBENCH_COMPILE",
  HUMAN_CONFIRM: "HUMAN_CONFIRM",
  DISPATCHED: "DISPATCHED",
  OBSERVING: "OBSERVING",
  CLAIM_GATE: "CLAIM_GATE",
  LEARN: "LEARN"
});

export const ALLOWED_TRANSITIONS = Object.freeze({
  IDLE: ["PREDICTING"],
  PREDICTING: ["USER_HINT"],
  USER_HINT: ["FUTURE_SELECTED", "PREDICTING"],
  FUTURE_SELECTED: ["WORKBENCH_COMPILE", "USER_HINT"],
  WORKBENCH_COMPILE: ["HUMAN_CONFIRM"],
  HUMAN_CONFIRM: ["DISPATCHED", "FUTURE_SELECTED"],
  DISPATCHED: ["OBSERVING"],
  OBSERVING: ["CLAIM_GATE", "LEARN"],
  CLAIM_GATE: ["LEARN", "OBSERVING"],
  LEARN: ["IDLE"]
});

export function createStateMachine(initialState = STATES.IDLE) {
  if (!Object.values(STATES).includes(initialState)) {
    throw new Error(`Unknown initial state: ${initialState}`);
  }

  const machine = {
    current: initialState,
    history: [initialState],
    events: [],
    transition(nextState, event = {}) {
      const allowed = ALLOWED_TRANSITIONS[this.current] ?? [];
      if (!allowed.includes(nextState)) {
        throw new Error(`Invalid transition from ${this.current} to ${nextState}`);
      }
      this.current = nextState;
      this.history.push(nextState);
      this.events.push({ state: nextState, ...event });
      return this.current;
    }
  };

  return machine;
}

export function assertStateInvariant(state, data = {}) {
  switch (state) {
    case STATES.USER_HINT:
      if (data.checkpointCalled) throw new Error("USER_HINT may rerank cached futures only");
      break;
    case STATES.WORKBENCH_COMPILE:
      if (!data.compileResult) throw new Error("WORKBENCH_COMPILE must produce WorkbenchCompileResult");
      break;
    case STATES.DISPATCHED:
      if (!data.issueAnchor) throw new Error("DISPATCHED requires an issue anchor");
      break;
    case STATES.CLAIM_GATE:
      if (!data.temporalPincerVerdict) throw new Error("CLAIM_GATE requires Temporal Pincer verdict");
      break;
    default:
      break;
  }
  return true;
}
