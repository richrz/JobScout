#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Pick a random available 3xxx port (never 3000) unless PORT is pre-set.
PORT="${PORT:-$(node "$ROOT_DIR/scripts/find-open-port.js")}"
export PORT

# Clean stale Next.js locks
rm -rf .next/dev/lock 2>/dev/null || true

echo "Starting Next.js dev server on http://localhost:${PORT}"
exec npx next dev --turbopack --port "$PORT" "$@"
