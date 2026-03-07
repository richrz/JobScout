# Remediation Plan: App Launch Readiness

## Current State
- **12 tasks marked "done"** but app crashes on launch
- Static code exists but integration is broken
- No runtime verification was performed

## Proposed Approach: Create New Task Set

Instead of modifying existing "done" tasks, create a new focused task set called **"App Launch Readiness"** that specifically addresses:

1. **Runtime Verification** - Can the app even start?
2. **Route Completeness** - Do all navigation links work?
3. **Integration Testing** - Do features work end-to-end?

---

## Proposed Tasks (Priority Order)

### Task 23: App Bootstrap & Runtime Verification [BLOCKER]
**Description**: Ensure the app starts without errors and loads in browser
**Subtasks**:
1. Fix middleware Edge Runtime compatibility ✅ DONE
2. Fix Tailwind v3/v4 configuration mismatch ✅ DONE  
3. Add required env variables (NEXTAUTH_SECRET, NEXTAUTH_URL) ✅ DONE
4. Add dev login bypass for testing ✅ DONE
5. Create E2E smoke test (app starts, homepage loads)

**Acceptance**: `npm run dev` succeeds AND `curl localhost:3000` returns 200

---

### Task 24: Route Completeness - Missing Pages
**Description**: Create all missing page routes that navigation links point to
**Subtasks**:
1. Create `/jobs` page with job listing component
2. Create `/settings` page using existing settings components
3. Create `/dashboard` page (or update `/` with real content)
4. Update `/pipeline` to work without database dependency
5. Create route smoke test (all nav links return 200)

**Acceptance**: Every link in AppLayout.tsx navigation returns 200

---

### Task 25: Database-Free Development Mode
**Description**: Enable full app usage without PostgreSQL/Redis running
**Subtasks**:
1. Add mock data fallbacks for Prisma calls
2. Make rate limiter gracefully degrade (already done)
3. Add in-memory session for dev login
4. Create mock job data for pipeline/jobs pages

**Acceptance**: Full app navigation works with `DATABASE_URL=""` 

---

### Task 26: Integration Test Suite
**Description**: Add runtime verification tests that actually run the app
**Subtasks**:
1. Add Playwright or Cypress for E2E tests
2. Test: App starts successfully
3. Test: Can navigate to each main page
4. Test: Can log in with dev bypass
5. Test: Theme toggle works
6. Add to CI - fail if app doesn't load

**Acceptance**: `npm run test:e2e` passes with actual browser tests

---

### Task 27: Audit Process Reform
**Description**: Update audit checklist to require runtime verification
**Subtasks**:
1. Update AUDITOR.md with mandatory runtime checks
2. Add "npm run dev must succeed" to audit criteria
3. Add "all nav routes must return 200" to audit criteria
4. Create audit automation script

---

## Commands to Create These Tasks

```bash
# Create Task 23
npx task-master add-task --prompt "App Bootstrap & Runtime Verification: Ensure the app starts without errors. Fix middleware Edge Runtime compatibility, Tailwind configuration, env variables, and create E2E smoke test. Acceptance: npm run dev succeeds AND curl localhost:3000 returns 200" --priority high

# Create Task 24
npx task-master add-task --prompt "Route Completeness - Missing Pages: Create all missing page routes (/jobs, /settings, /dashboard). Every link in AppLayout navigation must return 200, not 404." --priority high

# Create Task 25
npx task-master add-task --prompt "Database-Free Development Mode: Enable full app navigation without PostgreSQL/Redis. Add mock data fallbacks, in-memory session, mock job data." --priority medium

# Create Task 26
npx task-master add-task --prompt "Integration Test Suite: Add Playwright E2E tests that verify app starts, pages load, login works, theme toggle works. Must run actual browser, not just unit tests." --priority high

# Create Task 27
npx task-master add-task --prompt "Audit Process Reform: Update AUDITOR.md to require runtime verification. Audits must verify npm run dev succeeds and all routes return 200 before passing." --priority medium
```

## Quick Fix Option

If you want to just get the app working NOW without new tasks:

```bash
# I already fixed these (Tasks 23.1-23.4):
# ✅ Middleware Edge compatibility
# ✅ Tailwind v3 config
# ✅ NEXTAUTH_SECRET
# ✅ Dev login bypass

# Only remaining critical fix - create missing pages:
# /jobs and /settings need page.tsx files
```

---

## Recommended Next Step

**Option A**: Quick fix - I create `/jobs` and `/settings` pages right now (10 min)

**Option B**: Full process - Create Task 24-27 via task-master and work through them systematically

Which would you prefer?
