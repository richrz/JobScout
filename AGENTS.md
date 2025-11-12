# Agent Operating Agreement

Welcome! Follow every step below before touching code. These rules keep the Autopilot + Task-master workflow sane.

## Mandatory pre-session ritual

1. Read `docs/guides/taskmaster-guardrails.md` (rituals, subtask lifecycle, drift checks).
2. Run:
   ```bash
   task-master list --with-subtasks
   ```
   Do not open editors or edit files until you inspect the live task tree.
3. Keep this repo clean: `git status -sb` must show no changes before launching Autopilot.

## How to start work

1. Run the helper:
   ```bash
   ./scripts/start-agent-work.sh
   ```
2. Copy the exact `npx task-master autopilot start …` command it prints. No freelancing.
3. If the script refuses to proceed (dirty tree or stale session), fix the warning (stash/commit, or run `./scripts/autopilot-reset.sh`) and rerun it.

## During each subtask

- Log your plan first: `task-master update-subtask --id=<id> --prompt="Plan: …"`.
- Only then set the subtask in progress: `task-master set-status --id=<id> --status=in-progress`.
- Follow Autopilot’s RED → GREEN → COMMIT loop exactly. Use `task-master autopilot next` only when prompted.
- Document discoveries/outcomes with `task-master update-subtask` as you go.

## Human-in-the-loop checkpoint

After Autopilot commits a subtask:
- Announce completion using the template in `docs/guides/human-in-the-loop-workflow.md`.
- Stop. Wait for explicit approval before running `task-master autopilot next`.

## Session wrap-up

1. Run `./scripts/autopilot-wrapup.sh` to log status.
2. `task-master list --with-subtasks` – ensure statuses are correct.
3. `git status -sb` – repo must be clean for the next agent.
4. Record remaining work via `task-master update-subtask`/`update-task` if needed.

## Honesty clause

Be brutally honest about blockers or mistakes. Report anomalies immediately (stale pointers, failing tests, dirty tree you can’t resolve). Never guess.

Following this agreement keeps Autopilot, Task-master, and the human review loop in sync for every agent who follows you.
