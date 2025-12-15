# HITL Test Generation Standard

**READ THIS BEFORE GENERATING ANY HITL TEST**

## Purpose

HITL (Human-in-the-Loop) tests are **User Acceptance Tests** that non-developers execute to verify features work. Each test becomes a **documented verification record** with answers and notes.

---

## How Many Tests?

**Test USER-FACING FEATURES, not subtasks.**

| Task Has | HITL Tests |
|----------|-----------|
| 15 subtasks, 3 user features | 3 tests |
| 8 subtasks, 1 user feature | 1 test |
| 20 subtasks, 5 user features | 5 tests |

### What counts as a "user-facing feature"?

Things the user can **see or do**:
- A new page or route (`/profile`, `/settings`)
- A new button or action ("Export PDF", "Send Invite")
- A form that accepts input (login, signup, edit profile)
- A visible change (dashboard shows stats, list filters work)

---

## Observable Verification Requirement (CRITICAL)

**HITL tests exist so humans can SEE features working.**

Every test MUST use the task's demo command:
```
npm run demo:[task-name]
```

### What Counts as Observable?

| Type | Example Output |
|------|----------------|
| **GUI** | Browser shows page, button works, form submits |
| **CLI** | Terminal shows data, values, results |
| **Audio** | Sound plays |
| **File** | Human-readable output file generated |

**CLI counts as visual.** If a human can see and verify the output, it's valid.

### BANNED Test Types (These are NOT HITL tests)

You MUST NOT use these as verification:
- ❌ "File exists" 
- ❌ "Build succeeds"
- ❌ "Tests pass"
- ❌ "No errors in console"
- ❌ "Module imports correctly"
- ❌ "Check that X is implemented"

These are unit tests, not human verification.

### Demo Command Examples

**Backend/API task:**
```
TEST 1: API returns user data
1. Run: npm run demo:api
EXPECTED: Terminal shows:
  GET /users → [{"id": 1, "name": "Test User"}]
  POST /users → {"created": true, "id": 2}
```

**Physics engine task:**
```
TEST 1: Gravity simulation works
1. Run: npm run demo:physics  
EXPECTED: Terminal shows:
  Frame 1: Ball at y=0, velocity=0
  Frame 10: Ball at y=45, velocity=9.8
  Frame 20: Ball at y=180, velocity=19.6
```

**UI task:**
```
TEST 1: Login page works
1. Run: npm run demo:auth
2. Browser opens to login page
EXPECTED: 
  - Email and password fields visible
  - "Sign In" button clickable
  - Test login succeeds, shows "Welcome!"
```

---

## Mandatory Format

Every HITL test file MUST follow this exact structure:

```
================================================================================
HITL VERIFICATION: Task [ID] - [TITLE]
================================================================================
File: .tdd/output/hitl-verify/task-[ID].txt
================================================================================

Tester: ________________    Date: ________________

PREREQUISITES
──────────────────────────────────────────────────────────────────────────────
Run this command and wait for the output shown:

  $ npm run dev

Wait for: "Ready on http://localhost:3000"

Ready to proceed?  [ ] Yes  [ ] No - Issue: ___________________________________

================================================================================
TEST 1: [Descriptive Name]
================================================================================

PURPOSE
  What we're testing: [Brief description of the feature/behavior]
  Why this matters:   [Business value or user impact]

STEPS
  1. [Exact action - Go to URL, Click button, Type text]
  2. [Next action]
  3. [Continue until complete]

EXPECTED RESULT
  You should see: [Exact visual output, message, or behavior]

──────────────────────────────────────────────────────────────────────────────
VERIFICATION

  Did the expected result occur?     [ ] YES  [ ] NO

  If NO, what happened instead?
  _____________________________________________________________________________
  _____________________________________________________________________________

  Screenshots/Notes:
  _____________________________________________________________________________

================================================================================
TEST 2: [Next Test Name]
================================================================================

[Repeat the same structure...]

================================================================================
SUMMARY
================================================================================

File: .tdd/output/hitl-verify/task-[ID].txt
Total Tests: ___    Passed: ___    Failed: ___

Overall Result:  [ ] PASS - All tests passed
                 [ ] FAIL - One or more tests failed

──────────────────────────────────────────────────────────────────────────────
IF PASS - Copy this EXACTLY to your agent chat:
──────────────────────────────────────────────────────────────────────────────

✅ HITL VERIFICATION PASSED
File: .tdd/output/hitl-verify/task-[ID].txt
Task: [ID] - [TITLE]
Tests: [X]/[X] passed
Result: APPROVED

Please run: npx task-master set-status --id=[ID] --status=done

┌─────────────────────────────────────────────────────────────┐
│ NEXT: Copy '.tdd/user/B-SETUP-SESSION.txt' to start next   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────────────────────
IF FAIL - Copy this EXACTLY to your agent chat (fill in the blanks):
──────────────────────────────────────────────────────────────────────────────

❌ HITL VERIFICATION FAILED
File: .tdd/output/hitl-verify/task-[ID].txt
Task: [ID] - [TITLE]
Tests: [X]/[X] passed

FAILED TESTS:
- TEST [X]: Expected "[expected]" but saw "[actual]"
- [Add more if needed]

Please fix these issues and regenerate the HITL test.

┌─────────────────────────────────────────────────────────────┐
│ NEXT: Wait for agent to fix, then re-run verification      │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────────────────────

Verified by: ________________    Date: ________________    Signature: ________
```

---

## Detailed Section Guide

### PREREQUISITES Section

Always include:
1. **Exact command** to start the application
2. **What to wait for** before proceeding
3. **Readiness check** with space for issues

```
PREREQUISITES
──────────────────────────────────────────────────────────────────────────────
Run this command and wait for the output shown:

  $ npm run dev

Wait for: "Ready on http://localhost:3000"

Ready to proceed?  [ ] Yes  [ ] No - Issue: ___________________________________
```

### TEST Section Structure

Each test MUST have these parts:

#### PURPOSE (Why are we testing this?)
```
PURPOSE
  What we're testing: User can log in with valid credentials
  Why this matters:   Core authentication - users can't access app without this
```

#### STEPS (Exactly what to do)
```
STEPS
  1. Go to: http://localhost:3000/login
  2. Type: "test@example.com" into the "Email" field
  3. Type: "SecurePass123!" into the "Password" field
  4. Click: "Sign In" button
```

#### EXPECTED RESULT (What success looks like)
```
EXPECTED RESULT
  You should see: 
  - URL changes to /dashboard
  - "Welcome back, Test User!" message appears at top
  - Navigation menu shows "Dashboard", "Profile", "Logout"
```

#### VERIFICATION (Document the actual result)
```
VERIFICATION

  Did the expected result occur?     [ ] YES  [ ] NO

  If NO, what happened instead?
  _____________________________________________________________________________

  Screenshots/Notes:
  _____________________________________________________________________________
```

---

## BANNED Phrases

You MUST NOT use these vague phrases:

| ❌ BANNED | ✅ USE INSTEAD |
|-----------|----------------|
| "Verify the feature works" | Specific STEPS + EXPECTED RESULT |
| "Check if it loads correctly" | "You should see: [exact content]" |
| "Ensure proper functionality" | List exact behaviors to observe |
| "Test the component" | "Click [X]. You should see [Y]" |
| "Works as expected" | Describe the EXACT expected output |
| "The user should be able to..." | Write the exact STEPS to do it |
| "Confirm successful" | "You should see: '[exact message]'" |

---

## REQUIRED Elements

Every test MUST include:

| Element | Requirement |
|---------|-------------|
| PURPOSE | Both "What we're testing" AND "Why this matters" |
| STEPS | Numbered, with exact URLs, exact button text, exact input values |
| EXPECTED RESULT | Specific observable outcome (text, visual change, URL) |
| VERIFICATION | Checkbox for YES/NO + space for failure notes |

---

## Complete Example

```
================================================================================
HITL VERIFICATION: Task 14 - User Profile Page
================================================================================
File: .tdd/output/hitl-verify/task-14.txt
================================================================================

Tester: ________________    Date: ________________

PREREQUISITES
──────────────────────────────────────────────────────────────────────────────
Run this command and wait for the output shown:

  $ npm run dev

Wait for: "Ready on http://localhost:3000"

Ready to proceed?  [ ] Yes  [ ] No - Issue: ___________________________________

================================================================================
TEST 1: Profile page loads
================================================================================

PURPOSE
  What we're testing: The /profile route exists and displays user information
  Why this matters:   Users need to view their account details

STEPS
  1. Open your browser
  2. Go to: http://localhost:3000/profile

EXPECTED RESULT
  You should see:
  - "My Profile" as the page heading
  - User's name displayed
  - User's email displayed
  - "Edit Profile" button visible

──────────────────────────────────────────────────────────────────────────────
VERIFICATION

  Did the expected result occur?     [ ] YES  [ ] NO

  If NO, what happened instead?
  _____________________________________________________________________________
  _____________________________________________________________________________

  Screenshots/Notes:
  _____________________________________________________________________________

================================================================================
TEST 2: Edit profile saves changes
================================================================================

PURPOSE
  What we're testing: Users can update their display name
  Why this matters:   Personalization is a core feature

STEPS
  1. Go to: http://localhost:3000/profile
  2. Click: "Edit Profile" button
  3. Clear the "Display Name" field
  4. Type: "New Test Name" into "Display Name" field
  5. Click: "Save Changes" button

EXPECTED RESULT
  You should see:
  - Green success message: "Profile updated successfully"
  - Display Name field now shows "New Test Name"
  - "Edit Profile" button visible again (form closes)

──────────────────────────────────────────────────────────────────────────────
VERIFICATION

  Did the expected result occur?     [ ] YES  [ ] NO

  If NO, what happened instead?
  _____________________________________________________________________________
  _____________________________________________________________________________

  Screenshots/Notes:
  _____________________________________________________________________________

================================================================================
TEST 3: Profile validates empty name
================================================================================

PURPOSE
  What we're testing: Form validation prevents empty display name
  Why this matters:   Data integrity - names shouldn't be blank

STEPS
  1. Go to: http://localhost:3000/profile
  2. Click: "Edit Profile" button
  3. Clear the "Display Name" field completely (leave it empty)
  4. Click: "Save Changes" button

EXPECTED RESULT
  You should see:
  - Red error message: "Display name is required"
  - Form does NOT close
  - Original name is preserved (not saved as blank)

──────────────────────────────────────────────────────────────────────────────
VERIFICATION

  Did the expected result occur?     [ ] YES  [ ] NO

  If NO, what happened instead?
  _____________________________________________________________________________
  _____________________________________________________________________________

  Screenshots/Notes:
  _____________________________________________________________________________

================================================================================
SUMMARY
================================================================================

File: .tdd/output/hitl-verify/task-14.txt
Total Tests: 3      Passed: ___    Failed: ___

Overall Result:  [ ] PASS - All tests passed
                 [ ] FAIL - One or more tests failed

──────────────────────────────────────────────────────────────────────────────
IF PASS - Copy this EXACTLY to your agent chat:
──────────────────────────────────────────────────────────────────────────────

✅ HITL VERIFICATION PASSED
File: .tdd/output/hitl-verify/task-14.txt
Task: 14 - User Profile Page
Tests: 3/3 passed
Result: APPROVED

Please run: npx task-master set-status --id=14 --status=done

┌─────────────────────────────────────────────────────────────┐
│ NEXT: Copy '.tdd/user/B-SETUP-SESSION.txt' to start next   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────────────────────
IF FAIL - Copy this EXACTLY to your agent chat (fill in the blanks):
──────────────────────────────────────────────────────────────────────────────

❌ HITL VERIFICATION FAILED
File: .tdd/output/hitl-verify/task-14.txt
Task: 14 - User Profile Page
Tests: ___/3 passed

FAILED TESTS:
- TEST [X]: Expected "[expected]" but saw "[actual]"

Please fix these issues and regenerate the HITL test.

┌─────────────────────────────────────────────────────────────┐
│ NEXT: Wait for agent to fix, then re-run verification      │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────────────────────

Verified by: ________________    Date: ________________    Signature: ________
```

---

## Generation Rules for Agents

1. **Read the task description** - Understand what was built
2. **Identify all user-facing changes** - Routes, buttons, forms, displays
3. **Create one TEST per distinct behavior** - Don't combine unrelated checks
4. **Include PURPOSE for every test** - "What" AND "why"
5. **Write STEPS a non-developer can follow** - Assume zero prior knowledge
6. **Describe EXPECTED RESULT precisely** - Exact text, exact visual elements
7. **Always include VERIFICATION section** - The checkbox and notes space

---

## File Naming

Save all HITL tests to: `.tdd/output/hitl-verify/task-[ID].txt`

Example: `.tdd/output/hitl-verify/task-14.txt`
