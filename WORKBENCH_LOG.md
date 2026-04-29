# Workbench Log

## 2026-04-29

- Started the Multica Ultimate Workbench as a local durable operating-memory repository.
- Established the initial directory skeleton for inner agents, outer agents, issue templates, autopilots, and scripts.
- Initialized a new git repository at `/Users/0xvox/multica-ultimate-workbench`.
- Added initial governance documents: `README.md`, `SYNTHESIS.md`, `DECISIONS.md`, and this log.
- Added tracked `.gitkeep` files to preserve the initial directory skeleton in git.
- Recorded that Multica remains the live collaboration/runtime layer and this repository remains the versioned workbench memory.
- Recorded the version 1 boundary: no Multica daemon, Desktop UI, or core runtime modifications.
- Multica Desktop shows runtimes, but CLI runtime listing returned empty output; agent creation is blocked until workspace/profile alignment is resolved.
- Added redaction filtering to the read-only workbench state inspection script before printing Multica workspace, runtime, and agent output.
- Hardened header and cookie redaction for multi-part auth, API key, token, secret, and password values in the read-only state inspection script.
- Hardened JSON and colon-form redaction for generic env-style key, token, and secret fields in the read-only state inspection script.
- Verified that the default Multica CLI profile has its daemon stopped and no `workspace_id`, so it is not the correct workbench execution context.
- Verified that the Multica Desktop daemon runs with profile `desktop-api.multica.ai` and watches workspace `DASH` (`5470ee5d-0791-4713-beb4-fd6a187d6523`).
- Verified runtime IDs with explicit profile and workspace flags: Claude `dd23854a-7a38-4d04-8d02-014ba5a9df3d`, Codex `76228a28-203a-4249-9756-731d3cf68554`, Hermes `d3a6d5a7-a80e-42ba-9d9e-3cefbc27fcf2`; all three were online.
- Confirmed no workbench agents were created during Task 6 verification; existing private `Workbench Max` agent on the Codex runtime remains preserved.
- Updated the read-only state script to default Multica calls to the verified Desktop profile and `DASH` workspace while still allowing explicit environment overrides.
- Added bare `Auth`/`AUTH`/`auth` field redaction to the read-only state script while preserving existing credential filters.
- Prepared the guarded Task 7 Codex Guardian pilot creation script and corrected generated create-command docs to use verified Multica create flags only; no Multica agent was created.
- Added exact-match target guards to the Codex Guardian pilot creation script so inherited environment overrides cannot redirect profile, workspace, or runtime before creation; no Multica agent was created.

- Created private Multica pilot agent `Codex Guardian` (`28b28318-1ba5-4d41-883e-9763ce66c816`) on verified Codex runtime `76228a28-203a-4249-9756-731d3cf68554` after explicit user confirmation; existing `Workbench Max` remains preserved.
- Created non-destructive Multica pilot issue `DAS-1` (`208b61ae-0bbc-4cf6-be99-d6e026ebc6bc`) assigned to `Codex Guardian` after explicit user confirmation.
- Verified Codex Guardian pilot run `526a9e37-66d2-482f-9b26-62e14fd7bddf` completed, posted comment `49d18343-dc48-4943-8a9b-436607149c44`, and moved issue `DAS-1` to `in_review` without editing files, running destructive commands, or creating extra agents.
