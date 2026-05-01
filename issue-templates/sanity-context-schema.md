# Sanity Context Schema Issue Template

Use this when creating or reviewing the Sanity unified context schema.

```text
HANDOFF_SUMMARY:
SCOPED_EVIDENCE:
ANTI_OVER_READ:

SANITY_CONTEXT_CONTRACT:
  project:
  dataset:
  schema_types:
    - agentProfile
    - runtimeSurface
    - skillContract
    - evidenceEvent
    - decisionRecord
    - handoff
    - capyProcessCheck
  data_policy: sanitized-summaries-only
  validation_command:

Required output:

SANITY_CONTEXT_REPORT
project:
dataset:
schema_types:
data_policy:
files_changed:
validation:
residual_risk:
VERDICT: PASS | FLAG | BLOCK
```

