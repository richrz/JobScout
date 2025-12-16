#!/bin/bash
set -e

echo "🔍 Starting Pre-Audit Check..."

echo "📦 1. Checking Dependencies..."
npm list --depth=0 > /dev/null

echo "🧹 2. Linting..."
npm run lint

echo "🏗️ 3. Building Project..."
npm run build

echo "✅ Pre-Audit Check Passed! ready for review."
