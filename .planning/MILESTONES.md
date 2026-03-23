# JobScout Milestones

**Generated:** 2026-03-22  
**Project:** JobScout — Cockpit v1.0  
**Pilot:** Kansas City

---

## M001 — Cockpit v1.0

**Goal:** Complete the core JobScout cockpit — unified lifecycle, tightened triage, workspace layer, pipeline rules, and artifacts.

**Status:** 🟡 In Progress

**Why this milestone exists:**
The cockpit shell is live but built on a fractured data model. `Application.status` and `Workspace.status` both carry lifecycle state with no single authority. Multiple surfaces (Pipeline, Inbox, Resume Builder, Cockpit) query different tables for the same state. Discovery and Pipeline are disconnected. This milestone resolves all five phases into a coherent, trustworthy cockpit.

**Constraints:**
- Additive-only migrations — never destructive to existing data
- Existing Workspace / Application / Resume rows must survive all changes
- Schema-sensitive phases require architect pass before coding
- KC pilot (Richard Ruiz) is the UAT test user throughout

---

### Phase 1 — Unified Opportunity Lifecycle ⬅ START HERE

**Goal:** One source of truth for lifecycle state. Workspace wins.

**Problem:** `Application.status` and `Workspace.status` both carry lifecycle meaning. The cockpit, pipeline, and inbox all query different tables for the same state, producing inconsistencies.

**Tasks:**
- [x] P1-1: Audit all surfaces that read or write lifecycle state (Application vs Workspace)
- [x] P1-2: Declare Workspace as the single lifecycle authority — document the contract
- [x] P1-3: Deprecate / shadow Application.status (make it a read-only computed mirror, additive)
- [x] P1-4: Rename PREP → CRAFTING everywhere in code and UI
- [x] P1-5: Verify save / pass / restore / craft / apply all route through Workspace status only
- [x] P1-6: Smoke test: no surface can produce a conflicting status between Application and Workspace

**Done when:** Moving an opportunity in any surface (cockpit, pipeline, inbox, swipe) produces one consistent state visible everywhere.

---

### Phase 2 — Discovery & Triage

**Goal:** Inbox and JobSwipe share one discovery set. Triage is batch-capable. PASS is recoverable. Mobile-safe.

**Tasks:**
- [x] P2-1: Confirm Inbox and JobSwipe draw from the same active discovery query
- [x] P2-2: JobSwipe right-swipe shows a clear `Saved` / `Interested` confirmation (card doesn't just vanish)
- [x] P2-3: JobSwipe bottom actions: `Pass` + `Interested`, remove redundant dismiss X, move `Details` off row
- [x] P2-4: Inbox multi-select: layout cleanup + stronger bulk-selection affordances
- [x] P2-5: Inbox wording cleanup: source labels, company actions, match-score explanation
- [x] P2-6: PASSED bin: confirm it's non-destructive and shows restore path (already partially shipped)
- [x] P2-7: Mobile controls never obscure primary actions (dock + sidebar never appear simultaneously)

**Done when:** A user can discover, triage, save, and pass jobs from both Inbox and JobSwipe, see a clear confirmation, recover any pass, and do bulk actions — all without mobile layout conflicts.

---

### Phase 3 — Workspace Layer

**Goal:** Every opportunity has exactly one workspace. Stage journals replace flat notes. Workspace is the canonical home for everything.

**Tasks:**
- [ ] P3-1: Verify one-workspace-per-opportunity enforcement (no orphans, no duplicates)
- [ ] P3-2: Stage journals: notes are tagged to the stage they were written in, preserved as opp moves
- [ ] P3-3: Workspace expands in-place from pipeline card (no separate page navigation required)
- [ ] P3-4: Workspace is the canonical home for: notes, blockers, contacts, artifacts
- [ ] P3-5: BlockNote as universal notes engine across all stages (replace plain textareas)

**Done when:** Clicking any opportunity anywhere opens one consistent workspace in-place. Notes written in INTERESTED are still visible (tagged) after moving to CRAFTING.

---

### Phase 4 — Pipeline Movement Rules

**Goal:** Only allowed transitions are available. CRAFTING→APPLIED requires a submission package. Reversions require explicit correction flow.

**Tasks:**
- [ ] P4-1: Define the full allowed-transition matrix (per cockpit-stage-contract.md)
- [ ] P4-2: Stage toolbar per stage — shows only legal forward/back actions
- [ ] P4-3: INTERESTED ↔ CRAFTING: free drag (no gate)
- [ ] P4-4: CRAFTING → APPLIED: requires submission package (explicit action, triggers snapshot)
- [ ] P4-5: Later-stage reversions: explicit correction dialog (not silent drag)
- [ ] P4-6: OFFER → ACCEPTED: confirmation dialog + wind-down prompt

**Done when:** A user cannot accidentally skip the submission gate. All transitions are explicit and logged.

---

### Phase 5 — Artifacts & Application Events

**Goal:** Drafts live in workspace. Submitted artifacts are immutable snapshots. Application events record when/where/how.

**Tasks:**
- [ ] P5-1: Capture the exact submitted resume artifact on apply (immutable snapshot in workspace)
- [ ] P5-2: Application events: record timestamp, channel, method for each submission
- [ ] P5-3: Resume generation, saving, and applying all attach to the same opportunity/workspace
- [ ] P5-4: Voice presets and opportunity-level AI guidance plug into the resume input contract
- [ ] P5-5: Master Data import review: field-level accept/reject before merge

**Done when:** After applying to a job, the system records exactly what was sent, when, and to whom. The workspace shows the immutable snapshot. Nothing can overwrite it.

---

## Milestone Complete When

All five phases pass their "Done when" criteria and the KC pilot user can:
1. Discover and triage jobs in one coherent flow
2. Move an opportunity from NEW → OFFER with full context preserved at every stage
3. Submit an application with a captured immutable resume snapshot
4. Return days later and see exactly where every opportunity stands, with no conflicting state
