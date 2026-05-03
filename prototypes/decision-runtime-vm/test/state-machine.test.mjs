import test from "node:test";
import assert from "node:assert/strict";
import { createStateMachine, STATES } from "../src/state-machine.mjs";

test("state machine follows required route from idle to learn", () => {
  const machine = createStateMachine();
  const route = [
    STATES.PREDICTING,
    STATES.USER_HINT,
    STATES.FUTURE_SELECTED,
    STATES.WORKBENCH_COMPILE,
    STATES.HUMAN_CONFIRM,
    STATES.DISPATCHED,
    STATES.OBSERVING,
    STATES.CLAIM_GATE,
    STATES.LEARN,
    STATES.IDLE
  ];

  for (const state of route) machine.transition(state);

  assert.deepEqual(machine.history, [
    STATES.IDLE,
    ...route
  ]);
});

test("state machine rejects compile before future selection", () => {
  const machine = createStateMachine();
  assert.throws(
    () => machine.transition(STATES.WORKBENCH_COMPILE),
    /Invalid transition/
  );
});
