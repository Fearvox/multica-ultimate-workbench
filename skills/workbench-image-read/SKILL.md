---
name: workbench-image-read
description: Local image-read bridge for text-only agents to inspect screenshots without spawning a vision subagent.
---

# Workbench Image Read

Use this skill when the current runtime needs to understand a local screenshot
or image but has no native vision support.

## Default Command

```bash
image-read <path-to-image>
```

## When To Use

- The user attaches or names a local screenshot path.
- A Superconductor, Discord, GitHub, Vercel, dashboard, or terminal screenshot
  contains task-critical state.
- A text-only runtime would otherwise need to dispatch a vision subagent only to
  read one image.

## Workflow

1. Confirm the image path is the specific artifact needed for the task.
2. Run `image-read <path>`.
3. Extract only the relevant facts.
4. Redact private paths, emails, tokens, thread URLs, raw command payloads, or
   unrelated personal data.
5. Continue the original task using the image readback as supporting evidence.

## If Unavailable

If `image-read` is missing, fails, or lacks `OPENROUTER_API_KEY`, report:

```text
IMAGE_READ_UNAVAILABLE:
reason:
fallback:
```

Then either ask the operator for the relevant text/state or route to a
vision-capable local runtime. Do not infer unseen image content.

## Output Contract

```text
IMAGE_READ_REPORT
image:
available: yes | no
visual_facts:
sensitive_content_redacted:
confidence: high | medium | low
next_action:
```

## Boundaries

- Do not commit screenshots, OCR dumps, or generated image descriptions unless a
  separate issue explicitly asks for reviewed artifacts.
- Do not store or print API keys. The only allowed durable example is
  `OPENROUTER_API_KEY="<redacted>"`.
- Do not treat screenshot interpretation as browser workflow proof. Use
  `workbench-browser-proofshot-qa` when the task needs live UI verification.
