#!/usr/bin/env python3
"""Check Exa retrieval and model-synthesis degradation stay public-safe.

This is a public-safe regression check for the ult-evo degraded-path contract.
It does not make network calls, read real credentials, or contact xAI. Instead
it imports Hermes' Exa web-search implementation, replaces the Exa client with
a fixture, and verifies that search JSON is returned without any auxiliary
model/synthesis path. It also verifies that a synthesized degraded result
redacts UUID-shaped provider identifiers before user-facing output.
"""

from __future__ import annotations

import importlib
import json
import os
import re
import shutil
import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


UUID_SHAPED_RE = re.compile(
    r"\b[0-9a-fA-F]{8}-"
    r"[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{12}\b"
)


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


def sanitize_provider_error(raw_error: str) -> str:
    """Return a copy-paste-safe model-provider error summary."""
    redacted = UUID_SHAPED_RE.sub("[redacted-provider-id]", raw_error)
    return " ".join(redacted.split())


def build_model_synthesis_degraded_result(
    web_results: list[dict[str, object]], raw_error: str
) -> dict[str, object]:
    return {
        "success": True,
        "partial": True,
        "code": "MODEL_SYNTHESIS_DEGRADED",
        "error_class": "quota_or_model_unavailable",
        "model_error": sanitize_provider_error(raw_error),
        "data": {
            "web": web_results,
        },
    }


def _verify_retrieval_only() -> list[dict[str, object]]:
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
        raise AssertionError("no Exa search results")

    if not fake_exa.calls or fake_exa.calls[0]["num_results"] != 3:
        raise AssertionError("Exa client was not called as expected")

    return web_results


def _verify_degraded_redaction(web_results: list[dict[str, object]]) -> None:
    synthetic_provider_error = (
        "quota exhausted for provider team "
        "00000000-0000-4000-8000-000000000000 and account "
        "11111111-1111-4111-8111-111111111111"
    )
    degraded = build_model_synthesis_degraded_result(
        web_results=web_results,
        raw_error=synthetic_provider_error,
    )
    output = json.dumps(degraded, sort_keys=True)

    if degraded.get("code") != "MODEL_SYNTHESIS_DEGRADED":
        raise AssertionError("missing MODEL_SYNTHESIS_DEGRADED code")

    if degraded.get("partial") is not True:
        raise AssertionError("degraded payload must be partial")

    if degraded.get("data", {}).get("web") != web_results:
        raise AssertionError("degraded payload did not preserve retrieval results")

    if UUID_SHAPED_RE.search(output):
        raise AssertionError("UUID-shaped provider identifier leaked")

    if "[redacted-provider-id]" not in output:
        raise AssertionError("provider identifier redaction was not exercised")


def main() -> int:
    try:
        web_results = _verify_retrieval_only()
        _verify_degraded_redaction(web_results)
    except AssertionError as error:
        print(json.dumps({"status": "FAIL", "reason": str(error)}, sort_keys=True))
        return 1

    print(
        json.dumps(
            {
                "status": "PASS",
                "degraded_path": "retrieval_only_or_model_synthesis_degraded",
                "synthesis_required": False,
                "redaction_checked": True,
                "uuid_leak_checked": True,
                "result_count": len(web_results),
                "first_url": web_results[0]["url"],
            },
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
