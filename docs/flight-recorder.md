# Workbench Flight Recorder

The flight recorder is a small read-only helper for Multica issues. It creates a `RUN_DIGEST` from issue metadata, comments, runs, and run-message counts without saving raw content.

## Why It Exists

Agent workflows can look successful while still hiding operational problems:

- a task finished but never posted usable evidence
- a review label is missing
- a run failed before a later owner recovered it
- a stage read too much issue history
- token usage is invisible in CLI JSON even when the UI shows quota numbers

The digest turns those into quick review signals.

## Basic Use

```bash
scripts/collect-flight-recorder.sh <issue-id>
```

This prints Markdown to stdout and writes nothing durable.

## Persistent Summary Mode

```bash
scripts/collect-flight-recorder.sh <issue-id> --artifact-dir "${TMPDIR:-/tmp}/workbench-flight-recorder/<issue-id>"
```

This writes:

- `issue-summary.json`
- `comments-summary.json`
- `runs-summary.json`
- `run-message-summary.json`
- `run-digest.md`

These files are summaries only. Raw issue, comment, and run-message payloads are not saved.

## Recommended SDD Use

At the end of a non-trivial issue:

1. Owner posts execution evidence.
2. Reviewer runs the flight recorder against the issue.
3. Reviewer uses the digest to check evidence shape and context discipline.
4. Reviewer posts `PASS`, `FLAG`, or `BLOCK` with the digest highlights.
5. Synthesizer records only durable outcomes in `WORKBENCH_LOG.md`.

## Daily Health Use

For daily health issues, the assigned agent should include a digest for the current health issue after its inspection pass. The digest should remain compact:

- no raw workspace dumps
- no secrets
- no full run-message transcript
- no broad issue history unless needed to explain a concrete risk

## Space Discipline

The helper is designed for low disk pressure:

- default mode is stdout only
- temp files are deleted automatically
- persistent summary mode should be used only when an issue needs a review artifact
- do not store browser traces, screenshots, raw API payloads, or full logs in this repo unless a separate issue explicitly requires them
