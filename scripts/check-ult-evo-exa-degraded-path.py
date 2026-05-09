#!/usr/bin/env python3
"""Check that Exa retrieval can succeed without model synthesis.

This is a public-safe regression check for the ult-evo degraded-path contract.
It does not make network calls, read real credentials, or contact xAI. Instead
it imports Hermes' Exa web-search implementation, replaces the Exa client with
a fixture, and verifies that search JSON is returned without any auxiliary
model/synthesis path.
"""

from __future__ import annotations

import importlib
import json
import os
import shutil
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


def _candidate_hermes_roots() -> list[Path]:
    roots: list[Path] = []

    env_root = os.environ.get("HERMES_AGENT_DIR", "").strip()
    if env_root:
        roots.append(Path(env_root))

    hermes_bin = shutil.which("hermes")
    if hermes_bin:
        resolved = Path(hermes_bin).resolve()
        for parent in resolved.parents:
            if (parent / "tools" / "web_tools.py").exists():
                roots.append(parent)
                break

    return roots


def _import_web_tools():
    try:
        return importlib.import_module("tools.web_tools")
    except ModuleNotFoundError as original_error:
        for root in _candidate_hermes_roots():
            root_str = str(root)
            if root_str not in sys.path:
                sys.path.insert(0, root_str)
            try:
                return importlib.import_module("tools.web_tools")
            except ModuleNotFoundError:
                continue

        raise SystemExit(
            "BLOCK: could not import Hermes tools.web_tools. "
            "Set HERMES_AGENT_DIR to a Hermes source checkout and rerun."
        ) from original_error


class FakeExaClient:
    def __init__(self) -> None:
        self.headers: dict[str, str] = {}
        self.calls: list[dict[str, object]] = []

    def search(self, query: str, num_results: int, contents: dict[str, object]):
        self.calls.append(
            {
                "query": query,
                "num_results": num_results,
                "contents": contents,
            }
        )
        return SimpleNamespace(
            results=[
                SimpleNamespace(
                    url="https://example.org/public-source",
                    title="Public regression source",
                    highlights=["Exa retrieval returned without model synthesis."],
                )
            ]
        )


def main() -> int:
    web_tools = _import_web_tools()
    fake_exa = FakeExaClient()
    query = "public safe exa degraded path regression"

    with (
        patch.dict(os.environ, {"EXA_API_KEY": "exa-test-placeholder"}, clear=False),
        patch.object(web_tools, "_load_web_config", return_value={"backend": "exa"}),
        patch.object(web_tools, "_get_exa_client", return_value=fake_exa),
        patch("tools.interrupt.is_interrupted", return_value=False),
        patch.object(web_tools._debug, "log_call"),
        patch.object(web_tools._debug, "save"),
    ):
        raw_result = web_tools.web_search_tool(query, limit=3)

    payload = json.loads(raw_result)
    web_results = payload.get("data", {}).get("web", [])

    if payload.get("success") is not True or not web_results:
        print(json.dumps({"status": "FAIL", "reason": "no Exa search results"}))
        return 1

    if not fake_exa.calls or fake_exa.calls[0]["num_results"] != 3:
        print(json.dumps({"status": "FAIL", "reason": "Exa client was not called as expected"}))
        return 1

    print(
        json.dumps(
            {
                "status": "PASS",
                "degraded_path": "retrieval_only",
                "synthesis_required": False,
                "result_count": len(web_results),
                "first_url": web_results[0]["url"],
            },
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
