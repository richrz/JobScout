# JobScout Development Journal

> A chronological record of strategic decisions, pivots, and progress. Read this to understand *why* things are the way they are.

---

## 2026-03-06 — Opportunity Lifecycle Contract

### Context
We moved from loose brainstorming to a binding product contract for how an opportunity moves through the system. The goal was to stop Inbox, JobSwipe, Pipeline, Resume Builder, and Workspace from feeling like separate products.

### Decisions Made
1. **One lifecycle now governs the whole app** for the canonical `Opportunity` object:
   - `NEW`
   - `INTERESTED`
   - `PREP`
   - `APPLIED`
   - `SCREENING`
   - `INTERVIEW`
   - `OFFER`
   - `PASSED`
   - `REJECTED`
   - `WITHDRAWN`
   - `ARCHIVED`
2. **JobSwipe is officially a view mode of Inbox**, not its own feed universe.
3. **Pipeline begins at `INTERESTED`** and should reflect shared opportunity state instead of inventing a separate one.
4. **`PASSED` is now a recoverable holding state** with a 90-day default retention window and restore-to-prior-state behavior.
5. **Documents are universal workspace artifacts**:
   - drafts stay editable
   - submitted application docs become immutable snapshots

### Documentation System Work
- Added the binding product spec: `docs/product/lifecycle-state-contract.md`
- Added ADR:
  - `005-opportunity-lifecycle-state-contract.md`
- Updated the docs hub and product index with a recommended reading order so the active source of truth is easier to follow.
- Updated the lifecycle concept doc so it now points to the accepted contract instead of drifting beside it.

### Why This Matters
This is the first clear answer to the question:
> "What is the official lifecycle of a job card?"

Answer:
- it is an `Opportunity`
- it owns one `Workspace`
- every major app surface now has a shared contract for how that opportunity moves, stores notes, and carries documents forward

This should reduce future thrash and make implementation decisions easier to judge against one product truth.

---

## 2026-03-06 — Documentation Rationalization Pass

### Context
Before beginning the next large product update, we stopped to clean up the repository documentation so active specs would stop competing with stale plans, handoffs, and one-off execution notes.

### Decisions Made
1. **The docs spine was reinforced**:
   - `docs/README.md` is the canonical hub
   - `docs/decisions/` holds binding decisions
   - `docs/product/` holds active product specs
   - `JOURNAL.md` remains the chronological memory
2. **Historical materials were explicitly separated** instead of left mixed into active navigation.
3. **The root README was rewritten** to reflect the actual repository instead of a confusing TDD starter-kit identity.
4. **The normalization contract status was aligned** with ADR 003 so the docs no longer disagree about whether it is adopted.

### Documentation Cleanup Work
- Added `docs/archive/README.md` to explain how historical docs are organized and how they should be used.
- Reclassified the PRD as an umbrella reference document rather than the day-to-day binding spec.
- Marked the redesign plan as a working reference rather than silent truth.
- Removed outdated bootstrap memory from the active product docs path.
- Archived older handoff, overhaul, remediation, and implementation-plan materials into explicit archive lanes.
- Surfaced previously orphaned but still-useful reference docs such as the design system note, resume language spec, and functional test plan.

### Why This Matters
This gives the repo a clearer answer to:
> "Which docs should we trust before we start building?"

Answer:
- the hub
- the ADRs
- the active product contracts
- the journal for chronology

Everything else is supporting context or history.

---

## 2026-03-06 — Canonical Implementation Roadmap

### Context
After rationalizing the documentation system, the remaining gap was implementation ambiguity: multiple plans still existed, but none clearly translated the new lifecycle and normalization contracts into one build order.

### Decisions Made
1. **A single canonical implementation roadmap now exists** for the next major update.
2. **The roadmap is anchored to accepted product truth**:
   - opportunity/workspace naming
   - lifecycle state contract
   - normalization contract
3. **Older redesign plans were demoted to supporting references** instead of being allowed to silently compete.
4. **KC scraper docs remain active**, but only as workstream-specific references rather than the top-level implementation plan.

### Roadmap Shape
The active execution sequence is now:
1. unify the opportunity state model
2. tighten Inbox and the passed bin
3. build the workspace layer
4. make pipeline movement truthful
5. unify artifacts and application events
6. harden normalization and source refresh
7. polish and verify the full flow

### Why This Matters
This gives the project one answer to:
> "What should we build next, and in what order?"

That should make the next update more disciplined and reduce the risk of rebuilding UI on top of fuzzy state.

---

## 2026-03-06 — Opportunity/Workspace Standard + Documentation Spine

### Context
We paused feature thrash and focused on product language and documentation integrity so future work does not keep looping on naming and architecture ambiguity.

### Decisions Made
1. **Canonical naming was locked:**
   - `Opportunity` = the job object itself.
   - `Workspace` = the Notion-like operating area tied to one opportunity.
   - `Stage Journal` = stage-specific context inside the workspace.
2. **Normalization policy was formalized:** direct providers only in production for normalization calls (`OpenAI` / `Google`), deterministic-first pipeline, selective LLM enrichment.
3. **Geocoding is explicitly deferred** to v.next; not required for current normalization contract.

### Documentation System Work
- Added a **docs hub**: `docs/README.md` as the canonical entry point.
- Added a **product docs index**: `docs/product/README.md`.
- Added ADRs:
  - `003-normalization-contract-and-provider-policy.md`
  - `004-opportunity-workspace-naming.md`
- Updated `docs/decisions/README.md` index for ADR 001-004 continuity.
- Updated product concept docs to align with Opportunity/Workspace terminology.

### Why This Matters
This creates a single documentation spine:
- Start at `docs/README.md`
- Follow ADR index for binding decisions
- Follow product index for active product specs

It reduces drift between UI language, implementation conversations, and future architecture changes.

---

## 2026-03-04 — The KC Scraper Pivot

### Context
Discovered [itcompaniesnepal.com/jobs](https://itcompaniesnepal.com/jobs) — a solo dev scraping 926 company career pages in Nepal and aggregating them into a clean job board. Decided to replicate this approach for the **Kansas City metro area** (both MO and KS sides) as a new data source for the existing platform.

### Key Decisions Made
1. **No new branding or separate app.** KC scraped jobs funnel into the existing `job-search-platform` as another pipeline source alongside the JSearch API. Think of it as "bought data" vs "scraped data" — both land in the same `Job` table.
2. **IT/Tech jobs at ALL employers** — not just tech companies. Hospitals, government, schools, banks — anyone with a career page. Filter for IT relevance at the LLM extraction layer.
3. **Volume is a feature.** The more jobs we scrape, the more overwhelming the raw feed — which makes our filtering, triage, and workspace tools indispensable. This justifies the subscription price.
4. **Gemini 3.1 Flash-Lite** for structured extraction.
5. **Dual-pipeline architecture:** Pipeline A (API) + Pipeline B (scraped) → shared Normalizer → same DB.
6. **Fingerprint-based deduplication** with fuzzy similarity fallback.
7. **Polite scraping strategy:** Aggressive initial seed, then polite delta runs.

### What I Was Feeling
> "I'm getting lost in features." — Richard, 2026-03-04

This is real. The project has accumulated a lot of vision docs, PRDs, and architectural plans from different sessions. This journal entry and the accompanying document sweep are an attempt to consolidate and ground everything.

### Reference Documents Created
- `docs/kc-scraper-plan.md` — Full implementation plan for the scraper engine
- `kc_job_board_analysis.md` (brain artifact) — Deep analysis of the Nepal reference site
- `kc_target_companies.md` (brain artifact) — Initial seed list of KC tech companies

### Open Questions
- Should we add a "community submit" flow where users can suggest companies to add?
- At what point does the KC focus expand to other cities?
- What's the optimal ratio of scraped vs API jobs for maximizing perceived value?

---

## 2026-03-05 — The Great Bug Smash & Filter Wiring

### Context
Attempted a demo the night before (Mar 4) on a second PC over WiFi. Almost nothing interactive worked — filters were cosmetic, search bars did nothing, dropdowns were decorative, the dashboard was 100% hardcoded fake data. Time to fix it all.

### Demo & Network Access
- Configured `NEXTAUTH_URL` to the LAN IP (`http://10.0.0.252:3480`) so NextAuth cookies work on the second PC.
- Opened port 3480 in `ufw` — it was blocked by the firewall.
- Added **⚡ Dev Auto-Login** button on sign-in page for one-click testing as `dev@localhost`.
- Hid the Google OAuth button (doesn't work on local IP).
- Discovered another Antigravity workspace was killing our dev server with `pkill -f "next dev"`. Added multi-project safety rules to `AGENTS.md`.

### Filters & Search — The Core Fix
**Root cause:** Every filter/search component used `useState` locally but never pushed state to URL params, so the server-rendered page never saw them.

**What was fixed:**
1. **`JobSearchInput.tsx`** [NEW] — Debounced search bar (400ms), pushes `?q=` to URL. Searches title, company, AND description.
2. **`JobsFilterSidebar.tsx`** [REWRITTEN] — All filters now push to URL:
   - Job Type → `?type=Full-time,Contract`
   - Location → `?loc=Remote`
   - Experience → `?exp=Senior Level`
   - Salary slider → `?salaryMin=80&salaryMax=180` (debounced 300ms)
   - "Clear All" resets URL, preserves sort
3. **`/jobs/page.tsx`** [REWRITTEN] — Server component now reads all filter params, builds Prisma `AND` conditions, preserves filters in pagination URLs. "Reset Filters" button is now a `<Link href="/jobs">`.
4. **`JobSortSelect.tsx`** — Added "Best Match" and "Lowest Match" sort options (uses `compositeScore`).

### Dashboard Cleanup
- Removed ALL fake data: Spotify/Airbnb/Notion jobs, fake activity stream (Google resume view, Figma application), fake interview widget with Sarah Connors.
- Removed out-of-scope buttons: "Practice Interview", "Track App".
- Added `/api/dashboard/stats` route — fetches real counts (jobs in inbox, pipeline, swipe queue).
- Dashboard metrics now pull live data from the DB.
- Search bar on dashboard now navigates to `/jobs?q=<query>` on Enter.
- Added 10 rotating quotes attributed to **Richard A. Ruiz** 😂 — random one shown each page load.

### Architecture Insight
Clarified the intended data flow:
> **Inbox** (browse/filter the full catalog) → **JobSwipe** (rapid triage: save or dismiss) → **Pipeline** (Kanban tracker for applications through stages)

JobSwipe currently runs off its own independent feed. Future work: wire it to respect Inbox filters so the swiping experience is pre-filtered.

### Files Changed
- `src/components/jobs/JobSearchInput.tsx` [NEW]
- `src/components/jobs/JobsFilterSidebar.tsx` [REWRITTEN]
- `src/components/jobs/JobSortSelect.tsx` [MODIFIED]
- `src/app/jobs/page.tsx` [REWRITTEN]
- `src/app/dashboard-v2/page.tsx` [REWRITTEN]
- `src/app/api/dashboard/stats/route.ts` [NEW]
- `src/app/auth/signin/page.tsx` [MODIFIED — dev auto-login, hid Google button]
- `AGENTS.md` [MODIFIED — multi-project safety rules]

---

## 2026-03-06 — Opportunity State Sync Foundation

### Context
Started Phase 1 of the larger lifecycle cleanup. The immediate goal was not to redesign the whole product yet, but to stop Inbox, JobSwipe, Pipeline, and Resume Builder from each writing their own partial version of the truth.

### What Changed
- Added a shared opportunity state sync layer so overlapping lifecycle writes now update both the legacy `Application` record and the newer `Workspace` record together.
- Routed the main save/apply paths through that shared sync layer:
  - Inbox save / unsave
  - JobSwipe save / pass
  - batch triage actions
  - manual pipeline add
  - workspace apply flow
  - application status updates
- Tightened destructive behavior:
  - Inbox can no longer casually “unsave” or dismiss opportunities that are already truly active in the pipeline.
  - Dismiss remains available for lightweight pre-pipeline states while we design the proper passed-bin / purgatory model.
- Fixed Resume Builder data ownership bugs:
  - the target-job dropdown now includes opportunities surfaced through `Workspace.INTERESTED`
  - resume read/save uses the signed-in user instead of `findFirst()` on the users table

### Why This Matters
This is the first real step toward a canonical `Opportunity` lifecycle without ripping out the legacy pipeline model all at once. It gives us a safer bridge state:
- save in JobSwipe now shows up in Pipeline
- that same opportunity also shows as saved in Inbox
- Resume Builder sees the same interested opportunity set

### Live Verification
- Saved an opportunity from JobSwipe in the browser.
- Confirmed it appeared in Pipeline immediately.
- Confirmed it appeared in the Resume Builder target-job dropdown.
- Confirmed the same opportunity read back as `Interested` in Inbox.

### Still Not Solved
- Pipeline is still primarily driven by the legacy `Application` model.
- There is still no formal passed-bin / recycle / restore workflow.
- Transition rules between stages are still loose and need the next architecture pass.

---

## 2026-03-06 — Recovery Model And Packaging Direction Locked

### Context
We needed to stop hand-waving around recycle bin, archive, deletion, and plan design. The bigger insight was that raw job volume is a weak pricing lever for this product, especially while application submission still includes real-world email and external-site choke points.

### What Was Decided
- `PASSED`, `ARCHIVE`, `TRASH`, and support-level recovery are now treated as separate concepts.
- Normal user behavior should not hard-delete opportunities.
- The primary commercial count lever should be `Managed Opportunities`, not raw discovery volume.
- The mid-tier should likely win on richer workspace tooling, stronger recovery, and deeper system memory rather than simply "more jobs."

### Why This Matters
This gives the product a much cleaner long-term story:
- discovery can stay broad and useful
- recovery can feel trustworthy
- pricing can align with real workflow value
- the workspace becomes the center of gravity instead of a side feature

### Reference Docs Created
- `docs/product/recovery-and-plan-levers.md`
- `docs/decisions/006-recovery-buckets-and-plan-levers.md`

### Intentionally Still Open
- exact plan limits
- exact retention windows by tier
- whether archive eventually gets a soft quota

---

## Earlier History

> *Note: This journal was started on 2026-03-04. Earlier project history can be pieced together from git log, the PRD, and docs in `/docs/`.*

### Key Milestones (Pre-Journal)
- **Nov 2025**: Project inception. PRD written. Core vision: AI-powered job search CRM.
- **Dec 2025**: "Prism" UI overhaul planned. Data pipeline architecture designed. LLM provider abstraction built (OpenAI, Anthropic, Gemini, Ollama, OpenRouter, Azure).
- **Jan 2026**: Product Owner "Sisyphus" persona established. Market research on ageism in hiring completed. Triage feed, workspace, and resume builder implemented.
- **Feb 2026**: JSearch API integration completed. Geographic heatmap built. Landing site created.
- **Mar 2026**: KC scraper pivot (this entry).
