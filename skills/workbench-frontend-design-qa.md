---
name: workbench-frontend-design-qa
description: Frontend and visual QA for responsive surfaces, screenshots, text fit, hierarchy, and interaction states.
---

# Workbench Frontend Design QA

Use this skill for frontend UI, desktop/web surfaces, screenshots, responsive checks, interaction polish, and design-system consistency.

## QA Standard

- Test the actual screen or rendered artifact, not just source code.
- Check desktop and mobile or narrow-width behavior when the UI is responsive.
- Verify text fit, no incoherent overlap, stable spacing, focus states, hover states, loading states, empty states, and error states.
- For operational tools, prefer dense, scannable, predictable layouts over marketing-style pages.
- Use real assets or rendered UI evidence when visual truth matters.

## Design Checks

- Information hierarchy is clear at first glance.
- Primary action is obvious and not visually drowned by decoration.
- Controls match their job: icon buttons for tools, toggles for binary state, tabs for views, menus for option sets.
- Cards are not nested inside cards unless the local design system already does that.
- Colors are not a one-note palette and contrast is readable.
- Motion or animation does not hide state or slow repeated work.

## Output Contract

Return:

- `DESIGN_VERDICT`: PASS / FLAG / BLOCK.
- `SURFACES CHECKED`: URL, file, viewport, screenshot, or app surface.
- `FINDINGS`: severity, location, and fix.
- `EVIDENCE`: screenshot path, browser check, or command output.
- `NEXT ACTION`: smallest design or implementation correction.
