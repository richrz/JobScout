#!/bin/bash
# Clean finish for Autopilot session

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

echo "🏁 Autopilot Session Wrapup"
echo "==========================="
echo ""

if [ -n "$SESSION_FILE" ] && [ -f "$SESSION_FILE" ]; then
  TASK_ID=$(jq -r '.context.taskId // "unknown"' "$SESSION_FILE" 2>/dev/null || echo "unknown")
  echo "Closing session for Task $TASK_ID..."
  rm -f "$SESSION_FILE"
  echo "✅ Session file removed."
else
  echo "No active session found."
fi

echo ""
echo "📋 Current task status:"
npx task-master list --with-subtasks 2>/dev/null | head -30 || echo "(task-master not available)"

echo ""
echo "📂 Git status:"
git status -sb

echo ""
echo "✅ Wrapup complete."
echo ""
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ NEXT: Run ./.tdd/scripts/work-start.sh for next task       │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""
