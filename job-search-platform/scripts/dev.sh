#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Unset NODE_ENV so Next.js can set it to "development" and db-check doesn't
# see NODE_ENV=production (which would cause prisma.ts to require DATABASE_URL
# to be set before .env files are loaded).
unset NODE_ENV

# Unset Next.js private vars that may be inherited from another running Next.js
# app in the shell. __NEXT_PRIVATE_STANDALONE_CONFIG in particular contains the
# serialized config of that other app (including its outputFileTracingRoot) and
# causes loadConfig() to skip next.config.js entirely and return the stale JSON.
unset __NEXT_PRIVATE_STANDALONE_CONFIG __NEXT_PRIVATE_ORIGIN __NEXT_PRIVATE_RENDER_WORKER
unset NEXT_DEPLOYMENT_ID NEXT_OTEL_FETCH_DISABLED

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
exec npx next dev --port "$PORT" --turbopack "$@"
