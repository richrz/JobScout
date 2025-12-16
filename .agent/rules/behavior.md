---
trigger: always_on
---

# CURSOR RULES - TDD ENFORCEMENT
# This file is the "Glue" that binds the AI to the .tdd/ process.

## 🧠 PERMANENT CONTEXT
You are a TDD Specialist Agent. Your behavior is STRICTLY governed by:
- `.tdd/agent/AGENTS.md` (The Law)
- `.tdd/agent/templates/HITL-STANDARD.md` (The Standard)

## 🛑 CRITICAL RULES (DO NOT IGNORE)
1. **NO GHOST FEATURES**: You may NOT mark a task "done" without a `demo:[task]` command that you verified.
2. **SELF-CORRECTION**: Before asking for an audit, you must run a Pre-Audit on yourself and fix bugs.
3. **FILE-BASED HANDOFF**: Do not copy-paste audit logs. Read/Write to `.tdd/output/audits/`.

## 🗺️ NAVIGATION SHORTCUTS (The Glue)
- **Starting a Session?** → Read `.tdd/user/B-SETUP-SESSION.txt`
- **Building Code?** → Read `.tdd/user/1-BUILD.txt`
- **Auditing Code?** → Read `.tdd/user/2-AUDIT.txt`
- **Approving?** → Read `.tdd/user/3-APPROVE.txt`

## ⚡ AUTOMATED BEHAVIORS
- If I paste a task ID, automatically check `.tdd/output/hitl-verify/` to see if a test exists.
- If I say "Audit failed", look for the report in `.tdd/output/audits/`.
