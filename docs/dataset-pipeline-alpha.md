# Dataset Pipeline Alpha

The Dataset Pipeline Alpha is the first contract for research-data handling in
the Grand Pivot lane. It is a design and validation contract, not a claim that
sensitive clinical data can be processed safely today.

## Objective

Create a local-only path that can ingest public or synthetic documents,
normalize them, run a de-identification check, build a small local retrieval
index, and emit a reviewable lineage report.

## Data Classes

| Class | Default Handling | Allowed In Alpha |
| --- | --- | --- |
| Public papers, policies, docs | May be downloaded or cited if license permits | Yes |
| Synthetic fixtures | May be generated and committed if non-sensitive | Yes |
| De-identified examples | Local temp-only until reviewed | With Supervisor review |
| Client, patient, case, supervision, or institutional records | Do not ingest | No |
| Credentials, raw transcripts, screenshots, private messages | Do not ingest | No |

## Proposed Local Flow

```text
source_files
  -> manifest
  -> normalizer
  -> de_id_check
  -> chunker
  -> local_index
  -> retrieval_smoke
  -> lineage_report
```

Every stage must be reproducible from local files and must write only compact
derived evidence unless the task explicitly asks for a temp artifact.

## Local CLI Contract

The repository includes a local-only alpha helper at
`scripts/workbench-dataset`. Run it with `python3` or execute it directly from a
checkout:

```bash
python3 scripts/workbench-dataset init --fixture public-msw --out ./tmp/fixtures/public-msw
python3 scripts/workbench-dataset ingest ./tmp/fixtures/public-msw --out ./tmp/dataset-alpha
python3 scripts/workbench-dataset deid-check ./tmp/dataset-alpha/normalized
python3 scripts/workbench-dataset index ./tmp/dataset-alpha/chunks --local-only
python3 scripts/workbench-dataset report ./tmp/dataset-alpha --format markdown
```

The alpha helper is intentionally narrow: text fixtures only, local writes only,
no network upload, and no sensitive real-world records.

## Required Manifest

```yaml
DATASET_MANIFEST:
  dataset_name:
  data_class: public | synthetic | deidentified_fixture
  source_paths:
  source_licenses:
  network_used: yes | no
  remote_upload_used: no
  generated_files:
  excluded_files:
  de_id_check:
  retention_policy:
```

## Required Report

```text
DATASET_PIPELINE_ALPHA_REPORT
dataset:
data_class:
local_only:
network_used:
remote_upload_used:
commands_or_manual_steps:
files_created:
de_id_findings:
retrieval_smoke:
lineage:
residual_risk:
next_action:
verdict: PASS | FLAG | BLOCK
```

## Acceptance Gates

- No sensitive real-world records are used.
- The operator can reproduce the flow from a clean checkout or documented
  fixture source.
- The report distinguishes source facts from generated interpretation.
- The de-identification check reports findings instead of silently passing.
- The retrieval smoke uses a small, inspectable fixture set.
- Temporary artifacts are kept outside public Git unless intentionally
  sanitized and reviewed.

## Failure Modes

Return `BLOCK` if the task asks for raw sensitive data, remote upload by
default, hidden credential use, unsupported compliance claims, or unreviewed
persistent artifacts.

Return `FLAG` if commands are proposed but not implemented, de-identification
coverage is incomplete, or the lineage report lacks enough detail for review.
