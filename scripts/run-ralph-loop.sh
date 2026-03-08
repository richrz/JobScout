#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: scripts/run-ralph-loop.sh <slug>"
  exit 1
fi

slug="$1"
date_stamp="$(date +%Y-%m-%d)"
time_stamp="$(date +%H%M%S)"
loop_id="${date_stamp}-${time_stamp}-${slug}"
base_dir="docs/loops/${date_stamp}/${loop_id}"

mkdir -p "${base_dir}/artifacts"

cp docs/templates/micro-contract.md "${base_dir}/micro-contract.md"
cp docs/templates/verification-report.md "${base_dir}/verification-report.md"

cat > "${base_dir}/README.md" <<EOF
# Ralph Loop ${loop_id}

## Purpose

This folder captures one deterministic implementation loop.

## Files

- micro-contract.md — the scoped contract the coder must follow
- verification-report.md — the orchestrator's proof-based verdict
- artifacts/ — logs, screenshots, and proof outputs

## Suggested Flow

1. Fill in micro-contract.md.
2. Run a failing check first when practical.
3. Let the coder make the smallest patch possible.
4. Save test output and screenshots in artifacts/. 
5. Fill in verification-report.md.
6. Record only a proof-based verdict.
EOF

touch "${base_dir}/artifacts/.gitkeep"

printf 'Created Ralph loop: %s\n' "${base_dir}"
printf 'Contract: %s\n' "${base_dir}/micro-contract.md"
printf 'Verification: %s\n' "${base_dir}/verification-report.md"
