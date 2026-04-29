# Decisions

## 2026-04-29 - Hybrid Workbench Architecture

Decision: Use a Hybrid Multica Two-Ring Workbench.

The Inner Ring owns command, review, and synthesis. The Outer Ring owns bounded specialist execution, narrow analysis, and parallel advice. Direct chat remains available for fuzzy thinking, while issues carry executable work. Autopilots should create issues for scheduled checks rather than silently performing high-risk actions.

Rationale: This keeps collaboration native to Multica while giving the system a durable, versioned operating memory that can be reviewed, updated, and resumed.

## 2026-04-29 - Keep Codex Approval Inside Codex

Decision: Codex command approval and patch approval remain configured through Codex CLI, profiles, and runtime arguments rather than through Multica workbench files.

Rationale: Approval policy belongs to the runtime that enforces it. Keeping Codex approval inside Codex avoids duplicating authority, prevents stale policy drift, and keeps the workbench focused on operating memory instead of pretending to enforce runtime permissions.
