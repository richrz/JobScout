# TDD Method - DroidForge Workflow System

This directory contains the complete **TDD-in-a-Box** workflow system, extracted from DroidForge for standalone use in any project.

## Overview

This is a production-ready TDD workflow system that integrates with Task-master Autopilot to enforce strict TDD methodology and provide comprehensive quality audits.

## Quick Start

### Setup (Letters = Do Once or Per Session)

**A. Project Setup** (Once per project)
```
Copy `user/A-SETUP-PROJECT.txt` to a new AI chat.
Agent will: install deps, create tasks, generate your verification tests.
```

**B. Session Setup** (Start of each coding session)
```
Copy `user/B-SETUP-SESSION.txt` to a new AI chat.
Agent will: run preflight, claim the next task, wait for your approval.
```

### The Core Loop (Numbers = Repeat for Each Task)

```
┌─────────────────────────────────────────────────────────────┐
│  1-BUILD  →  2-AUDIT  →  3-APPROVE  →  (next task)         │
│   Agent      Agent        YOU                               │
│   codes      verifies     verify & mark done                │
└─────────────────────────────────────────────────────────────┘
```

**1. Build** — Copy `user/1-BUILD.txt` → Agent codes the task
**2. Audit** — Copy `user/2-AUDIT.txt` to NEW chat → Agent verifies
**3. Approve** — Open `user/3-APPROVE.txt` → YOU run the HITL test

## Key Features

### 🔄 State Machine Workflow
- **IDLE** → **CLAIMED** → **WORKING** → **REVIEW** → **AUDITING** → **CLOSED**
- Automatic crash recovery with `recovery.sh`
- Human-in-the-loop checkpoints for quality control

### 🤖 Agent Operating Agreement
- Pre-session rituals and guardrails
- Standardized RED → GREEN → COMMIT workflow
- Comprehensive audit protocol with scoring system

### 🛡️ Quality Assurance
- Mandatory audits before task completion
- Runtime verification (app must actually run)
- Human verification before marking "done"

### 📁 File Structure
```
.
├── user/                            # YOUR control panel
│   ├── A-SETUP-PROJECT.txt          # Once: Initialize project
│   ├── B-SETUP-SESSION.txt          # Each chat: Start session
│   ├── 1-BUILD.txt                  # Agent codes
│   ├── 2-AUDIT.txt                  # Agent verifies
│   └── 3-APPROVE.txt                # YOU verify & approve
├── docs/
│   ├── audits/                      # Agent audit reports
│   └── hitl-verify/                 # YOUR verification checklists
├── scripts/                         # Helper scripts (internal)
├── TDD-AGENTS.md                    # Agent operating rules
├── TDD-auditor.md                   # Audit protocol
└── TDD-Manual.md                    # Deep reference
```

## Usage Instructions

For detailed usage, see:
- `TDD-AGENTS.md` - Agent operating agreement
- `TDD-auditor.md` - Audit protocol and scoring
- `TDD-Manual.md` - Complete reference

## Integration

This TDD method integrates seamlessly with:
- **Task-master AI**: Task orchestration and autopilot functionality
- **Git**: Version control with guarded commit process
- **Testing Frameworks**: Any test runner (Jest, Mocha, Vitest, etc.)
- **CI/CD**: Can be integrated into existing pipelines

## License and Usage

This workflow system is designed for:
- **Teams**: Standardized TDD methodology across developers
- **Individuals**: Structured approach to quality software development
- **Organizations**: Enterprise-level TDD enforcement and audit trail

## Migration Notes

This is extracted from the DroidForge project where it has been battle-tested in production environments. The system provides:
- Deterministic workflow execution
- Comprehensive error handling
- Quality gate enforcement
- Complete audit trails
- Crash recovery capabilities

## State Machine

```
┌─────────┐
│  IDLE   │  No active session, repo clean
└────┬────┘
     │ work-start.sh
     ↓
┌─────────┐
│ CLAIMED │  Task marked in-progress, session created
└────┬────┘
     │ User approves → agent runs autopilot
     ↓
┌─────────┐
│ WORKING │  Autopilot driving RED → GREEN → COMMIT
└────┬────┘
     │ All subtasks complete
     ↓
┌─────────┐
│ REVIEW  │  Major task done, awaiting human review
└────┬────┘
     │ User invokes "Audit Task X" (Fresh Session)
     ↓
┌─────────┐
│ AUDITING│  Agent verifies work against standards
└────┬────┘
     │ Pass -> Human Verification
     ↓
┌─────────┐
│ VERIFY  │  You run "user/5-verify/task-X.txt"
└────┬────┘
     │ Pass -> Run "set-status done" command
     ↓
┌─────────┐
│ CLOSED  │  Task marked done
└─────────┘

     CRASH? → Run recovery.sh
```

## Quick Start

### 1. The Planner (Initialize)
```bash
npx task-master init
```

### 2. The Architect (Generate Tests)
- Open a **new agent session**.
- Copy prompt from: `user/2-agent-onboarding/architect-copy-this.txt`
- Agent will generate `user/5-verify/*.txt` files.

### 3. The Builder (Implementation)
- Open a **new agent session**.
- Copy prompt from: `user/2-agent-onboarding/implementation-copy-this.txt`
- Agent implements code (Red -> Green -> Commit).

### 4. The Auditor (Verification)
- Open a **new agent session** when task is ready.
- Copy prompt from: `user/2-agent-onboarding/auditor-copy-this.txt`
- Agent generates audit report.

### 5. The Human (Acceptance)
- Open `user/5-verify/task-[ID].txt`.
- Run the commands.
- If PASS: Run the provided `task-master set-status ... done` command.

**Important**: Auditor agents should be in a NEW session (not the one that implemented the code) to avoid shared hallucinations.

### Workflow

```bash
# 1. Agent runs pre-session ritual
npx task-master list --with-subtasks
git status -sb

# 2. Agent starts work
./scripts/work-start.sh

# 3. You approve, agent works through TDD cycle (RED → GREEN → COMMIT)

# 4. When task complete, you say: "Audit Task X"
#    (Best Practice: Start a NEW agent session for the audit)

# 5. If crash: ./scripts/recovery.sh
```

## File Structure

```
.
├── TDD-AGENTS.md              # Implementation agent instructions
├── TDD-auditor.md             # Auditor agent instructions
├── scripts/
│   ├── work-start.sh    # Begin new work
│   ├── work-wrapup.sh    # Clean finish
│   ├── work-reset.sh     # Abort/crash cleanup
│   ├── recovery.sh     # Automated crash recovery
│   ├── commit-guard.sh           # Commit guardrail
│   ├── prompt-impl.sh  # Print implementation agent prompt
│   └── prompt-audit.sh     # Print auditor agent prompt
└── docs/
    ├── guides/
    │   ├── taskmaster-guardrails.md
    │   ├── autopilot-agent-runbook.md
    │   ├── autopilot-tdd-playbook.md
    │   └── human-in-the-loop-workflow.md
    └── prompts/
        ├── kick-off.md        # New agent onboarding (reference)
        ├── agent-onboarding-prompt.md  # Implementation agent prompt
        └── auditor-onboarding-prompt.md  # Auditor agent prompt
```

## Key Concepts

- **HITL Checkpoint**: Human approval required after each major task (not subtask)
- **Audit Phase**: Mandatory verification after implementation, before merge
- **Crash Recovery**: `recovery.sh` tests partial work and helps decide keep/discard
- **Commit Guardrail**: `commit-guard.sh` blocks commits during active sessions
