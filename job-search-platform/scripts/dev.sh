#!/bin/bash
# Kill any process on port 3000 and clean up Next.js lock files before starting

echo "🧹 Cleaning up port 3000 and stale locks..."

# Kill anything on port 3000
fuser -k 3000/tcp 2>/dev/null || true

# Remove Next.js lock file if it exists
rm -rf .next/dev/lock 2>/dev/null || true

# Small delay to ensure port is released
sleep 0.5

echo "✅ Starting Next.js dev server..."
exec next dev --turbopack "$@"
