# Agent Operating Agreement

Follow every step below before touching code. These rules keep Autopilot + Task-master in sync.

## Pre-Session Ritual (Mandatory)

1. Use the Task-master MCP interface as your primary control plane. Initiate Autopilot and task actions through MCP tools, not ad-hoc shell commands. Treat direct shell edits as forbidden unless explicitly requested.
1. Paths: if this kit is in a subfolder (e.g., `./tdd/`), prefix commands with `./tdd/`; if you’re inside this folder, use `./`.
1. Read `./docs/guides/taskmaster-guardrails.md`
2. Run:
   ```bash
   npx task-master list --with-subtasks
   ```
3. Verify clean tree: `git status -sb` must show no changes
4. **READ-ONLY**: You are forbidden from editing files in `docs/hitl-verify/`. These are human verification tests.

## Starting Work

1. Run the helper:
   ```bash
   ./scripts/work-start.sh
   ```
2. Copy the exact `npx task-master autopilot start …` command it prints
3. If script refuses (dirty tree, stale session), fix the issue first

## During Each Subtask

- Log plan first: `task-master update-subtask --id=<id> --prompt="Plan: …"`
- Set in-progress: `task-master set-status --id=<id> --status=in-progress`
- Follow RED → GREEN → COMMIT loop exactly
- Document outcomes with `task-master update-subtask`
- Document what changed, how to test, and expected result for each subtask

## Human-in-the-Loop Checkpoint

After completing **all subtasks** in a major task:
1. Mark task as **review** (not done): `task-master set-status --id=<taskId> --status=review`
2. Announce: "✅ Task [ID] complete. Ready for audit."
3. Tell user: "Next: Copy `user/2-AUDIT.txt` to a NEW chat for verification."
4. **STOP. Wait for approval** before starting the next major task

## Audit Protocol (Mandatory)

When asked to **"Audit Task [ID]"**:
1. Read `./TDD-auditor.md` immediately
2. Run tests yourself: `npm test`
3. Verify actual files exist (don't trust previous agent's summary)
4. Generate report: `docs/audits/audit-task-[ID].md`
5. **If PASS**: Commit the report
6. **If FAIL**: List critical issues; do not commit

## Session Wrap-Up

1. Run `./scripts/work-wrapup.sh`
2. Verify: `task-master list --with-subtasks`
3. Ensure clean: `git status -sb`

## Crash Recovery

If agent crashes mid-work:
```bash
./scripts/recovery.sh
```
This runs tests and helps decide whether to keep or discard partial work.

## Honesty Clause
 
 Be brutally honest about blockers or mistakes. Report anomalies immediately. Never guess.
 
 ### The "Ghost Feature" Rule
 **"Code exists" is not "Done".**
 - You MUST NOT mark a task "done" until the feature is **accessible in the UI** (or API).
 - If you create a component but don't wire it to a route/page, it is a failure.
 - **MANDATORY**: Run `npm run dev` (or equivalent) yourself before finishing to ensure no runtime crashes.
