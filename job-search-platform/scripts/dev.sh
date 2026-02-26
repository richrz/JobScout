#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Pick a random available 3xxx port (never 3000) unless PORT is pre-set.
PORT="${PORT:-$(node "$ROOT_DIR/scripts/find-open-port.js")}"
export PORT


# Clean stale Next.js locks
rm -rf .next/dev/lock 2>/dev/null || true

# Ensure DB container is running unless in Mock Mode
if [ "${NEXT_PUBLIC_MOCK_MODE:-false}" != "true" ]; then
    echo "--- Database Startup ---"
    # Auto-start the postgres container (idempotent — safe to run if already up)
    docker compose up -d db 2>/dev/null && echo "✔ DB container started/confirmed" || echo "⚠ docker compose unavailable, assuming DB is external"

    echo "Verifying database connection..."
    npx tsx scripts/db-check.ts || {
        echo "ERROR: Database connection failed. Start with NEXT_PUBLIC_MOCK_MODE=true to skip."
        exit 1
    }
fi

echo "Starting Next.js dev server on http://localhost:${PORT}"
exec npx next dev --turbopack --port "$PORT" "$@"
