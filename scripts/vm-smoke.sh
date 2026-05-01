#!/usr/bin/env bash
set -euo pipefail

ROOT="${WORKBENCH_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
SCRAPYBARA_OSS_DIR="${SCRAPYBARA_OSS_DIR:-/tmp/scrapybara-oss-inspect}"
IMAGE="${CAPY_COMPUTER_IMAGE:-scrapybara-computer}"
CONTAINER_NAME="${CAPY_VM_CONTAINER_NAME:-workbench-capy-vm-smoke}"
CAPY_API_PORT="${CAPY_API_PORT:-18000}"
CAPY_VNC_PORT="${CAPY_VNC_PORT:-15900}"
CAPY_NOVNC_PORT="${CAPY_NOVNC_PORT:-16091}"
CAPY_WIDTH="${CAPY_WIDTH:-1024}"
CAPY_HEIGHT="${CAPY_HEIGHT:-768}"
CAPY_VM_KEEP="${CAPY_VM_KEEP:-no}"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
DEFAULT_ARTIFACT_ROOT="${CAPY_VM_ARTIFACT_ROOT:-${TMPDIR:-/tmp}/multica-capy-vm-smoke}"
ARTIFACT_DIR="${CAPY_VM_ARTIFACT_DIR:-$DEFAULT_ARTIFACT_ROOT/$RUN_ID}"

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "MISSING: $1" >&2
    exit 2
  fi
}

cleanup() {
  if [[ "$CAPY_VM_KEEP" == "yes" ]]; then
    return 0
  fi
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}

wait_for_api() {
  local url="http://127.0.0.1:${CAPY_API_PORT}/openapi.json"
  for _ in $(seq 1 40); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "Computer API did not become ready: $url" >&2
  return 1
}

decode_screenshot() {
  local response_file="$1"
  local png_file="$2"
  python3 - "$response_file" "$png_file" <<'PY'
import base64
import json
import sys

response_path, png_path = sys.argv[1], sys.argv[2]
with open(response_path, "r", encoding="utf-8") as f:
    payload = json.load(f)

image = payload.get("base64_image")
if not image:
    raise SystemExit("response did not include base64_image")

with open(png_path, "wb") as f:
    f.write(base64.b64decode(image))
PY
}

main() {
  need docker
  need curl
  need python3

  if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is unavailable; start Docker or Colima before running VM smoke." >&2
    exit 4
  fi

  mkdir -p "$ARTIFACT_DIR"
  trap cleanup EXIT

  if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    if [[ ! -f "$SCRAPYBARA_OSS_DIR/computer/docker/Dockerfile" ]]; then
      echo "Missing image '$IMAGE' and Dockerfile at $SCRAPYBARA_OSS_DIR/computer/docker/Dockerfile" >&2
      exit 3
    fi
    docker build -t "$IMAGE" -f "$SCRAPYBARA_OSS_DIR/computer/docker/Dockerfile" "$SCRAPYBARA_OSS_DIR/computer"
  fi

  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  docker run -d --rm \
    --name "$CONTAINER_NAME" \
    -e WIDTH="$CAPY_WIDTH" \
    -e HEIGHT="$CAPY_HEIGHT" \
    -e DISPLAY_NUM=1 \
    -p "127.0.0.1:${CAPY_API_PORT}:8000" \
    -p "127.0.0.1:${CAPY_VNC_PORT}:5900" \
    -p "127.0.0.1:${CAPY_NOVNC_PORT}:6091" \
    "$IMAGE" > "$ARTIFACT_DIR/container_id.txt"

  wait_for_api

  curl -fsS -X POST "http://127.0.0.1:${CAPY_API_PORT}/computer" \
    -H "Content-Type: application/json" \
    -d '{"action":"take_screenshot"}' \
    > "$ARTIFACT_DIR/response.json"

  decode_screenshot "$ARTIFACT_DIR/response.json" "$ARTIFACT_DIR/screenshot.png"

  {
    echo "# VM Smoke RUN_DIGEST"
    echo
    echo "- run_id: $RUN_ID"
    echo "- container_name: $CONTAINER_NAME"
    echo "- image: $IMAGE"
    echo "- api_url: http://127.0.0.1:${CAPY_API_PORT}"
    echo "- novnc_url: http://127.0.0.1:${CAPY_NOVNC_PORT}"
    echo "- artifact_dir: $ARTIFACT_DIR"
    echo "- response_json: $ARTIFACT_DIR/response.json"
    echo "- screenshot_png: $ARTIFACT_DIR/screenshot.png"
    echo "- persistence_policy: local-temp-by-default; set CAPY_VM_ARTIFACT_DIR explicitly for durable review evidence"
    echo "- teardown: $([[ "$CAPY_VM_KEEP" == "yes" ]] && echo "keep-for-review" || echo "destroy")"
    echo "- secrets_policy: none"
  } > "$ARTIFACT_DIR/RUN_DIGEST.md"

  cat "$ARTIFACT_DIR/RUN_DIGEST.md"
}

main "$@"
