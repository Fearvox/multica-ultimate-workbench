# ADR: Rust for Long-Running Agent Services

**Status**: Proposed
**Date**: 2026-05-05
**Deciders**: 0xVox (Nolan Zhu)
**Evidence**: Live Activity Monitor snapshot + 72h uptime process data

## Context

The Workbench agent ecosystem runs multiple 24x7 services on a single macOS
machine (24GB RAM). On 2026-05-05, a system-wide memory pressure event
triggered Brave renderer crashes (error code 5) and Multica UI failures.
Activity Monitor revealed:

| Process | Language | True Footprint | RSS (ps) | Notes |
|---------|----------|---------------|----------|-------|
| index-tts server | Python 3.10 | 9.17 GB | 2 MB | Model loading; GC never reclaimed |
| Vibe Island | Electron/JS | 6.67 GB | 687 MB | 10,740 Mach ports — port leak |
| Superconductor | Electron/JS | 1.02 GB | 367 MB | 54 threads |
| Claude Code session | Node/JS | 617 MB | 837 MB | Grows with conversation |
| Hermes gateway | Python 3.11 | 381 MB | 378 MB | 99% CPU over 296h |

System-level: 12.6 GB swap, 15.1/24 GB used, 0 MB free pages at peak.

The common root cause: **garbage-collected languages cannot provide
deterministic memory management for long-running agent services.** The
RSS-vs-footprint gap (index-tts: 9.17GB real vs 2MB RSS) means CLI-based
monitoring is blind to the actual problem.

## Decision

**Long-running agent services (runtime layer) MUST use Rust.** Short-lived
skill execution (single invocation, process exits) MAY use Python or
JavaScript.

Specifically:

```
┌─────────────────────────────────────────────────┐
│ RUNTIME LAYER (24x7)          → Rust            │
│                                                 │
│ • Agent gateway / message bus                   │
│ • Sandbox manager                               │
│ • Permission/evaluation engine                  │
│ • Fleet runtime panel daemon                    │
│ • Model loading servers (TTS, embedding)        │
│ • Memory/evidence persistence                   │
│                                                 │
│ Why: Ownership model → Drop on scope exit      │
│      Zero-cost abstractions → no hidden alloc   │
│      No GC pauses → predictable latency         │
│      Static binary → no venv sprawl             │
│      RAII → ports, files, sockets auto-close    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SKILL LAYER (invoke → exit)  → Python / JS      │
│                                                 │
│ • One-shot code generation                      │
│ • Document parsing / synthesis                  │
│ • Social media / web fetch wrappers             │
│ • Data analysis scripts                         │
│ • CLI glue / orchestration scripts              │
│                                                 │
│ Why: GC harmless for short-lived processes      │
│      Ecosystem libraries (LLM, HTTP, parsing)   │
│      Fast iteration without compile step        │
└─────────────────────────────────────────────────┘
```

## Evidence (observed, not theoretical)

### 1. index-tts — the 9GB ghost leak

```bash
# Activity Monitor: 9.17 GB "Memory" column
# ps aux: 2 MB RSS
# Same process (PID 10997), same moment
```

Python loaded an Index-TTS model for inference. The model weights were held
by a reference somewhere in the dependency graph that the GC could not prove
was unreachable. After inference, the memory was not released. From the OS
perspective, the process still owned 9 GB of compressed pages. From `ps`
perspective (RSS = pages physically resident), the process was 2 MB. The
truth was the OS view — the machine was suffocating.

Rust's ownership model makes this impossible: model weights are loaded into
a struct. When that struct goes out of scope, `Drop` runs immediately.
There is no GC to convince.

### 2. Vibe Island — the 10k port leak

Electron renderer processes hold JS event listeners that retain references
to sockets. The V8 GC traces reachability from roots; if a closure somewhere
in the renderer tree holds a socket reference, the GC cannot collect it.
10,740 Mach ports accumulated over days of uptime.

Rust's RAII makes this impossible: a `TcpStream` or `UnixStream` calls
`close(2)` when it goes out of scope. No GC needed. No event listener to
untangle.

### 3. The measurement blind spot

All three GC'd processes (index-tts 9GB→2MB, VibeIsland 6.7GB→687MB,
Superconductor 1GB→367MB) showed a 3-450x gap between true footprint and
RSS. This gap is specific to GC languages on macOS: compressed memory
accounts for pages that the GC has marked but not freed, and `ps RSS`
excludes compressed pages.

A Rust-based monitoring daemon using the Mach `task_info` API can report
true footprint per process. This is not possible to do reliably from
within a GC'd language monitoring itself.

## Consequences

### Positive

- **Deterministic memory**: runtime services have predictable, compile-time
  verified memory usage. No overnight swap creep.
- **No venv sprawl**: single static binary per service, no per-agent Python
  version conflicts.
- **RAII guarantees**: ports, files, sockets auto-close. No port leak
  accumulation.
- **Honest monitoring**: Rust can call Mach APIs directly for true footprint
  measurement, closing the RSS blind spot.

### Negative

- **Build step required**: iteration on runtime services requires `cargo build`,
  not just edit-save-run. Acceptable for the runtime layer where stability
  matters more than iteration speed.
- **Ecosystem smaller**: Python's LLM/ML ecosystem is richer. Mitigated by
  keeping the skill layer in Python — heavy ML stays there.
- **Learning curve**: contributors must know Rust for runtime work. Mitigated
  by the clear layer separation: most contributions are skill-layer (Python/JS).

### Neutral

- **Go is a valid alternative**: Go shares Rust's lack of GC-induced
  measurement blindness and static binary deployment. Go's GC is
  concurrent and low-latency but still non-deterministic. For the
  specific use case of model-loading servers (index-tts), Rust's `Drop`
  guarantee is preferable. Go remains acceptable for services that don't
  load/unload large models dynamically.

## References

- [Activity Monitor snapshot, 2026-05-05](Activity Monitor Memory tab, system 15.12/24GB used, swap 12.32GB)
- [RSS vs Footprint analysis](skills/workbench-runtime-hygiene/SKILL.md § Memory Pressure)
- [index-tts](https://github.com/index-tts/index-tts) — Python TTS server, observed 9.17GB footprint
- [Brave error code 5](https://support.brave.app/hc/en-us/articles/360018192251) — renderer OOM crash, direct consequence of system memory exhaustion
- [Vibe Island](https://vibeisland.app) — Electron-based agent workspace, observed 10,740 port leak
