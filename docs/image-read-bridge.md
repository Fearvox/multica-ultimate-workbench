# Image Read Bridge

`image-read` is a local vision bridge for text-only agent runtimes.

It lets Claude Code, Hermes, Codex, or other text-only Workbench sessions read a
local screenshot without dispatching a separate vision-capable subagent.

```bash
image-read path/to/screenshot.png
```

## Role

Use `image-read` when the task depends on a local image and the current runtime
cannot inspect images natively:

- Superconductor panes and terminal screenshots;
- Discord, GitHub, Vercel, or dashboard screenshots;
- visual bug reports where the relevant state is already captured as an image;
- screenshot triage before deciding whether a full browser proofshot is needed.

This is a read-only perception helper. It does not replace browser workflow
verification, Playwright checks, or proofshot QA.

## Install Surface

The current local build lives outside this repository:

```text
source: ~/go/src/image-read/
binary: ~/go/bin/image-read
```

The API key must stay in the trusted shell environment, never in Git:

```bash
export OPENROUTER_API_KEY="<redacted>"
```

Do not commit the binary, screenshots, generated OCR dumps, or API keys into
this repo.

## Operating Rules

1. Run `image-read <image>` only on the specific image needed for the task.
2. Summarize the relevant visual facts; do not paste raw OCR if it contains
   private UI, paths, tokens, emails, thread URLs, or personal data.
3. Label the result as image-derived evidence, not direct app verification.
4. If the command is unavailable or the key is missing, report `UNAVAILABLE`
   and use a fallback instead of guessing.
5. Keep screenshots out of public Git unless a separate issue explicitly asks
   for reviewed visual artifacts.

## Fallback Policy

```text
IMAGE_READ_FALLBACK:
1. image-read <file>
2. ask the operator for the relevant text/state
3. route to a vision-capable local runtime or browser proofshot task
4. stop; do not infer unseen image content
```

## Report Shape

```text
IMAGE_READ_REPORT
image:
command:
available: yes | no
visual_facts:
sensitive_content_redacted:
confidence: high | medium | low
next_action:
```

## Boundary

`image-read` is for perception. Completion still needs the evidence required by
the original task: git diff, tests, browser checks, issue/run readback, preview
proof, or other live-system receipts.
