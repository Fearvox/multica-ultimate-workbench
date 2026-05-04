---
id: windburn-architecture-v0
source: DAS-1202 patch (windburn-account-auth-v0.patch), commit 87f687c
sourceType: rv_entry
lastVerified: 2026-05-04T19:45:31Z
summary: >
  Windburn is a read-only Fusion Chat shell backed by a local Node.js bridge
  and a Cloudflare Worker. Its v0 architecture has three tiers: a public
  Fusion Chat UI, a local bridge (`bridge.mjs`) that serves read-only API
  endpoints, and a Cloudflare Worker at
  windburn-fusion-bridge-api.fearvox1015.workers.dev with a public /api/status,
  /api/superruntime, /healthz, and /openapi.json surface. All mutation routes
  are disabled. The auth contract lives in
  packages/fusion-bridge-api/src/auth-contract.mjs and is documented at
  docs/remote-workhorse/FUSION_BRIDGE_AUTH_CONTRACT.md.
temporal:
  createdAt: 2026-05-04T19:45:31Z
  observedAt: 2026-05-04T19:45:31Z
  lastVerifiedAt: null
  lastAccessedAt: 2026-05-04T19:45:31Z
  ageBucket: fresh
  bucketTransitionAt: 2026-06-03T19:45:31Z
  stalenessReason: null
---

# Windburn Architecture v0

## What Windburn Is

Windburn provides a read-only browser shell (Fusion Chat) that lets operators
inspect a local runtime's status through a public-safe API boundary. It is
intentionally narrow: no secrets, no credentials, no live mutation, no webhook
execution, and no task dispatch at the v0 boundary.

## Component Map

| Component | Location | Role |
|-----------|----------|------|
| Fusion Chat UI | `apps/fusion-chat-terminal/` | Browser shell, vanilla JS + CSS |
| Bridge server | `apps/fusion-chat-terminal/bridge.mjs` | Local Node.js HTTP server; serves UI + read-only API |
| Fusion Bridge API package | `packages/fusion-bridge-api/` | Shared contract code (auth, superruntime, healthz) |
| Cloudflare Worker | `windburn-fusion-bridge-api.fearvox1015.workers.dev` | Public edge: `/healthz`, `/api/status`, `/api/superruntime`, `/openapi.json` |
| Auth contract source | `packages/fusion-bridge-api/src/auth-contract.mjs` | Role guards, auth summary builder, public auth context |
| Auth contract docs | `docs/remote-workhorse/FUSION_BRIDGE_AUTH_CONTRACT.md` | Design-level contract description |
| zonic entry plan | `docs/remote-workhorse/ZONIC_WINDBURN_CONSOLE_ENTRY_PLAN.md` | Future public console route plan (not published) |
| Repo | `Fearvox/project-windburn` | GitHub repo (not configured as Multica workspace resource) |

## Enabled Endpoints (v0)

- `GET /` — Fusion Chat shell
- `GET /healthz` — health check
- `GET /api/status` — read-only bridge status with auth contract
- `GET /api/superruntime` — superruntime fixture
- `GET /openapi.json` — OpenAPI spec

## Disabled / Non-Mutating

- `POST /api/status` → 405 Method Not Allowed
- `POST /api/setup/xai/inspect` → read-only only; mutation routes disabled
- `/api/admin/*` → disabled (403, required_role: admin)
- `/api/tasks/stage` → disabled (operator gated)
- All non-GET/non-HEAD methods → 405

## Key Architectural Decisions

1. **Read-only public edge**: the Cloudflare Worker exposes only GET routes.
   POST, PUT, DELETE, PATCH return 405 with `mutation_bridge_enabled: false`.

2. **Hidden loopback details**: the bridge hides local host, port, and filesystem
   paths from `/api/status` responses. Server block returns "loopback host hidden",
   "local port hidden", and "local app path hidden" instead of real values.

3. **Auth contract as API field**: `/api/status` includes an `auth` field
   returned by `authContractSummary(role)`, giving every client (browser,
   worker, script) the same capability model without a separate auth endpoint.

4. **guardRoute pattern**: `bridge.mjs` calls `guardRoute({ pathname, method,
   role })` for every request. The guard returns `{ allowed, route, reason,
   status }`. Disabled routes return structured JSON with `error`,
   `route_id`, `required_role`, and `mutation_bridge_enabled`.

5. **No secret surface**: `_local-cred/` is never accessed. No credential
   paths, SSH targets, tmux targets, API keys, or OAuth tokens exist in the
   public API surface.

## Search Terms

Windburn, Fusion Chat, Fusion Chat auth, CF Worker, auth contract, capability model, guardRoute,
bridge.mjs, read-only, Zonic, viewer, operator, admin
