#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-$(node "$ROOT_DIR/scripts/find-open-port.js")}"
export PORT

# Check database connection unless in Mock Mode
if [ "${NEXT_PUBLIC_MOCK_MODE:-false}" != "true" ]; then
    echo "Verifying database connection..."
    npx ts-node -r tsconfig-paths/register scripts/db-check.ts || {
        echo "ERROR: Database connection failed. Production requires a valid database."
        exit 1
    }
fi

echo "Starting Next.js server on http://localhost:${PORT}"
exec next start --port "$PORT" "$@"
