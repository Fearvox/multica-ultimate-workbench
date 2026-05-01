# Remote Research Vault MCP Contract

Remote Hermes and VM tasks use Research Vault as a pressure source, not as a
dumping ground. The contract is read-only by default and exists to prevent
repeat mistakes in long-running remote work.

## First-Class Path

1. A remote runtime receives an issue with `RV_PRESSURE: required` or
   `L2_PRESSURE: yes`.
2. The owner runs an RV MCP Remote Preflight if remote vault access has not been
   proven for that runtime.
3. The owner posts `RV_PRESSURE_CHECK`.
4. The issue proceeds only after the pressure check identifies prior failures,
   proven patterns, or a justified no-hit result.

## Read-Only Tool Set

- `vault_status`
- `vault_search`
- `vault_taxonomy`
- `vault_get`

All write, ingest, delete, maintenance, export, or broad raw retrieval tools are
out of scope unless a separate issue explicitly approves them and Supervisor
reviews the evidence.

## Evidence Rules

Issue comments may include:

- query names or short search terms;
- count-level results;
- compact summaries;
- paths or titles that are public-safe; and
- the resulting constraint or next action.

Issue comments must not include:

- raw private vault entries;
- secrets, OAuth material, cookies, or API keys;
- screenshots or private UI state;
- direct remote machine names or IPs; or
- broad run transcripts or raw payloads.

## Failure Modes

| Failure | Verdict | Next Action |
| --- | --- | --- |
| Remote endpoint unavailable | `FLAG` | Create an RV MCP Remote Preflight follow-up. |
| Auth required | `BLOCK` if task depends on RV | Ask operator for the smallest auth action. |
| Laptop `file://` path only | `FLAG` | Use project-bound resource or remote endpoint. |
| Query returns no relevant hits | `PASS` or `FLAG` | `PASS` only for specific bounded searches. |
| Tool exposes write capability | `FLAG` | Keep read-only tools only until reviewed. |

## Closeout Standard

Remote Hermes may claim L2 Pressure only when it can name what memory changed:

- the selected route;
- the rejected route;
- the verification gate;
- the risk register; or
- the next follow-up issue.

If memory did not change the plan, the owner must say why the current path
already matched the best available evidence.
