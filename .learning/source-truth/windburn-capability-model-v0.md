---
id: windburn-capability-model-v0
source: DAS-1202 patch, app.js fallbackAuthContract + normalizeAuthContract
sourceType: rv_entry
lastVerified: 2026-05-04T19:45:31Z
summary: >
  Windburn uses a 3-tier capability model (viewer → operator → admin) defined
  in the auth contract. Each tier has a bounded set of grants and a distinct
  public policy. Currently only the viewer tier is active; operator and admin
  remain disabled until real authentication exists.
temporal:
  createdAt: 2026-05-04T19:45:31Z
  observedAt: 2026-05-04T19:45:31Z
  lastVerifiedAt: null
  lastAccessedAt: 2026-05-04T19:45:31Z
  ageBucket: fresh
  bucketTransitionAt: 2026-06-03T19:45:31Z
  stalenessReason: null
---

# Windburn 3-Tier Capability Model v0

## Overview

The auth contract defines three roles arranged in increasing capability:
viewer (public) → operator (authenticated intent staging) → admin
(provider/auth/webhook configuration). In v0, only viewer is active;
operator and admin tiers are placeholder definitions with disabled routes.

## Role Definitions

### Viewer (active)

- **Purpose**: Public, redacted status reading
- **Grants**: `read_redacted_status`, `read_openapi`
- **Policy**: "redacted status only"
- **UI state**: `active` (green badge); "redacted status only" boundary
- **Behavior**: `/stage` and `/broadcast` commands show alert lockout; no
  intent is stored, no webhook called, no live dispatch

### Operator (disabled)

- **Purpose**: Human-approved task staging after authentication
- **Grants**: `read_redacted_status`, `stage_task`
- **Policy**: "stage tasks only after authentication and explicit confirmation"
- **UI state**: `intent only` (locked); boundary shows "stage task intent only
  after auth" or staged count if intents exist
- **Behavior**: `/stage` and `/broadcast` store local intent only (max 3);
  `live_dispatch: false`, `webhook_called: false`

### Admin (disabled)

- **Purpose**: Provider, webhook, and auth configuration
- **Grants**: `read_redacted_status`, `stage_task`, `configure_providers`, `configure_auth`
- **Policy**: "provider, webhook, and auth configuration only after admin authentication"
- **UI state**: `disabled` (locked); boundary shows "provider/webhook/auth disabled"
- **Behavior**: `/api/admin/*` routes return 403 with disabled reason

## Route Guards

| Route | Min Role | Enabled |
|-------|----------|---------|
| `/api/status` | viewer | true |
| `/api/tasks/stage` | operator | false |
| `/api/admin/*` | admin | false |

## Global Flags

- `mutation_routes_enabled`: false (all tiers)
- `provider_webhooks_enabled`: false
- `runtime_channel_enabled`: false

## UI Representation

Fusion Chat renders an "Account Gate" pane with:
- Header badge: `{active_role} / {contract_version}` (e.g. "viewer / v0")
- Three role cards with state (`active`/`intent only`/`disabled`), boundary
  text, and grant list
- Footer: disabled routes summary
- Active role card gets green border highlight

The UI reads `bridgeState.auth` populated from `/api/status.auth` or a local
fallback (`fallbackAuthContract` in app.js). The `normalizeAuthContract()`
function validates and normalizes whatever the bridge returns.

## Design Constraint

The 3-tier model exists as a **contract declaration only** in v0. No real
auth mechanism exists — there is no login, no session, no token verification,
no OAuth flow. The active role is hardcoded to "viewer" in
`publicAuthContext()`. Operator and admin tiers will become active only
after real authentication is implemented in a future slice.

## Search Terms

capability model, Fusion Chat auth, viewer, operator, admin, role, tier, auth contract,
stage_task, read_redacted_status, configure_providers, configure_auth,
mutation_routes_enabled, route guard, min_role, Account Gate
