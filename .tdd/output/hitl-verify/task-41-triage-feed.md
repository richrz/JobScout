# HITL Verification: Task 41 - Triage Feed Implementation

**Task ID:** 41  
**Feature:** Triage Feed (Inbox Zero workflow)  
**Status:** Awaiting Human Verification  

---

## Prerequisites

1. Dev server running on `http://localhost:3000`
2. Database seeded with jobs for your account
3. Browser ready

---

## Setup Steps

### 1. Seed Your Account (if not already done)

```bash
cd job-search-platform
npx tsx scripts/seed-triage.ts rruiz@deskwise.io
```

**Expected output:**
- ✅ User updated/created: rruiz@deskwise.io
- ✅ Seeded 5 jobs
- Password: password123

---

## Verification Steps

### Step 1: Sign In
1. Navigate to: `http://localhost:3000/auth/signin`
2. Enter credentials:
   - Email: `rruiz@deskwise.io`
   - Password: `password123`
3. Click "Sign In"

**✓ Pass Criteria:**
- Successfully redirected to dashboard
- No error messages

---

### Step 2: Navigate to Triage Feed
1. Go to: `http://localhost:3000/triage`

**✓ Pass Criteria:**
- Page loads without errors
- Gradient header shows "Job Triage"
- Description text: "Swipe right to save interesting jobs, left to pass. Reach Inbox Zero!"

---

### Step 3: Verify Job Cards Display
**✓ Pass Criteria:**
- At least one job card is visible
- Card shows:
  - Job title (e.g., "Frontend Developer - React")
  - Company name (e.g., "TechFlow")
  - Location
  - Description (truncated)
  - Salary badge (if available)
  - Posted date badge
  - Source badge
- Two action buttons visible below the card:
  - Left button: Red X (Pass/Dismiss)
  - Right button: Green Check (Save/Interested)

---

### Step 4: Test "Pass" Action
1. Click the **X button** (left, red)
2. Wait 1 second

**✓ Pass Criteria:**
- Card disappears/slides away
- Next card appears (if available)
- No error in console
- Page doesn't crash

---

### Step 5: Test "Save" Action
1. Click the **Check button** (right, green)
2. Wait 1 second

**✓ Pass Criteria:**
- Card disappears/slides away
- Next card appears (if available)
- No error in console
- Page doesn't crash

---

### Step 6: Process All Remaining Cards
1. Continue clicking Pass or Save on each remaining card
2. Process until no cards are left

**✓ Pass Criteria:**
- All cards can be processed
- No UI freezing or errors

---

### Step 7: Verify "Inbox Zero" State
After processing all cards:

**✓ Pass Criteria:**
- "Inbox Zero!" heading is visible
- Message: "You've triaged all available jobs. Great work! Check back later for new opportunities."
- "Check Again" button is visible
- Inbox icon is displayed

---

### Step 8: Verify Data Persistence
1. Click the "Check Again" button
2. Observe the feed

**✓ Pass Criteria:**
- Still shows "Inbox Zero" (jobs you processed should NOT reappear)
- No errors

---

### Step 9: Verify Database State (Optional)
Run diagnostic:
```bash
npx tsx scripts/check-triage.ts
```

**✓ Pass Criteria:**
- Shows "Jobs available for triage: 0"
- Or shows only jobs you haven't interacted with yet

---

## Sign-Off

**Tester:** ___________________  
**Date:** ___________________  
**Result:** [ ] PASS  [ ] FAIL  

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

---

## Troubleshooting

### No jobs showing?
```bash
npx tsx scripts/seed-triage.ts rruiz@deskwise.io
```

### Cards not clickable?
- Check browser console for errors
- Verify dev server is running
- Try hard refresh (Ctrl+Shift+R)

### "Inbox Zero" shows immediately?
- Run `npx tsx scripts/check-triage.ts` to verify jobs exist
- You may have already processed all jobs - reseed to test again
