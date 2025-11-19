# TDD-in-a-Box User Manual

**Version:** 1.0  
**Last Updated:** November 2024  
**Audience:** Project managers, non-developers, and anyone managing AI coding agents

---

## Executive Summary

### What is TDD-in-a-Box?

TDD-in-a-Box is a workflow system that enables non-developers to safely manage AI coding agents working on software projects. It enforces strict guardrails that prevent agents from autonomously making changes without your approval, while ensuring all work follows Test-Driven Development (TDD) best practices.

### Why Does This Exist?

AI agents are powerful but can be unpredictable. Without guardrails, they may:
- Start working on the wrong task
- Make changes without approval
- Leave repositories in broken states when they crash
- Create conflicting changes when multiple agents work simultaneously

TDD-in-a-Box solves these problems by requiring explicit approval before any work begins and providing deterministic recovery when things go wrong.

### What You Get

- **Approval gates:** Agents must ask permission before starting work
- **Crash recovery:** Single command to clean up after agent failures
- **Task tracking:** Integration with Task Master ensures all work is tracked
- **Git protection:** Prevents commits during active sessions
- **TDD enforcement:** All code changes follow test-first discipline

---

## Quick Start

If you're impatient and want to see it work:

1. **Install prerequisites:**
   ```bash
   npm install -g task-master-ai
   ```

2. **Start a new agent session** (point agent to `AGENTS.md` only)

3. **Agent will report:** "I've been assigned Task X. Shall I proceed?"

4. **You say:** "yes" or "no"

5. **If crash occurs, run:**
   ```bash
   ./tdd-in-a-box/scripts/recovery-helper.sh
   ```

That's it. The rest of this manual explains the details.

---

## System Architecture

### Components

TDD-in-a-Box consists of five main components that work together:

1. **Task Master (TM)** - Task tracking system
   - Stores tasks in `.taskmaster/tasks/tasks.json`
   - Tracks status: `pending`, `in-progress`, `done`
   - Provides CLI: `npx task-master list`, `npx task-master update`, etc.

2. **Autopilot (AP)** - TDD workflow driver
   - Manages RED → GREEN → COMMIT cycle
   - Runs tests automatically
   - Guides agents through implementation
   - Integrates with Task Master for status updates

3. **Session Management** - Prevents conflicts
   - Session lock: `~/.taskmaster/<project>/sessions/current-task.json`
   - Records which task/subtask is active
   - Blocks new work if session exists
   - Cleared by wrapup or reset scripts

4. **Git Guardrails** - Commit protection
   - `tdd-in-a-box/scripts/tm-commit.sh` - refuses commits during active sessions
   - Ensures task status syncs with git history
   - Prevents out-of-sync states

5. **Entry Protocol** - Agent approval gate
   - Defined in `AGENTS.md`
   - Forces agent to claim task and wait for approval
   - Prevents autonomous work

### State Machine

```
┌─────────┐
│  IDLE   │  No active session, repo clean
└────┬────┘
     │ start-agent-work.sh
     ↓
┌─────────┐
│ CLAIMED │  Task marked in-progress, session lock created
└────┬────┘
     │ User approves → agent runs autopilot command
     ↓
┌─────────┐
│ WORKING │  Autopilot driving TDD cycle
└────┬────┘
     │ autopilot completes
     ↓
┌─────────┐
│  DONE   │  wrapup clears session, ready to commit
└─────────┘

     CRASH? → Run recovery-helper.sh
        ├─ Tests pass? → Keep work (wrapup) or discard (reset)
        └─ Tests fail? → Auto-discard (reset)
```

### File Locations

```
repo-root/
├── .taskmaster/
│   └── tasks/
│       └── tasks.json          # Task definitions
├── tdd-in-a-box/
│   ├── scripts/
│   │   ├── start-agent-work.sh      # Entry point
│   │   ├── autopilot-wrapup.sh      # Clean finish
│   │   ├── autopilot-reset.sh       # Abort/crash cleanup
│   │   ├── recovery-helper.sh       # Automated crash recovery
│   │   └── agent-check-in.sh        # Helper for new agents
│   ├── docs/
│   │   └── guides/
│   │       ├── autopilot-agent-runbook.md
│   │       └── autopilot-tdd-playbook.md
│   └── TDD-Manual.md           # This document
├── tools/
│   └── tm-commit.sh            # Guarded git commit
└── AGENTS.md                   # Agent operating instructions

~/.taskmaster/<project>/sessions/
└── current-task.json           # Active session lock (external to repo)
```

---

## Installation Guide

### Prerequisites

Before installing TDD-in-a-Box, ensure you have:

1. **Node.js and npm** (version 16 or higher)
   ```bash
   node --version  # Should show v16.x or higher
   npm --version
   ```

2. **Git** (initialized repository)
   ```bash
   git --version
   git status  # Should not error
   ```

3. **Task Master CLI** (installed globally)
   ```bash
   npm install -g task-master-ai
   npx task-master --version  # Should show version number
   ```

### Step-by-Step Installation

#### 1. Copy TDD-in-a-Box to Your Repository

From an existing repo with TDD-in-a-Box:

```bash
# Copy the tdd-in-a-box directory
cp -r /path/to/source/repo/tdd-in-a-box /path/to/your/repo/

# Copy tm-commit helper into tdd-in-a-box bundle
cp /path/to/source/repo/tdd-in-a-box/scripts/tm-commit.sh /path/to/your/repo/tdd-in-a-box/scripts/

# Copy or merge AGENTS.md
cp /path/to/source/repo/AGENTS.md /path/to/your/repo/
```

#### 2. Make Scripts Executable

```bash
cd /path/to/your/repo
chmod +x tdd-in-a-box/scripts/*.sh
chmod +x tdd-in-a-box/scripts/tm-commit.sh
```

#### 3. Initialize Task Master

```bash
# Initialize Task Master in your repo
npx task-master init

# Verify .taskmaster directory was created
ls -la .taskmaster/tasks/tasks.json
```

#### 4. Create Initial Tasks

Edit `.taskmaster/tasks/tasks.json` or use Task Master commands:

```bash
# Example: Add a task
npx task-master add "Setup project structure" --status pending
npx task-master list
```

#### 5. Verify Installation

Run the verification test:

```bash
# This should claim the first pending task
./tdd-in-a-box/scripts/start-agent-work.sh

# Check that session was created
ls -la ~/.taskmaster/$(basename $(pwd))/sessions/current-task.json

# Clean up the test
./tdd-in-a-box/scripts/autopilot-reset.sh

# Verify session was cleared
ls ~/.taskmaster/$(basename $(pwd))/sessions/
```

Expected output:
- `start-agent-work.sh` prints task info and autopilot command
- Session file exists after start
- Session file removed after reset
- Task status reverted to pending

#### 6. Configure Your Repository

Update `package.json` to ensure test script exists:

```json
{
  "scripts": {
    "test": "your-test-command-here"
  }
}
```

If no tests exist yet, use a placeholder:

```json
{
  "scripts": {
    "test": "echo 'No tests yet' && exit 0"
  }
}
```

### Troubleshooting Installation

**Problem:** `npx task-master` not found  
**Solution:** Install globally: `npm install -g task-master-ai`

**Problem:** Scripts show "Permission denied"  
**Solution:** Make executable: `chmod +x tdd-in-a-box/scripts/*.sh`

**Problem:** `start-agent-work.sh` fails with "Not a git repository"  
**Solution:** Run from repository root: `cd /path/to/repo`

**Problem:** Session directory doesn't exist  
**Solution:** It's created automatically on first run. If issues persist:
```bash
mkdir -p ~/.taskmaster/$(basename $(pwd))/sessions
```

---

## Daily Workflow (Normal Usage)

### Your Role as a Non-Developer

You don't write code. Your job is simple:
1. Start an AI agent session
2. Point the agent to `AGENTS.md`
3. Say "yes" or "no" when the agent asks for approval
4. Verify the work when complete
5. Approve the commit

That's it. The system handles everything else.

### Complete Agent Session Walkthrough

#### Step 1: Start a New Agent

Open a new agent session (e.g., Claude, GPT, or another AI assistant) with **no prior context** about your project.

#### Step 2: Point Agent to AGENTS.md

Your first message to the agent:

```
Please read /AGENTS.md in this repository and follow the instructions.
```

#### Step 3: Agent Reports Task Assignment

The agent will:
1. Read `AGENTS.md`
2. See the "NEW AGENT ENTRY PROTOCOL"
3. Run `./tdd-in-a-box/scripts/start-agent-work.sh`
4. Report back to you with:

```
I've been assigned Task 9: Implement atomic worktree management

This task will add safe parallel execution with git worktrees.

Shall I proceed with this task?
```

#### Step 4: You Approve or Reject

**If the task looks correct:**
```
Yes, proceed.
```

The agent will then run the autopilot command and begin work.

**If the task is wrong or you want a different task:**
```
No, reset and wait for instructions.
```

The agent will run `./tdd-in-a-box/scripts/autopilot-reset.sh` and wait for you to assign a different task.

#### Step 5: Agent Works Through TDD Cycle

The agent follows the Autopilot TDD workflow:
1. **RED** - Write failing test first
2. **GREEN** - Implement minimal code to pass
3. **COMMIT** - Autopilot commits the working code

You don't need to do anything during this phase. The agent will report progress as it goes.

#### Step 6: Agent Completes Work

When Autopilot finishes, the agent will report:

```
✅ Task complete. Autopilot has finished the TDD cycle.
Running wrapup...
```

#### Step 7: Verify the Work

Check the changes:

```bash
git log -1          # See the latest commit
git diff HEAD~1     # Review the changes
npm test            # Verify tests pass
```

#### Step 8: Finalize (If Satisfied)

If the work looks good:

```bash
# Task Master status is already updated
# Git commit was already made by Autopilot
# Session lock is already cleared by wrapup

# Optionally push to remote
git push origin your-branch
```

If you want changes:
```
Agent, please modify X in the implementation.
```

The agent can make adjustments, but remind them to use the TM+Autopilot workflow if starting fresh work.

### Success Indicators

✅ **Good Session:**
- Agent asks for approval before starting
- Reports task clearly
- Works through TDD cycle without errors
- Completes and cleans up session
- All tests pass
- Git history is clean

❌ **Problem Session:**
- Agent starts work without asking
- Claims wrong task
- Crashes mid-work
- Leaves session lock behind
- Tests fail after completion

If you see problem indicators, see **Recovery & Edge Cases** section.

---

## Recovery & Edge Cases

### When Agents Crash

AI agents can crash or disconnect for many reasons:
- IDE crashes
- Network issues
- Agent reaches token limit
- Rate limiting
- User closes session accidentally

When this happens, the repository is left in an inconsistent state with an active session lock.

### Automated Crash Recovery

**Single Command Solution:**

```bash
./tdd-in-a-box/scripts/recovery-helper.sh
```

This script makes the recovery decision for you based on objective criteria:

#### What It Does:

1. **Checks for session lock** - If none exists, reports repo is clean
2. **Shows crashed task info** - Which task was in progress
3. **Runs tests** - Validates partial work
4. **Makes decision:**
   - **Tests PASS** → Asks if you want to keep work
   - **Tests FAIL** → Automatically discards work

#### Example: Tests Pass Scenario

```bash
$ ./tdd-in-a-box/scripts/recovery-helper.sh

🔍 TDD-in-a-Box Crash Recovery
════════════════════════════════════════════════════════

⚠️  Found crashed session:
   Task: 9.1 (subtask)

Analyzing partial work...
────────────────────────────────────────────────────────

📂 Git Status:
## main
 M src/execution/ExecutionManager.ts
 M src/execution/__tests__/ExecutionManager.test.ts

🧪 Running tests to validate partial work...

✅ Tests PASSED

The partial work appears valid. Changed files:

 src/execution/ExecutionManager.ts            | 45 ++++++++++++++++--
 src/execution/__tests__/ExecutionManager.test.ts | 32 +++++++++++++
 2 files changed, 77 insertions(+)

────────────────────────────────────────────────────────
DECISION: Tests pass. You can keep or discard this work.

Keep this work and mark task complete? (y/n):
```

**If you type `y`:**
- Runs `autopilot-wrapup.sh` to clear session
- Keeps the code changes
- You then commit manually

**If you type `n`:**
- Runs `git restore .` to discard changes
- Runs `autopilot-reset.sh` to clear session
- Repo returns to clean state

#### Example: Tests Fail Scenario

```bash
$ ./tdd-in-a-box/scripts/recovery-helper.sh

🔍 TDD-in-a-Box Crash Recovery
════════════════════════════════════════════════════════

⚠️  Found crashed session:
   Task: 9.1 (subtask)

🧪 Running tests to validate partial work...

❌ Tests FAILED

Test output:
  FAIL src/execution/__tests__/ExecutionManager.test.ts
    ● ExecutionManager › should handle concurrent requests
      Expected: 2
      Received: undefined

────────────────────────────────────────────────────────
DECISION: Tests failed. Discarding partial work automatically.

Press Enter to discard and reset...

✅ Recovery complete. Repository reset to clean state.
   Run ./tdd-in-a-box/scripts/start-agent-work.sh to begin new work.
```

Work is automatically discarded. No decision needed from you.

### Manual Recovery (Alternative)

If you prefer manual control:

#### Option 1: Keep Partial Work

```bash
# Review changes
git status
git diff

# If good, clear session and commit
./tdd-in-a-box/scripts/autopilot-wrapup.sh
git add -A
tdd-in-a-box/scripts/tm-commit.sh -m "Complete task 9.1"
```

#### Option 2: Discard Partial Work

```bash
# Discard all changes
git restore .
# or
git reset --hard HEAD

# Clear session
./tdd-in-a-box/scripts/autopilot-reset.sh
```

### Session Conflicts

**Symptom:** New agent reports "Active session detected"

**Cause:** Previous session didn't clean up (crash or forgotten wrapup)

**Solution:** Run recovery:
```bash
./tdd-in-a-box/scripts/recovery-helper.sh
```

### Multiple Agents Attempting Work

**Symptom:** Second agent tries to start work while first agent is working

**What Happens:** `start-agent-work.sh` refuses and shows which task is active

**Solution:** 
- Let the first agent finish
- Or abort the first agent's session with recovery-helper
- Then start the second agent

**Prevention:** Only run one agent at a time (current design is single-agent)

### Agent Completed But Forgot Wrapup

**Symptom:** Agent finished work but didn't run `autopilot-wrapup.sh`

**Solution:**
```bash
# Manually run wrapup
./tdd-in-a-box/scripts/autopilot-wrapup.sh

# Verify session cleared
ls ~/.taskmaster/$(basename $(pwd))/sessions/
```

### Task Status Out of Sync

**Symptom:** Task Master shows wrong status compared to actual work done

**Solution:** Manually update Task Master:
```bash
# List tasks to see current status
npx task-master list --with-subtasks

# Update specific task
npx task-master update <task-id> --status done

# Or use interactive mode
npx task-master update <task-id>
```

---

## Script Reference

### start-agent-work.sh

**Location:** `tdd-in-a-box/scripts/start-agent-work.sh`

**Purpose:** Entry point for all agent work. Claims a task from Task Master and prepares the session.

**When to Use:**
- Beginning any new coding work
- Agent's first action after reading AGENTS.md

**What It Does:**
1. Checks for existing session lock (refuses if found)
2. Verifies git tree is clean
3. Queries Task Master for next pending task/subtask
4. Marks task as `in-progress` in Task Master
5. Creates session lock file (`~/.taskmaster/<project>/sessions/current-task.json`)
6. Prints task information
7. Prints exact autopilot command to run next

**Usage:**
```bash
./tdd-in-a-box/scripts/start-agent-work.sh
```

**Example Output:**
```
🚀 Starting Agent Work Session
════════════════════════════════════════════════════════

✅ No active session found. Ready to claim new work.
✅ Git tree is clean. Proceeding...

📋 Task Assignment:
────────────────────────────────────────────────────────
Task ID: 9.1
Type: subtask
Title: Add ExecutionManager.merge() method
Status: in-progress (just claimed)

📝 Session Marker Created:
   ~/.taskmaster/DroidForge/sessions/current-task.json

🎯 Next Step for Agent:
────────────────────────────────────────────────────────
Run this EXACT command to begin Autopilot TDD workflow:

  npx task-master autopilot start --task 9.1

⏸️  STOP: Report this task to user and wait for approval!
```

**Errors:**
- "Active agent session detected" → Use recovery-helper.sh
- "Git tree is dirty" → Commit or stash changes first
- "No pending tasks found" → Add tasks to Task Master

---

### autopilot-wrapup.sh

**Location:** `tdd-in-a-box/scripts/autopilot-wrapup.sh`

**Purpose:** Clean session termination after successful work completion.

**When to Use:**
- After Autopilot completes successfully
- After manual work completion
- When keeping crashed session's work

**What It Does:**
1. Displays Autopilot final status
2. Removes session lock file
3. Reminds you to verify Task Master status
4. Cleans up temporary files

**Usage:**
```bash
./tdd-in-a-box/scripts/autopilot-wrapup.sh
```

**Example Output:**
```
📊 Autopilot Session Status
════════════════════════════════════════════════════════

Current Execution: exec-abc123
Status: completed
Completed Nodes: 9.1, 9.2

🧹 Cleaning Up Session
────────────────────────────────────────────────────────
✅ Session marker cleared
✅ Temporary files cleaned

⚠️  Reminder: Verify Task Master status before starting new work
   Run: npx task-master list --with-subtasks
```

**Errors:**
- "No session to wrap up" → Already clean, continue normally

---

### autopilot-reset.sh

**Location:** `tdd-in-a-box/scripts/autopilot-reset.sh`

**Purpose:** Abort current session and reset to clean state.

**When to Use:**
- User rejected the assigned task
- Need to start over on a different task
- Discarding crashed session's work
- Aborting stuck Autopilot workflow

**What It Does:**
1. Reads current session info
2. Logs abort reason to preserved sessions
3. Removes session lock file
4. **Note:** Does NOT discard git changes (you must do that separately)

**Usage:**
```bash
# Reset session only (keeps code changes)
./tdd-in-a-box/scripts/autopilot-reset.sh

# Reset session AND discard code changes
git restore . && ./tdd-in-a-box/scripts/autopilot-reset.sh
```

**Example Output:**
```
🔄 Resetting Autopilot Session
════════════════════════════════════════════════════════

📋 Aborting Task: 9.1 (subtask)
📝 Session data preserved in: ~/.taskmaster/DroidForge/sessions/aborted/

✅ Session reset complete
✅ Ready for new work

Next: Run ./tdd-in-a-box/scripts/start-agent-work.sh
```

**Errors:**
- "No active session" → Already clean, continue normally

---

### recovery-helper.sh

**Location:** `tdd-in-a-box/scripts/recovery-helper.sh`

**Purpose:** Automated crash recovery with intelligent decision-making.

**When to Use:**
- Agent crashed or disconnected mid-work
- IDE closed unexpectedly
- Session conflicts arise
- Anytime you're unsure about partial work

**What It Does:**
1. Detects crashed sessions
2. Runs `npm test` to validate partial work
3. Makes keep/discard decision based on test results
4. Provides interactive prompts when tests pass
5. Auto-discards when tests fail
6. Cleans up session state

**Usage:**
```bash
./tdd-in-a-box/scripts/recovery-helper.sh
```

**Decision Logic:**
```
Tests PASS + user says "keep"   → Keep work, run wrapup
Tests PASS + user says "discard" → Discard work, run reset
Tests FAIL                       → Auto-discard, run reset
No session found                 → Report clean state
```

**See:** Recovery & Edge Cases section for detailed examples

---

### agent-check-in.sh

**Location:** `tdd-in-a-box/scripts/agent-check-in.sh`

**Purpose:** Helper script for agents to easily follow entry protocol.

**When to Use:**
- Optional alternative to manually running start-agent-work.sh
- Makes it easier for agents to format their approval request

**What It Does:**
1. Runs `start-agent-work.sh` automatically
2. Extracts task information
3. Prints formatted message template for agent to copy
4. Shows next steps clearly

**Usage:**
```bash
./tdd-in-a-box/scripts/agent-check-in.sh
```

**Example Output:**
```
🤖 NEW AGENT CHECK-IN
====================

Running start-agent-work.sh to get task assignment...
[output from start-agent-work.sh]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 REPORT THIS TO THE USER (copy the text below):

───────────────────────────────────────────────────────
I've been assigned Task 9.1

Task details are shown above. This task has been marked
as 'in-progress' in Task Master.

Shall I proceed with this task?
───────────────────────────────────────────────────────

⏸️  WAITING FOR USER APPROVAL

If user says YES, run this command:
  npx task-master autopilot start --task 9.1

If user says NO, run this command to reset:
  ./tdd-in-a-box/scripts/autopilot-reset.sh
```

---

### tm-commit.sh

**Location:** `tdd-in-a-box/scripts/tm-commit.sh`

**Purpose:** Guarded git commit that enforces workflow rules.

**When to Use:**
- Committing completed work
- Alternative to `git commit` with safety checks

**What It Does:**
1. Checks if Task Master CLI is available
2. Verifies no active session lock exists
3. Prevents committing during active agent work
4. Runs `git commit` if all checks pass

**Usage:**
```bash
# Stage changes first
git add -A

# Commit with guarded helper
tdd-in-a-box/scripts/tm-commit.sh -m "Your commit message"
```

**Why Use This:**
- Prevents committing while agent is still working
- Ensures session is properly closed first
- Catches common workflow violations

**Errors:**
- "Active session detected" → Run wrapup or reset first
- "Task Master not available" → Install task-master-ai globally

---

## Common Gotchas & Solutions

### 1. Dirty Git Tree Blocks Start

**Symptom:**
```
❌ Git tree is dirty. Commit or stash changes before starting new work.
```

**Cause:** Uncommitted changes exist in repository

**Fix:**
```bash
# Check what's changed
git status

# Option A: Commit the changes
git add -A
git commit -m "Your message"

# Option B: Stash the changes
git stash

# Then try again
./tdd-in-a-box/scripts/start-agent-work.sh
```

**Prevention:** Always clean up previous work before starting new work

---

### 2. Stale Session Lock

**Symptom:**
```
⚠️  Active agent session detected for Task 9.1
Cannot start new work until session is resolved.
```

**Cause:** Previous session crashed without cleanup

**Fix:**
```bash
./tdd-in-a-box/scripts/recovery-helper.sh
```

**Prevention:** Always run wrapup or reset scripts when ending agent sessions

---

### 3. Task Master CLI Not Found

**Symptom:**
```
task-master: command not found
```

**Cause:** Task Master not installed globally

**Fix:**
```bash
npm install -g task-master-ai
npx task-master --version  # Verify installation
```

**Prevention:** Include in prerequisites checklist

---

### 4. Scripts Not Executable

**Symptom:**
```
bash: ./tdd-in-a-box/scripts/start-agent-work.sh: Permission denied
```

**Cause:** Scripts don't have execute permissions

**Fix:**
```bash
chmod +x tdd-in-a-box/scripts/*.sh
chmod +x tdd-in-a-box/scripts/tm-commit.sh
```

**Prevention:** Run chmod during installation

---

### 5. Wrong Working Directory

**Symptom:**
```
fatal: not a git repository
```

**Cause:** Running scripts from wrong directory

**Fix:**
```bash
# Navigate to repository root
cd /path/to/your/repo

# Then run scripts
./tdd-in-a-box/scripts/start-agent-work.sh
```

**Prevention:** Always run from repo root

---

### 6. Agent Skips Approval Protocol

**Symptom:** Agent starts coding without asking permission

**Cause:** Agent didn't read AGENTS.md or ignored instructions

**Fix:**
```bash
# Immediately stop the agent
# Run recovery
./tdd-in-a-box/scripts/recovery-helper.sh

# Start fresh agent and be explicit:
"Stop. Read /AGENTS.md and follow the NEW AGENT ENTRY PROTOCOL exactly."
```

**Prevention:** 
- Start agents with minimal context
- First message should only point to AGENTS.md
- Don't provide additional context until after approval

---

### 7. Tests Don't Exist

**Symptom:** recovery-helper.sh fails because `npm test` errors

**Cause:** No test script defined in package.json

**Fix:**
```bash
# Add placeholder test to package.json
{
  "scripts": {
    "test": "echo 'Tests not implemented yet' && exit 0"
  }
}
```

**Prevention:** Set up test infrastructure early in project

---

### 8. Multiple Agents Running

**Symptom:** Second agent claims task while first is working

**Cause:** Attempting to run multiple agents simultaneously

**Fix:**
```bash
# Abort the second agent immediately
# Check active session
cat ~/.taskmaster/$(basename $(pwd))/sessions/current-task.json

# Let first agent finish, then start second
```

**Prevention:** Current system is single-agent only. Run one at a time.

---

### 9. Task Status Mismatch

**Symptom:** Task Master shows `in-progress` but no session exists

**Cause:** Script failure or manual status change

**Fix:**
```bash
# Check session
ls ~/.taskmaster/$(basename $(pwd))/sessions/

# If no session exists, manually reset task status
npx task-master update <task-id> --status pending
```

**Prevention:** Always use provided scripts; don't manually edit task status

---

### 10. Autopilot Command Typo

**Symptom:** Agent reports "Invalid task ID" or autopilot errors

**Cause:** Agent manually typed the command instead of copying

**Fix:**
```bash
# Reset and start over
./tdd-in-a-box/scripts/autopilot-reset.sh

# Tell agent: "Run start-agent-work.sh again and copy the exact command"
```

**Prevention:** Emphasize in instructions that command must be copied exactly

---

## Troubleshooting Guide

### Diagnostic Commands

When things go wrong, run these commands to gather information:

#### Check Session State
```bash
# Does session lock exist?
ls -la ~/.taskmaster/$(basename $(pwd))/sessions/

# What task is active?
cat ~/.taskmaster/$(basename $(pwd))/sessions/current-task.json | jq .
```

#### Check Git State
```bash
# What changed?
git status -sb

# Show unstaged changes
git diff

# Show staged changes
git diff --cached

# Recent commits
git log --oneline -5
```

#### Check Task Master State
```bash
# List all tasks
npx task-master list

# List with subtasks
npx task-master list --with-subtasks

# Show specific task
npx task-master get <task-id>
```

#### Check Test State
```bash
# Run tests
npm test

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- path/to/test.test.ts
```

#### Check Autopilot State
```bash
# Show active executions
npx task-master autopilot status

# Show detailed execution info
npx task-master autopilot status --execution-id <id>
```

### Debug Mode

Enable verbose output for scripts:

```bash
# Add to beginning of any script
set -x  # Print commands as they execute

# Or run with bash debug mode
bash -x ./tdd-in-a-box/scripts/start-agent-work.sh
```

### Log Locations

```bash
# Session logs (preserved aborted sessions)
~/.taskmaster/<project>/sessions/aborted/

# Autopilot logs (if configured)
~/.taskmaster/<project>/autopilot-logs/

# Task Master database
~/.taskmaster/<project>/tasks/tasks.json

# Git log
git log --all --decorate --oneline --graph
```

### Common Error Messages Decoded

**Error:** `Cannot read property 'taskId' of undefined`  
**Meaning:** Session file is corrupted  
**Fix:** Delete session file and start fresh
```bash
rm ~/.taskmaster/$(basename $(pwd))/sessions/current-task.json
```

**Error:** `ENOENT: no such file or directory`  
**Meaning:** File or directory expected by script doesn't exist  
**Fix:** Check file paths in error message, verify installation

**Error:** `Task X is not in pending state`  
**Meaning:** Trying to claim a task that's already in-progress or done  
**Fix:** Check task list, update status if needed
```bash
npx task-master list
npx task-master update X --status pending
```

**Error:** `fatal: not a git repository`  
**Meaning:** Running from wrong directory  
**Fix:** Change to repository root

**Error:** `npm ERR! missing script: test`  
**Meaning:** No test script in package.json  
**Fix:** Add test script (see Gotcha #7)

### Emergency Reset

If everything is broken and you need to start completely fresh:

```bash
# 1. Discard all code changes
git reset --hard HEAD

# 2. Remove session lock
rm -f ~/.taskmaster/$(basename $(pwd))/sessions/current-task.json

# 3. Reset all Task Master tasks to pending
npx task-master list | grep "in-progress" | while read -r id rest; do
  npx task-master update "$id" --status pending
done

# 4. Verify clean state
git status
ls ~/.taskmaster/$(basename $(pwd))/sessions/
npx task-master list

# 5. Start fresh
./tdd-in-a-box/scripts/start-agent-work.sh
```

**⚠️ Warning:** This discards all uncommitted work. Use only as last resort.

---

## Appendix

### File Locations Reference

| File/Directory | Location | Purpose |
|---------------|----------|---------|
| Task definitions | `.taskmaster/tasks/tasks.json` | Task Master database |
| Session lock | `~/.taskmaster/<project>/sessions/current-task.json` | Active session marker |
| Aborted sessions | `~/.taskmaster/<project>/sessions/aborted/` | Preserved session logs |
| Entry protocol | `AGENTS.md` | Agent operating instructions |
| Start script | `tdd-in-a-box/scripts/start-agent-work.sh` | Begin new work |
| Wrapup script | `tdd-in-a-box/scripts/autopilot-wrapup.sh` | Clean session end |
| Reset script | `tdd-in-a-box/scripts/autopilot-reset.sh` | Abort session |
| Recovery script | `tdd-in-a-box/scripts/recovery-helper.sh` | Crash recovery |
| Check-in helper | `tdd-in-a-box/scripts/agent-check-in.sh` | Agent approval helper |
| Commit guard | `tdd-in-a-box/scripts/tm-commit.sh` | Safe git commit |
| This manual | `tdd-in-a-box/TDD-Manual.md` | User documentation |

### Environment Variables

TDD-in-a-Box uses minimal configuration. Optional environment variables:

```bash
# Task Master base directory (default: ~/.taskmaster)
export TASKMASTER_HOME="$HOME/.taskmaster"

# Enable debug output for scripts
export DEBUG=1
```

### Advanced Configuration

#### Custom Session Directory

By default, sessions are stored in `~/.taskmaster/<project>/sessions/`. To customize:

Edit scripts and change:
```bash
SESSION_DIR="$HOME/.taskmaster/$PROJECT_NAME/sessions"
```

#### Custom Test Command

If `npm test` doesn't work for your project, update `recovery-helper.sh`:

```bash
# Change this line:
TEST_OUTPUT=$(npm test 2>&1 || true)

# To your custom test command:
TEST_OUTPUT=$(your-test-command 2>&1 || true)
```

#### Multiple Projects

TDD-in-a-Box automatically handles multiple projects. Each project gets its own:
- Session directory: `~/.taskmaster/<project-name>/sessions/`
- Task database: `.taskmaster/tasks/tasks.json` (in repo root)

No additional configuration needed.

### Task Master Integration

#### Task Schema

Tasks in `.taskmaster/tasks/tasks.json` follow this schema:

```json
{
  "tasks": [
    {
      "id": "1",
      "title": "Task title",
      "description": "Detailed description",
      "status": "pending",  // or "in-progress", "done"
      "dependencies": [],
      "subtasks": [
        {
          "id": "1.1",
          "title": "Subtask title",
          "status": "pending"
        }
      ]
    }
  ]
}
```

#### Task Master Commands Quick Reference

```bash
# List tasks
npx task-master list
npx task-master list --with-subtasks

# Get specific task
npx task-master get <task-id>

# Update task status
npx task-master update <task-id> --status <status>

# Add new task
npx task-master add "Task title" --status pending

# Delete task
npx task-master delete <task-id>

# Show help
npx task-master --help
```

### Autopilot Integration

#### Autopilot Commands Quick Reference

```bash
# Start Autopilot on a task
npx task-master autopilot start --task <task-id>

# Check status
npx task-master autopilot status

# Get detailed execution info
npx task-master autopilot status --execution-id <id>

# Abort execution
npx task-master autopilot abort --execution-id <id>
```

#### Autopilot TDD Cycle

1. **RED Phase:**
   - Agent writes failing test
   - Commits test: `test: add failing test for feature X`

2. **GREEN Phase:**
   - Agent implements minimal code to pass test
   - Commits implementation: `feat: implement feature X`

3. **REFACTOR Phase (optional):**
   - Agent improves code quality
   - Commits refactor: `refactor: improve X implementation`

4. **COMPLETE:**
   - Autopilot marks task complete
   - Agent runs wrapup script

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2024 | Initial release with full workflow guardrails |

### Support & Contribution

**Documentation:** All docs in `tdd-in-a-box/docs/` directory

**Bug Reports:** Include:
- Command that failed
- Full error output
- Contents of session file (if exists)
- Git status output
- Task Master task list

**Feature Requests:** Consider:
- Does it maintain single-agent simplicity?
- Does it preserve deterministic behavior?
- Does it help non-developers?

### License

TDD-in-a-Box is part of your project and follows your project's license.

---

## Quick Reference Card

### Normal Workflow
```bash
# 1. Agent starts
Point agent to: /AGENTS.md

# 2. Agent reports
"I've been assigned Task X. Shall I proceed?"

# 3. You approve
"yes"

# 4. Agent works (you wait)
# ...Autopilot TDD cycle...

# 5. Verify and finish
git log -1
npm test
```

### Crash Recovery
```bash
./tdd-in-a-box/scripts/recovery-helper.sh
```

### Manual Commands
```bash
# Start work
./tdd-in-a-box/scripts/start-agent-work.sh

# Clean finish
./tdd-in-a-box/scripts/autopilot-wrapup.sh

# Abort work
./tdd-in-a-box/scripts/autopilot-reset.sh

# Check tasks
npx task-master list --with-subtasks

# Safe commit
tdd-in-a-box/scripts/tm-commit.sh -m "message"
```

### Emergency Commands
```bash
# Discard everything and reset
git reset --hard HEAD
rm -f ~/.taskmaster/$(basename $(pwd))/sessions/current-task.json
npx task-master update <task-id> --status pending
```

---

**End of TDD-in-a-Box User Manual**
