---
id: windburn-fusion-bridge-auth-contract-v0
source: DAS-1202 patch, packages/fusion-bridge-api/src/auth-contract.mjs, docs/remote-workhorse/FUSION_BRIDGE_AUTH_CONTRACT.md
sourceType: rv_entry
lastVerified: 2026-05-04T19:45:31Z
summary: >
  The Fusion Bridge auth contract defines how the browser-side Fusion Chat
  and the Cloudflare Worker negotiate capability. It exports guardRoute(),
  authContractSummary(), and publicAuthContext(). The contract is surfaced in
  /api/status.auth and consumed by the Fusion Chat Account Gate panel.
temporal:
  createdAt: 2026-05-04T19:45:31Z
  observedAt: 2026-05-04T19:45:31Z
  lastVerifiedAt: null
  lastAccessedAt: 2026-05-04T19:45:31Z
  ageBucket: fresh
  bucketTransitionAt: 2026-06-03T19:45:31Z
  stalenessReason: null
---

# Fusion Bridge Auth Contract v0

## Source

- **Code**: `packages/fusion-bridge-api/src/auth-contract.mjs`
- **Docs**: `docs/remote-workhorse/FUSION_BRIDGE_AUTH_CONTRACT.md`
- **Consumer**: Fusion Chat Account Gate panel (`app.js`)
- **Server integration**: `apps/fusion-chat-terminal/bridge.mjs`

## Exported Functions

### `guardRoute({ pathname, method, role })`

Routes every incoming HTTP request through a role-based gate.

Returns:
```js
{
  allowed: boolean,
  route: { id, match, minRole, enabled },
  reason: string | null,
  status: number | null  // for disabled routes, e.g. 403
}
```

Behavior:
- Matches pathname against defined route_guards
- If route is enabled AND role >= min_role → allowed
- If route is disabled → not allowed with reason and status
- `HEAD` always allowed; non-GET/non-HEAD for non-whitelisted routes → 405

### `authContractSummary(role)`

Builds the auth contract payload returned in `/api/status.auth`.

Returns:
```js
{
  version: "auth-contract-v0",
  active_role: "viewer",
  roles: [...],           // full role definitions with grants
  route_guards: [...],    // all defined guards with enabled flag
  public_viewer_policy: "...",
  operator_policy: "...",
  admin_policy: "...",
  mutation_routes_enabled: false
}
```

### `publicAuthContext()`

Returns `{ role: "viewer" }`. This is the hardcoded public context — the
foundation for future real auth where an authenticated session would
override the role.

## Bridge Integration (bridge.mjs)

Every HTTP request in `bridge.mjs` is processed through:
1. `guardRoute({ pathname, method, role: publicAuthContext().role })` — check access
2. If `!guard.allowed && guard.route` → `sendDisabledRoute(response, guard)` — structured 403
3. If `POST /api/status` → `sendMethodNotAllowed(response)` — structured 405
4. If non-GET/non-HEAD for unknown routes → plain 405

### Security Hardening in This Slice

| Measure | Before | After |
|---------|--------|-------|
| `/api/status` server block | exposed raw `host`, `port`, `app_dir` | "loopback host hidden", "local port hidden", "local app path hidden" |
| `POST /api/status` | fell through to 405 | structured 405 with `mutation_bridge_enabled: false` |
| `/api/admin/*` | no guard | 403 with `required_role`, `route_id`, `mutation_bridge_enabled` |
| Response headers | none | `x-windburn-api-mode: read-only` |

## Client-Side Normalization (app.js)

`normalizeAuthContract(auth)` validates and normalizes the bridge's auth
response against the `fallbackAuthContract`:
- Validates `active_role` is in the role list
- Normalizes camelCase/snake_case variations in route guards
- Coerces boolean fields (`enabled`, `mutation_routes_enabled`)
- Returns fallback on any structural mismatch

The client prefers `bridgeState.auth` when `bridgeState.authSource === "bridge"`,
falling back to `fallbackAuthContract` on any fetch or parse error.

## Smoke Test Assertions

```
auth.active_role === "viewer"
auth.mutation_routes_enabled === false
auth.roles includes operator with stage_task grant
auth.roles includes admin with configure_auth grant
```

## Design Decision: Auth as Status Field

The auth contract is returned as part of `/api/status` rather than as a
separate `/api/auth` endpoint. This was chosen so that:
1. A single fetch populates both status and capability model
2. The auth contract is always consistent with the bridge's current state
3. There is no extra auth introspection endpoint to secure

## Search Terms

Fusion Chat auth, Fusion Bridge auth contract, authContractSummary, guardRoute, publicAuthContext,
route guard, min_role, mutation_routes_enabled, viewer public context,
read-only bridge, normaliseAuthContract, /api/status.auth
