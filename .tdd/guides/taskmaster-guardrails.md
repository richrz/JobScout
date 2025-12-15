# Task-master Guardrails

Rules for keeping Autopilot and Task-master in sync.

## Pre-Session Ritual

1. **Read the task tree** before touching anything:
   ```bash
   npx task-master list --with-subtasks
   ```

2. **Verify clean working tree**:
   ```bash
   git status -sb
   ```
   Must show no changes before starting Autopilot.

3. **Check for stale sessions** (task-master may store these locally or in home dir):
   ```bash
   # Local repo
   ls .taskmaster/sessions/ 2>/dev/null
   
   # Home directory (legacy)
   ls ~/.taskmaster/*/sessions/ 2>/dev/null
   ```
   If `workflow-state.json` exists anywhere, run `./.tdd/scripts/work-reset.sh`.

## Subtask Lifecycle

1. **Plan first**: `task-master update-subtask --id=X.Y --prompt="Plan: ..."`
2. **Set in-progress**: `task-master set-status --id=X.Y --status=in-progress`
3. **Work**: Follow RED → GREEN → COMMIT
4. **Complete**: Autopilot marks subtask done via `autopilot_complete_phase`

## Drift Checks

Run periodically to catch mismatches:

```bash
# Task tree should match reality
npx task-master list --with-subtasks

# No orphaned session files (check both locations)
ls .taskmaster/sessions/ 2>/dev/null
ls ~/.taskmaster/*/sessions/ 2>/dev/null

# Working tree matches expectations
git status -sb
git log --oneline -5
```

## Common Issues

| Issue | Fix |
|-------|-----|
| "WORKING TREE DIRTY" | `git stash -u` or commit changes |
| "STALE SESSION" | `./.tdd/scripts/work-reset.sh` |
| Wrong task claimed | `autopilot abort`, then re-run `work-start.sh` |
| Task status mismatch | `task-master set-status --id=X --status=<correct>` |

## commit-guard

Use `./.tdd/scripts/commit-guard.sh` instead of `git commit` to:
- Block commits during active Autopilot sessions
- Prevent manual edits to `tasks.json`

```bash
./.tdd/scripts/commit-guard.sh -m "feat: implement feature X"
```
