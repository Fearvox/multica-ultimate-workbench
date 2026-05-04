---
id: windburn-zonic-console-entry-v0
source: DAS-1202 patch, docs/remote-workhorse/ZONIC_WINDBURN_CONSOLE_ENTRY_PLAN.md
sourceType: rv_entry
lastVerified: 2026-05-04T19:45:31Z
summary: >
  The Zonic Windburn Console Entry Plan defines how a public-safe path from
  zonicdesign.art into the Windburn console will work once the console route
  is real, reviewed, and stream-safe. In the current v0 slice, this is a
  draft plan only — no route is published, no DNS, no deployment.
temporal:
  createdAt: 2026-05-04T19:45:31Z
  observedAt: 2026-05-04T19:45:31Z
  lastVerifiedAt: null
  lastAccessedAt: 2026-05-04T19:45:31Z
  ageBucket: fresh
  bucketTransitionAt: 2026-06-03T19:45:31Z
  stalenessReason: null
---

# Zonic Windburn Console Entry Plan v0

## Status

**Draft plan, not published.** No route, DNS, deployment, Cloudflare
configuration, docs sync, or zonic page publish is part of this slice.

## Source

`docs/remote-workhorse/ZONIC_WINDBURN_CONSOLE_ENTRY_PLAN.md`

## Goal

Add a public-safe path from `zonicdesign.art` / `docs.zonicdesign.art` into
the Windburn console once the console route is real, reviewed, and
stream-safe.

## Current Safe Links (Already Published)

These zonicdesign.art pages exist independently and should not be modified
in this slice:

| Surface | Status |
|---------|--------|
| `docs.zonicdesign.art/pages/getting-started.html` | existing public docs — setup guidance |
| `docs.zonicdesign.art/pages/guides/agent-pipeline.html` | existing public docs — operator guidance |
| `docs.zonicdesign.art/pages/reference/config.html` | existing public docs — config reference |

## Proposed Entry

| Item | Draft value |
|------|-------------|
| Label | Windburn Console |
| Target | reviewed console route (not yet assigned) |
| Required state | route returns Fusion Chat shell with Account Gate visible |
| Public role | viewer |
| Allowed data | redacted status, OpenAPI link, disabled operator/admin capabilities |
| Disallowed data | raw hosts, local paths, credential paths, commands, provider config |

## Publish Gate (7 Checks)

No zonic route may be published until ALL checks pass:

1. Fusion Chat route loads over the intended public origin
2. `/api/status` returns `auth.active_role=viewer`
3. `auth.mutation_routes_enabled=false`
4. Operator staging is local intent only
5. Admin provider/webhook/auth config is visibly disabled
6. DOM inspection finds no raw IP address, local path, credential path,
   SSH target, or operator command
7. Supervisor review accepts the route and copy

## Non-Action This Slice

- No DNS configuration
- No deployment to any hosting surface
- No Cloudflare Worker route changes
- No docs.zonicdesign.art page modification or sync
- No zonic page publish

## Relationship to Auth Contract

The Windburn Console concept is a **separate entry surface** from the
Fusion Chat bridge. The console is the public web page that loads the
Fusion Chat shell; the bridge is the local Node.js server that the shell
talks to. The auth contract governs what the shell can do — the console
entry plan governs how the public finds it.

## Search Terms

zonicdesign.art, Windburn Console, console entry, zonic route, public-safe,
publish gate, DOM inspection, viewer public, fusion chat shell
