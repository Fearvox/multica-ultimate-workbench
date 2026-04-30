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

## 2026-04-30 - Expand Workbench Skills Through Role-Specific High-Frequency Pack

Decision: Expand the Multica workspace skill pack from 7 core skills to 15 role-specific high-frequency skills during DAS-9.

The added skills are `workbench-debug-investigate`, `workbench-code-review`, `workbench-frontend-design-qa`, `workbench-browser-proofshot-qa`, `workbench-docs-release`, `workbench-token-context-discipline`, `workbench-product-brainstorming`, and `workbench-gsd-tasking`.

The live rollout must remain source-first and reversible: back up current live skills and bindings, patch local source, commit the source batch, synchronize live skills, update bindings by role, verify every binding, and keep `Workbench Max` untouched.

Rationale: The original 7-skill pack gave agents a shared operating grammar, but the workbench now repeatedly needs debugging, code review, visual/browser QA, docs release, context discipline, brainstorming, and tasking behavior. Adding compact role-specific skills gives agents the missing high-frequency habits without importing every local skill or bloating every prompt.
