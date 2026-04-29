# Decisions

## 2026-04-29 - Hybrid Workbench Architecture

Decision: Use a Hybrid Multica Two-Ring Workbench.

The Inner Ring owns command, review, and synthesis. The Outer Ring owns bounded specialist execution, narrow analysis, and parallel advice. Direct chat remains available for fuzzy thinking, while issues carry executable work. Autopilots should create issues for scheduled checks rather than silently performing high-risk actions.

Rationale: This keeps collaboration native to Multica while giving the system a durable, versioned operating memory that can be reviewed, updated, and resumed.

## 2026-04-29 - Keep Codex Approval Inside Codex

Decision: Codex command approval and patch approval remain configured through Codex CLI, profiles, and runtime arguments rather than through Multica workbench files.

Rationale: Approval policy belongs to the runtime that enforces it. Keeping Codex approval inside Codex avoids duplicating authority, prevents stale policy drift, and keeps the workbench focused on operating memory instead of pretending to enforce runtime permissions.

## 2026-04-29 - Install Workspace Skill Core Pack

Decision: Add a small high-frequency workspace skill core pack to Multica before optimizing the full SDD/two-ring workflow.

The core pack is `workbench-sdd`, `workbench-conductor`, `workbench-research`, `workbench-review-qa`, `workbench-implementation`, `workbench-design-docs`, and `workbench-memory-synthesis`. The source files live in `skills/`, while the live Multica IDs and attachment map are recorded in `skills/README.md`.

Rationale: The workspace had no skills configured. Installing a compact shared operating layer gives every important agent the same execution grammar without blindly importing every local skill and creating prompt noise.

## 2026-04-29 - SDD Stages Are Comment-Level Milestones

Decision: SDD stages live as structured Multica issue comments, not as issue statuses.

The issue status model remains coarse: `todo`, `in_progress`, `in_review`, `done`, and `blocked`. The SDD pipeline records Raw Requirement, Product Design, Technical Design, Task List, and Execution And Verification as comments with `SDD_STAGE` headers and Supervisor PASS/FLAG/BLOCK gates.

Rationale: Five SDD stages do not map cleanly onto the existing status set. Keeping SDD at the comment layer preserves current routing, autopilot, and review behavior while adding a verifiable planning trail.
