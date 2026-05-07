# Algorithm Advisory Gate

Use this scaffold after Technical Design and before Task List.

```text
SDD_STAGE: Algorithm Advisory Gate
OWNER: Remote Algorithm Advisor
STATUS: READY_FOR_REVIEW
REVIEWER: Workbench Supervisor
EVIDENCE:
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:
```

```text
ALGO_ADVISORY_REPORT
target_issue:
source_stage: Technical Design
runtime:
model:
isolation:
skill_sources:
code_scope:
correctness_verdict: PASS | BLOCK
complexity_verdict: PASS | FLAG | BLOCK
data_structure_notes:
algorithmic_risks:
task_list_injections:
verification_injections:
settings_readback:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

Review rule:

- `BLOCK` returns the issue to Technical Design.
- `FLAG` may enter Task List only when injections are copied into tasks or
  verification.
- `PASS` may enter Task List with any advisory test suggestions preserved.
