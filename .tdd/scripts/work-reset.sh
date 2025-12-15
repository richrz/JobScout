#!/bin/bash
# Abort/reset Autopilot session without keeping changes

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# Find session file (try multiple locations)
SESSION_FILE=""

# Try home directory pattern
HOME_SESSION="$HOME/.taskmaster"
PROJECT_KEY="$(pwd | sed 's#/#-#g')"
if [ -f "$HOME_SESSION/$PROJECT_KEY/sessions/workflow-state.json" ]; then
  SESSION_FILE="$HOME_SESSION/$PROJECT_KEY/sessions/workflow-state.json"
fi

# Try local pattern
LOCAL_SESSION="$REPO_ROOT/.taskmaster/sessions/workflow-state.json"
if [ -f "$LOCAL_SESSION" ]; then
  SESSION_FILE="$LOCAL_SESSION"
fi

echo "🔄 Autopilot Session Reset"
echo "=========================="
echo ""

if [ -n "$SESSION_FILE" ] && [ -f "$SESSION_FILE" ]; then
  TASK_ID=$(jq -r '.context.taskId // "unknown"' "$SESSION_FILE" 2>/dev/null || echo "unknown")
  echo "Aborting session for Task $TASK_ID..."
  rm -f "$SESSION_FILE"
  echo "✅ Session file removed."
else
  echo "No active session found."
fi

# Also try to abort via task-master if available
npx task-master autopilot abort 2>/dev/null || true

echo ""
echo "📂 Git status:"
git status -sb

echo ""
echo "✅ Reset complete."
echo ""
echo "If you have uncommitted changes to discard:"
echo "  git restore ."
echo "  git clean -fd   # removes untracked files"
echo ""
echo "Run ./.tdd/scripts/work-start.sh to begin fresh."
