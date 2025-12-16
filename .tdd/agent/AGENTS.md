# Agent Operating Agreement

Follow every step below before touching code. These rules keep Autopilot + Task-master in sync.

## Pre-Session Ritual (Mandatory)

1. Use the Task-master MCP interface as your primary control plane. Initiate Autopilot and task actions through MCP tools, not ad-hoc shell commands. Treat direct shell edits as forbidden unless explicitly requested.
2. Read `.tdd/guides/taskmaster-guardrails.md`
3. Run:
   ```bash
   npx task-master list --with-subtasks
   ```
4. Verify clean tree: `git status -sb` must show no changes
5. **READ-ONLY**: You are forbidden from editing files in `.tdd/output/hitl-verify/`. These are human verification tests.

## Starting Work

1. Run the helper:
   ```bash
   ./.tdd/scripts/work-start.sh
   ```
2. Copy the exact `npx task-master autopilot start …` command it prints
3. If script refuses (dirty tree, stale session), fix the issue first

## Status Management Rules (CRITICAL)

- **NEVER** manually set a MAJOR task status to `pending` or `in-progress`.
  - usage of `npx task-master autopilot start` automatically handles this.
  - usage of `npx task-master set-status` is ONLY for:
    - Subtasks (`--id=14.1`)
    - Marking major tasks as `review` or `done`
- **NEVER** regress a task status (e.g. `review` → `in-progress`). If changes are needed, keep it in `review` or `in-progress` but do not go back to `pending`.

## During Each Subtask

- Log plan first: `task-master update-subtask --id=<id> --prompt="Plan: …"`
- Set in-progress: `task-master set-status --id=<id> --status=in-progress`
- Follow RED → GREEN → COMMIT loop exactly
- Document outcomes with `task-master update-subtask`
- Document what changed, how to test, and expected result for each subtask

## Human-in-the-Loop Checkpoint

After completing **all subtasks** in a major task:
1. **Generate HITL Test**: Read `.tdd/agent/templates/HITL-STANDARD.md` and create `.tdd/output/hitl-verify/task-[ID].txt` following that EXACT format
2. Mark task as **review** (not done): `task-master set-status --id=<taskId> --status=review`
3. Announce: "✅ Task [ID] complete. Ready for audit."
4. Tell user: "Next: Copy `.tdd/user/2-AUDIT.txt` to a NEW chat for verification."
5. **STOP. Wait for approval** before starting the next major task

## Always-Next-Step Rule (Mandatory)

**Every agent message MUST end with a NEXT directive.**

```
┌─────────────────────────────────────────────────────────────┐
│ NEXT: [Exact action the user should take]                  │
└─────────────────────────────────────────────────────────────┘
```

Examples:
- `NEXT: Say 'proceed' to begin building Task 14`
- `NEXT: Copy '.tdd/user/2-AUDIT.txt' to a NEW AI chat`
- `NEXT: Run the HITL test yourself in '.tdd/output/hitl-verify/task-14.txt'`
- `NEXT: Run 'npx task-master set-status --id=14 --status=done'`

Context-aware directives:
| Situation | NEXT Directive |
|-----------|----------------|
| Build complete | Copy `.tdd/user/2-AUDIT.txt` to NEW chat |
| Audit PASS | Open `.tdd/user/3-APPROVE.txt` and run HITL test yourself |
| Audit FAIL | Tell Builder: "Audit failed. Read `.tdd/output/audits/audit-task-[ID].md` and fix issues." |
| HITL PASS | Run `npx task-master set-status --id=X --status=done` |
| HITL FAIL | Report: "Task X failed. TEST Y failed because..." |
| Crash | Run `./.tdd/scripts/recovery.sh` |
| No tasks left | "All tasks complete! Review `.tdd/output/audits/` for reports." |

## Builder Self-Reflection (MANDATORY)

Before marking a task as `review` or asking for an audit:
1. **Run Tests**: `npm test` (Must pass)
2. **Run Demo**: `npm run demo:[task]` (Must work)
3. **Pre-Audit Yourself**:
   - create `.tdd/output/audits/audit-task-[ID].md`
   - Honestly list any known issues
   - If issues exist, fix them BEFORE asking the user to audit.

## Audit Protocol (Mandatory)

When asked to **"Audit Task [ID]"**:
1. Read `.tdd/agent/auditor.md` immediately
2. Run tests yourself: `npm test`
3. Verify actual files exist (don't trust previous agent's summary)
4. **Verify HITL test exists and follows standard**: Check `.tdd/output/hitl-verify/task-[ID].txt` exists and contains specific Click/Type/Expect steps (not vague instructions)
5. Generate report: `.tdd/output/audits/audit-task-[ID].md`
6. **If PASS**: Commit the report
7. **If FAIL**: List critical issues; do not commit

## Session Wrap-Up

1. Run `./.tdd/scripts/work-wrapup.sh`
2. Verify: `task-master list --with-subtasks`
3. Ensure clean: `git status -sb`

## Crash Recovery

If agent crashes mid-work:
```bash
./.tdd/scripts/recovery.sh
```
This runs tests and helps decide whether to keep or discard partial work.

## Honesty Clause
 
Be brutally honest about blockers or mistakes. Report anomalies immediately. Never guess.
 
### The "Ghost Feature" Rule
**"Code exists" is not "Done".**
- You MUST NOT mark a task "done" until the feature is **accessible in the UI** (or API).
- If you create a component but don't wire it to a route/page, it is a failure.
- **MANDATORY**: Run `npm run dev` (or equivalent) yourself before finishing to ensure no runtime crashes.

### HITL Test Quality Gate
Before marking any task for review, the HITL test file MUST:
- Exist at `.tdd/output/hitl-verify/task-[ID].txt`
- Reference the task's demo command: `npm run demo:[task-name]`
- Show human-observable output (GUI, CLI, audio, or file)
- NOT use banned patterns: "file exists", "build succeeds", "tests pass"
- Follow the format in `.tdd/agent/templates/HITL-STANDARD.md` EXACTLY
