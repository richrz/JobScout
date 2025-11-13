#!/usr/bin/env sh
set -eu

# Prepare the repository for TDD-in-a-Box + Taskmaster
# - Create package.json if missing
# - Optionally install task-master-ai when --install flag is provided
# - Copy docs/PRD-OPEN-SOURCE.md into .taskmaster/docs/prd.md if present
# - Ensure helper scripts are executable
# Usage:
#   ./scripts/prepare-tdd.sh        # run preparation steps (no install)
#   ./scripts/prepare-tdd.sh --install  # also install task-master-ai locally

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

INSTALL=false
if [ "${1-}" = "--install" ]; then
  INSTALL=true
fi

echo "Preparing repository for TDD-in-a-Box..."

# 1) Ensure package.json exists
if [ -f package.json ]; then
  echo "package.json already exists"
else
  echo "Creating package.json (npm init -y)"
  npm init -y >/dev/null 2>&1 || {
    echo "npm init failed; please ensure npm is installed and try again" >&2
    exit 1
  }
fi

if $INSTALL ; then
  echo "Installing task-master-ai as a dev dependency (this may take a minute)"
  npm install --save-dev task-master-ai || {
    echo "npm install failed; check network and npm configuration" >&2
    exit 1
  }
else
  echo "Skipping npm install (run with --install to install task-master-ai locally)"
fi

# 2) Copy PRD into .taskmaster/docs/prd.md if docs/PRD-OPEN-SOURCE.md exists
if [ -d .taskmaster/docs ]; then
  if [ -f docs/PRD-OPEN-SOURCE.md ]; then
    echo "Copying docs/PRD-OPEN-SOURCE.md -> .taskmaster/docs/prd.md"
    cp docs/PRD-OPEN-SOURCE.md .taskmaster/docs/prd.md
  else
    echo "No docs/PRD-OPEN-SOURCE.md found in docs/; skipping PRD copy"
  fi
else
  echo ".taskmaster/docs not found — creating directory"
  mkdir -p .taskmaster/docs
  if [ -f docs/PRD-OPEN-SOURCE.md ]; then
    cp docs/PRD-OPEN-SOURCE.md .taskmaster/docs/prd.md
  fi
fi

# 3) Ensure helper scripts are executable
if [ -d scripts ]; then
  echo "Ensuring scripts/*.sh are executable"
  for f in scripts/*.sh; do
    [ -f "$f" ] || continue
    chmod +x "$f" || true
    echo "  ensured executable: $f"
  done
fi

echo "Preparation complete. Next steps (suggested):"
echo "  1) Run: npx task-master init -y   # initialize Taskmaster if you haven't"
echo "  2) Optionally parse the PRD: npx task-master parse-prd .taskmaster/docs/prd.md --numTasks 20 --tag feature/prd --force"
echo "  3) Use tags per branch: npx task-master add-tag --from-branch; npx task-master use-tag feature/<branch>"
echo "If you want me to run the install and parse steps now, say 'do it'. Otherwise run them locally when ready." 

exit 0
