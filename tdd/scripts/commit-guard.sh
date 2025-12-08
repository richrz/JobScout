#!/usr/bin/env bash
# Commit guardrail: blocks commits during active Autopilot sessions

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
LOG_DIR="$ROOT_DIR/logs"
LOG_FILE="$LOG_DIR/agent-actions.log"

log_action() {
  mkdir -p "$LOG_DIR" 2>/dev/null || true
  printf '%s\t%s\t%s\n' "$(date -Iseconds)" "commit-guard" "$1" >> "$LOG_FILE" 2>/dev/null || true
}

# Check task-master CLI is available
if ! command -v npx &>/dev/null; then
  echo "commit-guard: npx not found; aborting." >&2
  exit 1
fi

# Block if tasks.json is staged without going through task-master
if ! git diff --cached --quiet -- .taskmaster/tasks/tasks.json 2>/dev/null; then
  echo "commit-guard: .taskmaster/tasks/tasks.json staged manually." >&2
  echo "         Use task-master commands to modify tasks." >&2
  exit 1
fi

# Check for active Autopilot session
SESSION_ROOT="$HOME/.taskmaster"
PROJECT_KEY="$(pwd | sed 's#/#-#g')"
SESSION_FILE="$SESSION_ROOT/$PROJECT_KEY/sessions/workflow-state.json"

if [ -f "$SESSION_FILE" ]; then
  TASK_ID=$(jq -r '.context.taskId // "unknown"' "$SESSION_FILE" 2>/dev/null || echo "unknown")
  log_action "blocked_active_autopilot task=$TASK_ID"
  echo "commit-guard: active Autopilot session for Task $TASK_ID" >&2
  echo "         Active session detected." >&2
  echo "         See 'user/1-BUILD.txt' for wrap-up instructions." >&2
  exit 1
fi

# All checks passed, proceed with commit
log_action "commit_allowed"
exec git commit "$@"
