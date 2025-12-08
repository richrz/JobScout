#!/usr/bin/env bash
set -euo pipefail

echo "=== TDD Drift Check (setup + health) ==="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

fail() { echo "❌ $1" >&2; exit 1; }
warn() { echo "⚠  $1"; }
ok()   { echo "✅ $1"; }

echo "Repo: $ROOT_DIR"

# 1) Git presence and cleanliness
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  fail "Not a git repo. Run: git init (or use a repo copy)."
fi
GIT_STATUS=$(git status -sb || true)
if [[ -z "$GIT_STATUS" ]]; then
  warn "git status returned nothing; investigate."
elif echo "$GIT_STATUS" | grep -q '^[?MADU]'; then
  warn "Working tree is dirty. Run 'git status -sb' then commit or stash before Autopilot."
else
  ok "Git clean."
fi

# 2) Node + npm
if ! command -v node >/dev/null 2>&1; then
  fail "Node.js not found. Install Node.js, then re-run."
fi
if ! command -v npm >/dev/null 2>&1; then
  fail "npm not found. Install npm, then re-run."
fi
ok "Node/npm present (node $(node -v))."

# 3) Task-master presence and init
if ! npx task-master --version >/dev/null 2>&1; then
  warn "Task-master not installed here."
  warn "Install: npm install --save-dev task-master-ai"
  warn "Init:    npx task-master init"
else
  ok "Task-master CLI available."
  if [[ ! -d "$ROOT_DIR/.taskmaster" ]]; then
    warn "Task-master not initialized. Run: npx task-master init"
  else
    if npx task-master list --with-subtasks >/dev/null 2>&1; then
      ok "Task-master task tree readable."
    else
      warn "Task-master list failed. Try: npx task-master init (or fix config)."
    fi
  fi
fi

# 4) Scripts executable
if chmod -R u+rx "$SCRIPT_DIR" >/dev/null 2>&1; then
  ok "Scripts marked executable."
else
  warn "Could not adjust script permissions; check filesystem perms."
fi

# 5) Required directories (reports, etc.)
AUDITS_DIR="$ROOT_DIR/docs/audits"
if mkdir -p "$AUDITS_DIR" 2>/dev/null; then
  ok "Ensured audit folder exists: $AUDITS_DIR"
else
  warn "Could not create $AUDITS_DIR (read-only?). Create manually if you plan to audit."
fi

# 6) Stale Autopilot sessions
STALE=$(ls ~/.taskmaster/*/sessions/workflow-state.json 2>/dev/null || true)
if [[ -n "$STALE" ]]; then
  warn "Stale Autopilot session files detected:"
  echo "$STALE"
  warn "Refer to 'user/1-BUILD.txt' for reset instructions."
else
  ok "No stale Autopilot sessions found."
fi

echo "=== Drift Check Complete ==="
