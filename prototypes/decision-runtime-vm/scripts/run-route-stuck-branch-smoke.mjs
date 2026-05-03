import { runRouteStuckBranchSimulation } from "../src/simulator.mjs";

const result = await runRouteStuckBranchSimulation();

console.log("DECISION_RUNTIME_VM_SMOKE");
console.log(`user_hint: ${result.user_hint}`);
console.log(`state_sequence: ${result.state_sequence.join(">")}`);
console.log(`issue_anchor: ${result.compile_result.issue_anchor.issue_id}`);
console.log(`target_agent: ${result.compile_result.target_agent}`);
console.log(`keypress_checkpoint_calls: ${result.keypress_no_llm_evidence.checkpoint_calls.length}`);
console.log(`workbench_compile_called_on_keypress: ${result.keypress_no_llm_evidence.workbench_compile_called_on_keypress}`);
console.log(`issue_mutation_on_keypress: ${result.keypress_no_llm_evidence.issue_mutation_on_keypress}`);
console.log(`pincer_verdict: ${result.pincer_verdict.verdict}`);
console.log(`raw_artifacts_saved: ${result.raw_artifacts_saved}`);
