# TDD-in-a-Box User Manual

**Version:** 2.0  
**Last Updated:** December 2024  
**Audience:** Developers, non-developers, and anyone managing AI coding agents

---

## Executive Summary

### What is TDD-in-a-Box?

TDD-in-a-Box is a workflow system that enables anyone to safely manage AI coding agents working on software projects. It enforces strict guardrails that prevent agents from autonomously making changes without your approval, while ensuring all work follows Test-Driven Development (TDD) best practices.

### Why Does This Exist?

AI agents are powerful but unreliable. Without guardrails, they:
- Mark tasks "done" when features don't work
- Create stub code or vague instructions
- Leave repositories in broken states when they crash
- Hallucinate success ("all tests pass!" when they don't)

TDD-in-a-Box solves these problems with:
- **Human-in-the-loop checkpoints** after every task
- **Strict verification format** (no vague "check if it works" allowed)
- **Crash recovery** (single command to clean up)
- **Antagonistic audits** (fresh agent verifies work)

### What You Get

- **Approval gates:** Agents must ask permission before starting work
- **Crash recovery:** Single command to clean up after agent failures
- **Task tracking:** Integration with Task Master ensures all work is tracked
- **Git protection:** Prevents commits during active sessions
- **TDD enforcement:** All code changes follow test-first discipline
- **Strict HITL Tests:** Click/Type/Expect format—no vague instructions allowed

---

## Installation

Copy the `.tdd/` folder into your project's root directory:

```bash
cp -r .tdd /path/to/your-project/
```

Your project structure becomes:
```
your-project/
├── .tdd/           ← The TDD workflow kit
├── .taskmaster/    ← Task Master data (created by npx task-master init)
├── src/            ← Your code
└── package.json
```

---

## File Structure

```
.tdd/
├── user/                    # YOUR control panel (copy-paste these)
│   ├── START-HERE.txt       # Read this first
│   ├── A-SETUP-PROJECT.txt  # Once: project initialization
│   ├── B-SETUP-SESSION.txt  # Each session: claim next task
│   ├── 1-BUILD.txt          # Agent builds
│   ├── 2-AUDIT.txt          # Agent verifies (new chat)
│   └── 3-APPROVE.txt        # YOU verify (no AI)
│
├── agent/                   # Agent instructions (don't touch)
│   ├── AGENTS.md            # Operating agreement
│   ├── auditor.md           # Audit protocol
│   ├── manual.md            # This document
│   └── templates/
│       └── HITL-STANDARD.md # Strict verification format
│
├── output/                  # Generated artifacts
│   ├── audits/              # Audit reports
│   └── hitl-verify/         # Your verification checklists
│
├── scripts/                 # Helper scripts
│   ├── work-start.sh        # Begin work
│   ├── work-wrapup.sh       # End session
│   ├── work-reset.sh        # Abort session
│   ├── recovery.sh          # Crash recovery
│   ├── preflight.sh         # Health check
│   └── commit-guard.sh      # Block commits during sessions
│
└── guides/                  # Reference docs
```

---

## Workflows

### A. Project Setup (Once per project)

Copy `.tdd/user/A-SETUP-PROJECT.txt` to a new AI chat.

Agent will:
1. Install task-master-ai
2. Create or migrate your PRD
3. Generate tasks from PRD
4. Create HITL verification tests (strict format)

### B. Session Setup (Start of each coding session)

Copy `.tdd/user/B-SETUP-SESSION.txt` to a new AI chat.

Agent will:
1. Read `.tdd/agent/AGENTS.md`
2. Run preflight checks
3. Identify next pending task
4. Ask for your approval

### The Core Loop (Repeat for Each Task)

```
┌─────────────────────────────────────────────────────────────┐
│  1-BUILD  →  2-AUDIT  →  3-APPROVE  →  (next task)         │
│   Agent      Agent        YOU                               │
│   codes      verifies     verify & mark done                │
└─────────────────────────────────────────────────────────────┘
```

| Step | File | Who | Description |
|------|------|-----|-------------|
| Build | `.tdd/user/1-BUILD.txt` | Agent | Codes using TDD (RED → GREEN → COMMIT) |
| Audit | `.tdd/user/2-AUDIT.txt` | **New** Agent | Verifies in fresh session |
| Approve | `.tdd/user/3-APPROVE.txt` | **YOU** | Run HITL test yourself |

---

## State Machine

```
┌─────────┐
│  IDLE   │  No active session, repo clean
└────┬────┘
     │ .tdd/scripts/work-start.sh
     ↓
┌─────────┐
│ CLAIMED │  Task marked in-progress, session created
└────┬────┘
     │ User approves → agent runs autopilot
     ↓
┌─────────┐
│ WORKING │  Autopilot driving TDD cycle (Red/Green/Commit)
└────┬────┘
     │ All subtasks complete → Agent generates HITL test
     ↓
┌─────────┐
│ REVIEW  │  Task marked for review
└────┬────┘
     │ User invokes "Audit Task X" (new chat)
     ↓
┌─────────┐
│ AUDITING│  Agent verifies work + HITL test quality
└────┬────┘
     │ Pass → Human Verification
     ↓
┌─────────┐
│ VERIFY  │  You run ".tdd/output/hitl-verify/task-X.txt"
└────┬────┘
     │ Pass → Run "set-status done" command
     ↓
┌─────────┐
│ CLOSED  │  Task marked done
└─────────┘

     CRASH? → Run .tdd/scripts/recovery.sh
```

---

## Session Management

Task Master may store session state in different locations:

1. **Local repo** (newer versions): `.taskmaster/sessions/workflow-state.json`
2. **Home directory** (older versions): `~/.taskmaster/<project>/sessions/workflow-state.json`

The scripts check both locations automatically.

---

## Script Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `.tdd/scripts/work-start.sh` | Begin new work | Start of each task |
| `.tdd/scripts/work-wrapup.sh` | Clean finish | After task complete |
| `.tdd/scripts/work-reset.sh` | Abort session | Cancel current work |
| `.tdd/scripts/recovery.sh` | Crash recovery | After agent crashes |
| `.tdd/scripts/preflight.sh` | Health check | Before starting work |
| `.tdd/scripts/commit-guard.sh` | Protected commit | Instead of `git commit` |

---

## Recovery

### When Agents Crash

```bash
./.tdd/scripts/recovery.sh
```

The script will:
1. Check for stale session files
2. Run tests to validate partial work
3. Ask: Keep or discard?
4. Clean up appropriately

### Common Issues

| Issue | Fix |
|-------|-----|
| "WORKING TREE DIRTY" | `git stash -u` or commit changes |
| "STALE SESSION" | `./.tdd/scripts/work-reset.sh` |
| Wrong task claimed | `npx task-master autopilot abort`, then re-run |
| Task status mismatch | `npx task-master set-status --id=X --status=<correct>` |

---

## The Golden Rule

> **Only YOU can mark a task "done."**
> 
> Agents can mark them "review" or "audited" — but the final approval is always human.

---

## HITL Test Standard

All verification tests must use the **Click/Type/Expect** format:

```
CHECK 1: Login works
BROWSER:
  1. Go to: http://localhost:3000/login
  2. Type: "test@example.com" into "Email" field
  3. Type: "password123" into "Password" field  
  4. Click: "Sign In" button

EXPECTED:
  You should see: "Welcome back!" message
```

**Banned phrases:**
- "Verify it works"
- "Check functionality"
- "Ensure correct behavior"

See `.tdd/agent/templates/HITL-STANDARD.md` for full specification.

---

**End of TDD-in-a-Box User Manual**