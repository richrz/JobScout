#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-$(node "$ROOT_DIR/scripts/find-open-port.js")}"
export PORT

echo "Starting Next.js server on http://localhost:${PORT}"
exec next start --port "$PORT" "$@"
