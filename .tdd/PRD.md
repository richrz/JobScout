# JobScout PRD - Phase 2 (Tasks 20-26)

**Version:** 1.0  
**Created:** December 2024  
**Scope:** Final development phase - remaining features and testing

---

## Overview

This PRD covers the remaining tasks (20-26) for the JobScout job search platform. Tasks 20-22 are already complete; this document focuses on pending tasks 23-26 using the updated TDD methodology with mandatory demo commands.

---

## Task Status Overview

| Task | Title | Status | Subtasks |
|------|-------|--------|----------|
| 20 | Custom Resume Generation | ⏳ Partial (5/8 subtasks) | 20.6, 20.7, 20.8 pending |
| 21 | Settings Page with Tabs | ✅ Done | - |
| 22 | Responsive UI with Tailwind | ✅ Done | - |

---

## Pending Tasks

### Task 20: Custom Resume Generation (Remaining Subtasks)

**Description:** Complete the /resume route, wire up editor/preview/LLM integration, and implement resume persistence.

**Demo:** `npm run demo:resume`  
**Output:** Terminal shows resume generation workflow:
```
Resume Demo
===========
1. Loading sample job: "Senior Developer at TechCorp"
2. Generating tailored resume with LLM...
   ✓ Conservative exaggeration mode
   ✓ 523 words generated
3. Opening preview at http://localhost:3000/resume
4. PDF download ready: TechCorp-2024-12-15.pdf
```

**Pending Subtasks:**
- 20.6: Implement /resume route and page layout
- 20.7: Wire Editor, Preview, and LLM Integration
- 20.8: Implement Resume Persistence and Application Association

**Acceptance Criteria:**
- /resume route accessible and renders components
- LLM generates tailored content based on job + profile
- ProseMirror editor allows live editing
- PDF downloads with custom filename template
- Resume saves to Application record

### Task 23: Audit Process Reform and Runtime Verification

**Description:** Improve the TDD audit process to include runtime verification (app actually starts) and not just file existence checks.

**Demo:** `npm run demo:audit`  
**Output:** Terminal shows audit report with pass/fail for each check:
```
✅ Tests pass (23/23)
✅ App starts (localhost:3000 responds 200)
✅ Feature routes accessible
❌ HITL test quality (missing exact steps)
Score: 75/100 - CONDITIONAL
```

**Acceptance Criteria:**
- Auditor script runs `npm run dev` and verifies 200 response
- Auditor checks HITL test quality against HITL-STANDARD.md
- Report includes runtime verification section
- Ghost feature detection (route returns 200, not 404)

---

### Task 24: Implement Core Route Pages and Navigation

**Description:** Wire up `/jobs`, `/settings`, `/dashboard` routes with proper navigation.

**Demo:** `npm run demo:routes`  
**Output:** Terminal shows route verification:
```
Checking routes...
  / ................ 200 OK (dashboard)
  /jobs ............. 200 OK (12 jobs displayed)
  /settings ......... 200 OK (3 tabs visible)
  /map .............. 200 OK (map loaded)
  /pipeline ......... 200 OK (kanban board)
  /invalid-route .... 404 OK (not-found page)
All 6 routes verified!
```

**Acceptance Criteria:**
- All main routes return 200
- Navigation links work (no broken links)
- 404 page handles unknown routes
- Mobile navigation functional

---

### Task 25: Implement Database-Free Mock Mode

**Description:** Allow app to run without database for demos and CI testing.

**Demo:** `npm run demo:mock`  
**Output:** Terminal shows mock mode verification:
```
Starting in MOCK MODE...
Mock data loaded: 50 jobs, 5 pipeline items
No database connection required!
Server ready at http://localhost:3000
Try: curl http://localhost:3000/api/jobs
```

**Acceptance Criteria:**
- `NEXT_PUBLIC_MOCK_MODE=true` bypasses Prisma
- In-memory job data (50+ items)
- In-memory pipeline state
- All routes functional without DB

---

### Task 26: Implement End-to-End Testing with Playwright

**Description:** Browser-based E2E tests for critical user flows.

**Demo:** `npm run demo:e2e`  
**Output:** Terminal shows Playwright test results:
```
Running 5 tests...

  ✓ navigation.spec.ts
    ✓ can navigate to dashboard (1.2s)
    ✓ can navigate to jobs (0.8s)
    ✓ can navigate to settings (0.9s)
    
  ✓ theme.spec.ts
    ✓ theme toggle switches dark/light (0.5s)
    
  ✓ jobs.spec.ts
    ✓ job list renders with cards (1.1s)

5 passed (4.5s)
```

**Acceptance Criteria:**
- Playwright configured with Mock Mode
- Tests for navigation, theme toggle, job list
- CI-ready (no database required)
- HTML report generated

---

## Task Decomposition Rules (For AI Agents)
## 95% RULE! YOU MUST FOLLOW THIS!

When breaking down this project into tasks:
- Each task must be completable by an AI agent in ONE focused session
- If you're not 95% confident an agent can complete a task without getting stuck or asking questions, break it down further
- Prefer many small tasks over few large tasks
- Each task should have a single, clear outcome

### Demo Command Requirement (MANDATORY)

EVERY major task MUST include a demo command that produces human-readable output.

Format:
```
Task X: [Title]
Demo: npm run demo:[task-name]
Output: [What the human will see]
```

**NO EXCEPTIONS. CLI output counts as visual. Every task proves itself.**

---

## File: `.tdd/PRD.md`
