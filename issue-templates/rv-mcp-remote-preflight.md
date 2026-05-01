# RV MCP Remote Preflight Template

## Goal

Verify whether a remote runtime can use a read-only Research Vault MCP endpoint
for L2 Pressure before remote Hermes or VM tasks depend on it.

## Scope

Read-only. No vault writes, ingests, deletes, maintenance, credential dumps, or
runtime profile changes.

## Required Checks

```text
RV_MCP_REMOTE_PREFLIGHT
runtime_context:
endpoint_source:
tools_expected:
tools_visible:
vault_status_result:
sample_search_query:
sample_search_result_summary:
taxonomy_summary:
failure_mode:
next_action:
verdict: PASS | FLAG | BLOCK
```

## Tool Boundary

Allowed read-only tools:

- `vault_status`
- `vault_search`
- `vault_taxonomy`
- `vault_get`

Disallowed unless separately approved:

- raw ingest
- note save
- delete
- maintenance
- broad export
- credential or token inspection

## Remote Anchor Rules

- Laptop `file://` paths are not valid remote evidence unless the issue proves
  the path is mounted there.
- Prefer a Streamable HTTP `/mcp` endpoint or a project-bound remote resource.
- If the endpoint is missing, blocked, or auth-bound, report `FLAG` or `BLOCK`
  with the smallest operator action needed.

## Closeout

`PASS` means remote Hermes can perform read-only L2 Pressure checks from a real
Research Vault source. `FLAG` means a fallback memory source is usable but not
the intended remote MCP. `BLOCK` means remote tasks must not claim RV pressure
until access is fixed.
