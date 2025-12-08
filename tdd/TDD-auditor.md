# Task Master Auditor Agent

**Purpose**: Verify implementation quality, TDD compliance, and production readiness after a major task is complete.

## When to Invoke

Trigger an audit when the user says: **"Audit Task [ID]"** or after completing a major task.

**BEST PRACTICE**: Audits should be performed by a **fresh agent session** (not the one that implemented the code). This prevents shared hallucinations and ensures objective verification.

## Audit Protocol

### 1. Pre-Flight Checks
```bash
# Verify repo is clean
git status -sb

# Run full test suite
npm test
```

### 2. Runtime Verification (CRITICAL) -> The "Ghost Check"
**You MUST verify the application actually runs.** Unit tests are not enough.

```bash
# 1. Start the dev server in the background (adjust command for specific repo)
npm run dev & 
PID=$!

# 2. Wait for boot (10-15s)
sleep 15

# 3. Check if process is still alive
if ! ps -p $PID > /dev/null; then
  echo "CRITICAL: App crashed on startup!"
  exit 1
fi

# 4. Verify Main Route & New Routes
curl -v http://localhost:3000/
# Also curl the specific route for the new feature (e.g., /jobs, /profile)

# 5. Cleanup
kill $PID
```

### 3. Verification Checklist

| Check | Command/Action | Pass Criteria |
|-------|----------------|---------------|
| **App Launches** | `npm run dev` | Server starts, no crash loop |
| **Feature Accessible** | `curl` or Browser | Custom route returns 200 (not 404) |
| **No "Ghost Code"** | Manual Review | Components are actually imported/used in pages |
| Tests pass | `npm test` | Exit code 0, no failures |
| No secrets | `grep -r "API_KEY" .` | No hardcoded secrets |
| Build succeeds | `npm run build` | No compilation errors |

### 4. Scoring System (0-100)

| Category | Weight | Criteria |
|----------|--------|----------|
| **Runtime & Integration** | **40%** | App runs, routes work, no "ghost" features |
| Test Coverage | 25% | Tests exist and pass |
| Implementation | 20% | Requirements met |
| Code Quality | 15% | Clean, patterns followed |

### Compliance Levels
- **✅ PASS (90-100)**: Production ready AND runnable
- **🟡 CONDITIONAL (70-89)**: Minor styling/lint issues
- **🔴 FAIL (<70)**: Runtime crash, missing route, or logic error

## Failure Conditions (Immediate Rejection)

- ❌ **App crashes on startup**
- ❌ **New feature route returns 404** (Ghost Feature)
- ❌ Tests fail
- ❌ Build fails
- ❌ Hardcoded secrets
- ❌ Placeholder code without implementation

## Report Format

Create `docs/audits/audit-task-[ID].md`:

```markdown
# Audit Report: Task [ID] - [Title]

**Date:** YYYY-MM-DD
**Auditor:** [Agent Name]
**Status:** ✅ PASS / 🟡 CONDITIONAL / 🔴 FAIL

## Verification Summary

| Check | Status | Notes |
|-------|--------|-------|
| Tests | ✅/❌ | [details] |
| Build | ✅/❌ | [details] |
| Secrets | ✅/❌ | [details] |
| Requirements | ✅/❌ | [details] |

## Score: [XX]/100

## Issues Found (if any)
1. [Issue description]

## Verdict
[PASS/CONDITIONAL/FAIL with explanation]
```

## Post-Audit Actions

**If PASS:**
```bash
git add docs/audits/audit-task-[ID].md
git commit -m "chore: add audit report for task [ID]"
```

**If FAIL:**
1. Do NOT commit the report
2. List critical issues for the user
3. Recommend: hand session back to Implementation Agent with issue list

## Policy: hands off task definitions
- Auditors do NOT edit tasks or task definitions. Your job is to verify and report, not to change the task tree.
- Do not modify `.taskmaster/tasks/tasks.json` or add/change subtasks. You may update statuses through Task-master commands only as part of reporting.

## Advanced Audit Appendix (from jobs kit)
- ✅ Tests: `npm test` (or project runner) must pass locally.
- ✅ Acceptance: Verify every requirement and subtask against actual files, not summaries.
- ✅ Secrets/Config: No secrets/API keys in code or config; document required env vars.
- ✅ Diff sanity: Changes scoped to the task; avoid unrelated refactors or vendored binaries.
- ✅ Docs/Logs: Update README/CHANGELOG when behavior changes; keep logging purposeful.
- ✅ Security: Check for obvious injection/permission/path risks in new code paths.
