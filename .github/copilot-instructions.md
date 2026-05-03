# Copilot Cloud Safety

This repository uses local browser and MCP tools in some human-operated
workflows, but GitHub Copilot, Codex Cloud, and repo-reply bots must run with a
cloud-safe profile.

- Do not start or require `stdio` MCP servers.
- Do not start Playwright MCP, local browser MCP, local filesystem MCP outside
  the checked-out repository, or any tool that depends on the user's desktop
  session.
- If browser evidence is required, leave a concise `BLOCK`/`FLAG` comment that
  asks for a local interactive browser lane instead of attempting to launch
  Playwright.
- Keep comments unblocking and evidence-focused; avoid re-triggering other
  bots unless the human explicitly requests it.
