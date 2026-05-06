# Session Anchor — 2026-05-05

## Evidence (not theory)

| Bug | Process | Lang | Symptom | Root Cause |
|-----|---------|------|---------|------------|
| 9.17GB ghost | index-tts (PID 10997) | Python | Activity Monitor 9.17GB, ps RSS 2MB | GC can't see C extension pointers |
| 10,740 ports | Vibe Island (PID 5928) | Electron/JS | Mach port exhaustion | JS closures hold sockets, GC won't collect |
| 99% CPU / 296h | Hermes gateway | Python | CPU saturation | Python interpreter overhead compounds |
| 12.6GB swap | System-wide | — | Browser error 5, Multica unresponsive | GC'd languages time-integrate memory |
| RSS blind spot | All GC'd processes | — | 4500x gap Activity Monitor vs ps | CLI monitoring blind; need Mach task_info |

## Genealogy

| Date | Project | Creator | Lang | Stars | Notes |
|------|---------|---------|------|-------|-------|
| 2025.02 | Claude Code | Anthropic | TS/Python | 120K | agentic coding CLI |
| 2025.04 | Codex CLI | OpenAI | **Rust 96%** | 80K | validates our Rust thesis |
| 2025.11 | Clawbot | Peter Steinberger | TS | — | "let Claude do things for me" |
| 2026.01 | OpenClaw | Community | TS | 369K | Anthropic trademark dispute → rename |
| 2026.02 | Peter → OpenAI | — | — | — | Joins to lead Agent Runtime |
| 2026.?? | Hermes | NousResearch | Python | — | OpenClaw alternative + migration path |

**Key insight**: OpenAI's Codex (Rust, Apache 2.0) proves our thesis. Nobody has built a Rust gateway + Go control plane. We have evidence + open-source access + validation.

## Decisions Anchored

- **ADR**: Rust for Runtime Layer (24x7), Python/JS for Skill Layer (invoke→exit)
- **Multi-license**: Protocols=Apache 2.0, Code=Apache 2.0, Learnings=CC BY-SA 4.0
- **Gateway**: agent telephone exchange — everyone rebuilds it, nobody gets it right in Rust
- **ACP**: agent TCP/IP — interop layer, don't rebuild
- **Measurement**: ps RSS is wrong for macOS; must use Mach task_info / footprint

## Local Access

| Project | Path | Lang | Version | Status |
|---------|------|------|---------|--------|
| Claude Code (Evensong) | `~/claude-code-reimagine-for-learning/` | TS | — | Reverse-engineered |
| Hermes Agent | `~/.hermes/hermes-agent/` | Python | 0.12.0 | Full source + git history |
| OpenClaw | `~/.openclaw/` | TS | 2026.4.29 | Installed |
| Codex CLI | `brew` | Rust | 0.128.0 | Installed |
| Multica CLI | `brew` | **Go** | 0.2.23 | Already Go ✓ |
| Multica Desktop | `/Applications/` | Go | native arm64 | Already Go ✓ |

## Toolchain

- Go 1.26.2 ✓
- Rust (cargo 1.94.1) ✓
- Zig ✗ (not installed)

## Rewrite Plan

| Layer | From | To | Est. | Why |
|-------|------|----|------|-----|
| Gateway | Hermes Python | Rust | 3-4 weeks | Message bus is SPOF |
| Agent CLI | Claude Node.js | Rust | 2-3 weeks | Codex validates approach |
| TUI/REPL | Hermes Python | Rust (ratatui) | 2-3 weeks | Dogfood acceleration |
| Desktop GUI | Electron | Tauri (Rust) | 4-6 weeks | Heaviest lift |
| Daemon | — | — | Done | Multica Go ✓ |

**Total**: 3-4 months with dogfooding. First usable at Week 4 (gateway drops 99% CPU).

## Hygiene Skill Updates

Added to `skills/workbench-runtime-hygiene/SKILL.md`:
- RSS vs Real Footprint (macOS critical)
- Port Leak Detection
- Workbench Agent Memory Budget (True Footprint column)
- Thresholds: free RAM <15%→FLAG, <8%→BLOCK, swap >2GB→FLAG, >5000 ports→FLAG

## Friction Patterns

- `tool-error-loop-escaping.md`: 2+ same-category tools fail → switch to native integration
- RSS blind spot: CLI monitoring is inadequate for GC'd languages on macOS

## Worktree Hygiene

- Distilling sessions MUST use dedicated worktrees
- This file lives in `agents/agent/distill-rust-gc-adr`
- Main lane (`das-1297-land-active-memory-packet`) belongs to Windburn/Conductor
