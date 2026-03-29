# Current Pointer

**Status:** Active  
**Purpose:** Live baton-pass file for the next agent

## Branch

- `main`

## Latest Product Checkpoint

- `pending local checkpoint` — cockpit discovery now treats `NEW` as the personalized KC match pool for this user’s background (fit-first, then freshness), removes the 50-card dashboard cap, keeps the kanban readable with a fixed four-card-tall grab-to-scroll lane so the workspace stays in view, improves kanban card readability, and aligns analytics / drawer stage mappings with the current lifecycle (`SCREENING`, `INTERVIEW`, `OFFER`)
- `pending local checkpoint` — made JobSwipe easier to read: switched the app shell to a more legible sans font stack, expanded triage description preview spacing, and added a `Read full description` dialog with a scrollable body so long postings no longer die in an ellipsis wall
- `42993b9` — upgraded workspace notes input to BlockNote rich text editor: slash commands, inline formatting, drag-to-reorder, per-opportunity reset via key prop; end-to-end verified (compose → save → persist → display)
- `1a50c76` — stage browser drawer + header simplification: clicking a kanban column header opens a right-side drawer listing all opps in that stage; selecting from the drawer closes it and opens the workspace; header simplified with inline WYWO stats; RecentActivityRail moved to bottom "Jump Back In" section
- `0a2afaa` — integrated Google Cloud Talent Solution for semantic job search (code shipped, awaiting GCP setup — see `docs/todo.md`)
- `93dd298` — migrated T-shape visual architecture into production cockpit: grid-cols-7 kanban, animated shoulder segments, stage toolbar with transition verbs wired to PATCH API
- `83dbeaf` — T-shape cockpit wireframe + live pipeline data via `useCockpitPipeline` hook
- `pending local checkpoint` — formalized the cockpit stage contract at `docs/product/cockpit-stage-contract.md`: all 7 stages now have explicit inbound/work/outbound definitions, stage toolbars, BlockNote as universal notes engine, cross-stage "warn and move" editing rules, drawer pattern for heavy editors (Resume Studio etc.), and artifact lifecycle (creation, visibility, immutability, versioning). Docs hub and product index updated to point to the new spec.
- `752d142` — cockpit prototype pass 4 on `/dashboard-cockpit-prototype`: removed light editor tones, enforced dark-mode workspace, promoted selected-opportunity header prominence (company + large role title), and made browser mode explicit with "Select an opportunity below" guidance
- `463b7d9` — cockpit prototype pass 3 on `/dashboard-cockpit-prototype`: strong stage-lane glow while browsing, browser/workspace fill separation, no river return-flight animation, collapsible stage sections, and a much larger active rich-text workspace area
- `pending local checkpoint` — applies cockpit prototype pass 2 surface differentiation on `/dashboard-cockpit-prototype`: river stays light and map-like, stage browser becomes a filled selector tray, workspace becomes a solid dossier surface, and the shared identity blocks now use real fills instead of outline-only differentiation
- `abe654e` — redesigns `/dashboard-cockpit-prototype` into the approved two-surface mock: stable river on top, a dual-purpose lower surface that switches between selected-opportunity workspace and full-width stage browser, direct river-card workspace opens, stage-header browser opens, `Close`/`Esc` browser exit, and shared-element identity motion between stage -> browser -> workspace
- `pending local checkpoint` — rebuilds `/dashboard-cockpit-prototype` around the clarified cockpit model: river as the full cross-stage kanban, individually selectable opportunities, and one persistent workspace below where past/current/next/future stage sections all belong to the same opportunity
- `pending local checkpoint` — stabilizes cockpit `CRAFTING` rewrite completion timing with a hard timeout and profile-based fallback draft path so rewrites no longer hang indefinitely; browser proof now includes a completed staged rewrite with narrative diffs visible
- `pending local checkpoint` — deepens cockpit `CRAFTING` review into richer per-role narrative diffs and expands BlockNote from summary-only to targetable summary/role narrative editing with explicit write-back controls
- `pending local checkpoint` — adds granular inline diff review in cockpit `CRAFTING` (summary wording diff + experience bullet-level diff) and embeds BlockNote as a deep in-cockpit summary editor with explicit load/apply controls
- `1cbb710` — turns staged cockpit `CRAFTING` rewrites into a real section-by-section review flow so `summary`, `skills`, and `experience` can each keep current content or take the staged rewrite before apply; live browser proof now shows mixed acceptance inside `/dashboard-wireframe`
- `pending local checkpoint` — hardens the cockpit `CRAFTING` rewrite parser so malformed model JSON is repaired into a structured staged draft instead of collapsing raw response text into the opening summary; browser proof now shows a previously polluted summary being replaced by a normal rewritten summary in-panel
- `pending local checkpoint` — cleans redesign residue so the repo only keeps active cockpit-direction files, adds the active cockpit interaction spec, and checkpoints the intentional March 10 dashboard/app-shell/docs edits after sanity verification
- `pending local checkpoint` — fixes the custom Z.AI key resolution so JobScout now prefers `JOBSCOUT_ZAI_API_KEY / API_KEY / ZAI_API_KEY`, proves the live cockpit `CRAFTING` rewrite/apply/save loop on `/dashboard-wireframe`, and adds a safe plain preview fallback when the PDF preview throws
- `96e1906` — turns cockpit `CRAFTING` into a real drafting studio with a live preview, fact lock controls, keyword coverage overlay, and preview/confirm rewrite flow; the live rewrite shell is browser-verified and the current `GLM-5` provider boundary is now surfaced cleanly when plan access is unavailable
- `ac94517` — extends the cockpit workspace across the later stages: `APPLIED` is now a submission/follow-up desk, `SCREENING` is now a screening desk, `INTERVIEW` is now an interview prep board, `OFFER` is now a decision board, and `AGENTS.md` now explicitly says not to re-ask for already approved or routine in-scope work
- `745a4bb` — makes the cockpit workspace stage-owned for the first two real stages: `INTERESTED` now has live in-cockpit notes, `CRAFTING` now has a compact draft desk with rewrite/save controls and a live text-first preview, and cockpit draft saves now revalidate `/dashboard-wireframe`
- `1841a67` — restores the cockpit shell’s visual hierarchy on `/dashboard-wireframe`: compact telemetry strip, a stronger Jump Back In / While You Were Out top row, stage-colored river columns, company identity on cards, urgency signals, and a less debug-like workspace panel
- `dcd8d71` — ships Phase 1 cockpit shell on `/dashboard-wireframe` as the signed-in default: live Recent Activity, live While You Were Out, read-only river from real state, right-side read-only workspace panel, and legacy page fallbacks
- `906ae55` — adds the phased cockpit migration plan that governs the move from page-based routes to one cockpit, card-owned workspace expansion, and BlockNote Resume Studio inside CRAFTING
- `5a686c5` — replaces the Resume Builder left-rail card stack with a lower-entropy control console: one segmented rewrite-strength control, three expandable voice groups, and a real below-fold scroll cue
- `b0ca0ef` — redesigns the Resume Builder center into one drafting workspace instead of tabs plus a detached preview pane
- `1557625` — simplified the Resume Builder drafting flow with plain-English rewrite controls and explicit draft-vs-Career-Data language
- `498922d` — advanced the resume stack with committed PDF import, DOCX export, Profile Builder cleanup, and the new 7-dimension Resume Builder rail
- `ce4adc3` — codified the resume customization trust model, backlog tracker, and docs pointers
- `afbeb10` — hardened DOCX import parsing for real resume variants
- Working tree should stay clean between intentional slices; do not recreate redesign residue or proof-artifact sprawl outside the kept cockpit path.

## Read First

1. [Docs Hub](/home/richard/code/jobs/docs/README.md)
2. [Cockpit Stage Contract](/home/richard/code/jobs/docs/product/cockpit-stage-contract.md) ← NEW: inbound/work/outbound per stage, toolbar, drawer pattern
3. [Architect Operating Contract](/home/richard/code/jobs/docs/guides/architect-operating-contract.md)
4. [Backlog Tracker](/home/richard/code/jobs/docs/project/backlog.md)
5. [Cockpit Interaction Spec](/home/richard/code/jobs/docs/product/cockpit-interaction-spec.md)
6. [Cockpit Migration Plan](/home/richard/code/jobs/docs/plans/cockpit-migration-plan.md)
7. [Current Implementation Roadmap](/home/richard/code/jobs/docs/plans/current-implementation-roadmap.md)
8. [Resume Document Truth Model Sprint Brief](/home/richard/code/jobs/docs/plans/resume-document-truth-model-sprint-brief.md)
9. [Resume Document Truth Model ADR](/home/richard/code/jobs/docs/decisions/008-resume-document-truth-model.md)
10. [Journal](/home/richard/code/jobs/JOURNAL.md)

## First 10 Minutes Contract

After execution permission is satisfied in `AGENTS.md` (`GO: <goal>` or `GO` after `READY`), do this in order before broad exploration:

1. Confirm repo root and branch in one line.
2. Confirm the required docs were read:
   - current pointer
   - backlog
   - roadmap
   - sprint brief when relevant
3. Name the first file to change and the first verification check.
4. Post at most 2 exploration updates.
5. Then do one of:
   - ship a small first artifact (Ralph micro-contract, failing test, or focused verification artifact that captures the gap)
   - declare a concrete blocker with the exact missing path/decision

Rules:
- If explicit `GO` or `GO:` is missing, stay in planning/discussion mode and do not start the implementation chunk.
- Do not keep narrating exploration after 2 updates.
- If repo path mismatch appears, stop and resolve path first.
- First concrete artifact should land within the first implementation chunk.
- Do not create a side folder, sibling repo, or alternate planning track.

## Mandatory Delivery Gate

Before any handoff on this sprint:

1. Show RED -> GREEN verification for the sprint target.
2. Run broader checks after GREEN.
3. Verify the live web flow in browser.
4. Capture proof artifacts (screenshots and/or concrete test output references).
5. Emit `<promise>COMPLETE</promise>` only after the above are true.

If any item is missing, no handoff.
If human approval or judgment is required first, emit `<promise>STOP</promise>`.

## Current Sprint Goal

- Cockpit shell is live at `/dashboard-wireframe` with T-shape kanban, stage toolbar, stage browser drawer, and per-stage workspaces.
- BlockNote notes engine is now the input in every WorkspaceNotesDesk (across all stages). Next: render saved notes as markdown instead of whitespace-pre-wrap, or move to the next backlog priority (Master Data import review, JobSwipe Saved confirmation, or capture submitted resume).

## Sprint Execution Mode

- This sprint is schema-sensitive.
- Architecture direction is already approved in ADR 008 and the sprint brief's `Approved Direction` section.
- Do not start a fresh architect pass if the requested slice stays inside ADR 008.
- If the requested slice would extend, change, or contradict ADR 008, stop for a fresh architect pass and human approval.
- Max `2` coder attempts per micro-contract.
- Max `3` loops on the same ownership question before pausing for the human.

## What Was Finished (Latest Session 2026-03-21)

- Synced to `main` (the main worktree at `/home/richard/code/jobs` was already at `0a2afaa`).
- Committed previously unstaged work: stage browser drawer + header simplification (`1a50c76`).
  - Clicking a kanban column header now opens a right-side drawer listing all opps in that stage.
  - Selecting from the drawer closes it and opens the workspace for that opp.
  - Header simplified: WYWO stats now inline, legacy fallback links removed.
  - RecentActivityRail relocated to a "Jump Back In" bottom section.
- Browser-verified: drawer opens, card selection works, workspace opens correctly.
- Updated `current-pointer.md` branch from `save/restore-tasks` → `main`.

## What Was Finished (Latest Session 2026-03-29)

- Improved JobSwipe readability without changing the swipe flow.
  - App shell now uses a clearer sans-serif body font stack.
  - Triage card description preview now has more comfortable reading rhythm.
  - Added a visible `Read full description` action on the card.
  - Long job descriptions now open in a scrollable dialog instead of fading out inside the card.
- Kept the change isolated to triage and app-shell typography; did not touch the unrelated local cockpit/dashboard edits already present in the worktree.
- Verification:
  - RED -> GREEN unit test for the JobSwipe description dialog at `job-search-platform/tests/unit/components/triage/TriageCard.test.tsx`
  - Tailwind config smoke test still passing
  - Browser-verified on `/triage`: preview button present, dialog opens, dialog closes with `Esc`
- New proof artifacts:
  - `/home/richard/code/jobs/job-search-platform/output/playwright/triage-readable-font-and-preview.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/triage-full-description-modal.png`

## What Was Finished (Latest Session 2026-03-29, Follow-up)

- Dashboard / cockpit `NEW` is now a personalized Kansas City discovery pool tuned to the current user’s background instead of a freshness-only 50-card slice.
  - Matching now favors software sales engineer / solutions engineer / AI-SaaS-adjacent roles in the KC metro.
  - Ordering is fit first, freshness second.
  - The dashboard hard cap of 50 for `NEW` was removed.
  - The `NEW` column now stays fixed at roughly four visible cards and uses a grab-to-scroll lane instead of `Load more`, so the board height no longer pushes the workspace down.
- Kanban readability was improved.
  - Card typography is larger and less washed out.
  - Titles can breathe across two lines.
  - Location / urgency chips are easier to scan.
- Small overlapping local fixes were folded in because the human explicitly approved merging through overlap.
  - analytics dashboard stage counts now include `SCREENING`, `INTERVIEW`, and `OFFER`
  - cockpit drawer wireframe status mapping now recognizes those same lifecycle stages directly
- Verification:
  - targeted unit suites passed:
    - `tests/unit/lib/cockpit-discovery.test.ts`
    - `tests/unit/lib/cockpit-phase1.test.ts`
    - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx`
  - `npm run build` passed
  - browser-verified on `/dashboard-wireframe`:
    - header now shows personalized `KC matches`
    - `NEW` shows 175 matching jobs for the current dataset
    - the `NEW` lane stays fixed-height and can be grabbed to browse the full match pool without moving the workspace
- New proof artifacts:
  - `/home/richard/code/jobs/job-search-platform/output/playwright/dashboard-wireframe-new-grab-scroll.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/dashboard-wireframe-kc-matches-final.png`

## What Was Finished (Prior)

- `/dashboard-cockpit-prototype` now has a second visual pass focused on surface differentiation instead of new behavior.
- The interaction model did not change:
  - river cards still open workspace directly
  - stage headers still open the lower stage browser
  - browser mini-cards still open the selected opportunity workspace
- The visual grammar is now intentionally split across three surfaces:
  - river = lighter map-like lanes and denser preview objects
  - stage browser = filled selector tray
  - workspace = solid dossier/workbench surface
- This pass replaces outline-only state changes with real background fills.
- Shared identity blocks now morph between visibly different filled surfaces instead of appearing as hollow boxes in every context.
- Proof artifacts for this pass now live at:
  - `job-search-platform/output/playwright/cockpit-prototype-pass2-default.png`
  - `job-search-platform/output/playwright/cockpit-prototype-pass2-browser.png`
- `/dashboard-cockpit-prototype` now follows the approved mock-only two-surface cockpit design instead of the earlier workspace-first prototype shell.
- The top strip is now intentionally thin:
  - small `Good morning, Richard`
  - fallback icons only
- The river is now the first and dominant surface under the top strip.
  - stage headers are their own interaction target
  - river cards stay directly clickable for workspace open
  - denser preview cards make large `Interested` counts more plausible
- The lower surface is now dual-purpose:
  - default = selected opportunity workspace
  - stage click = full-width stage browser
- Stage browser mode now includes:
  - explicit `Close`
  - `Esc` support
  - dense mini-card grid instead of a vertical list
  - shared-element identity link from the clicked stage heading
- Clicking a mini-card in stage browser mode now swaps the lower surface back into that opportunity’s workspace.
- Shared-element motion is now used only for identity-preserving mock transitions:
  - stage heading -> stage-browser header
  - selected mini-card -> workspace identity block
- Utility content is now pushed to the bottom and visually demoted so the river and work surface stay primary.
- Proof artifacts for this slice now live at:
  - `job-search-platform/output/playwright/cockpit-prototype-default-workspace.png`
  - `job-search-platform/output/playwright/cockpit-prototype-interested-browser.png`
  - `job-search-platform/output/playwright/cockpit-prototype-browser-to-workspace.png`
- `/dashboard-cockpit-prototype` was rebuilt around the clarified product model instead of the earlier abstract motion concept.
- The prototype now treats the river as the primary full kanban across all stages.
- Each opportunity in the river is individually selectable.
- Selecting an opportunity now opens one persistent workspace below the river for that same opportunity.
- The workspace now contains stage sections for the same opportunity:
  - past stages render as history
  - the current stage is active
  - the next stage is visible but not yet active
  - later stages stay blank until reached
- The prototype was verified for both:
  - an `Interested` opportunity
  - an `Applied` opportunity
- Proof artifacts for the prototype now live at:
  - `job-search-platform/output/playwright/cockpit-prototype-jobot-workspace.png`
  - `job-search-platform/output/playwright/cockpit-prototype-cloudflare-workspace.png`
- Cockpit rewrite timing is now stabilized.
  - live rewrite calls now run with an explicit timeout
  - timeout path returns a deterministic profile-based fallback draft
  - cockpit `CRAFTING` no longer depends on indefinite provider wait for staged review to appear
- Browser-proven end-to-end staged rewrite now includes narrative diffs after rewrite completion.
- Experience review in `CRAFTING` now renders richer narrative diff context per role.
  - updated roles show inline wording diff plus line-level bullet diff
  - added/removed roles keep explicit line-level deltas
- BlockNote deep editing in `CRAFTING` now supports target selection.
  - `Summary` target
  - role narrative targets from current `Experience focus` blocks
  - apply writes back only to the selected target
- Deep-editor status messaging now reports the selected target instead of summary-only text.
- `CRAFTING` review now shows granular inline diffs instead of only side-by-side text slabs.
  - summary review now renders inline wording deltas
  - experience review now renders bullet-level line deltas
- `CRAFTING` now includes a deeper in-cockpit editor layer using BlockNote (summary-first).
  - `Open BlockNote editor` loads the current summary into BlockNote
  - `Apply BlockNote summary` writes the edited content back into the working draft
  - deep editing stays inside cockpit flow
- `CRAFTING` staged rewrites now support real section-by-section review before apply.
  - `summary` can keep current text or take the staged rewrite
  - `skills` can keep current text or take the staged rewrite
  - `experience` can keep current role focus or take the staged rewrite
- The staged preview now reflects the selected mix before the user applies it.
- Experience review now shows role-level change context instead of one opaque replacement:
  - added entries
  - removed entries
  - updated descriptions
- The live cockpit rewrite flow is now browser-proven for mixed acceptance:
  - the user can keep current skills
  - accept the rewritten summary
  - apply that combination back into the working draft
- Redesign residue was cleaned out so repo status no longer carries mockup scratch by default.
- The active cockpit interaction spec is now the kept design artifact instead of floating untracked residue.
- The remaining tracked March 10 changes were treated as intentional active cockpit-direction work and sanity-verified before checkpointing.
- The custom Z.AI path now resolves through the proven working key order:
  - `JOBSCOUT_ZAI_API_KEY`
  - `API_KEY`
  - `ZAI_API_KEY`
- The live cockpit `CRAFTING` rewrite path now gets through `glm-5` on the coding endpoint instead of failing on the stale app-local key.
- The cockpit rewrite parser now repairs malformed model JSON before falling back to raw text.
  - fenced or truncated JSON is cleaned first
  - delimiter balancing is attempted before parse retry
  - if parse still fails, structured sections are salvaged instead of dumping the whole model payload into `summary`
- A previously polluted cockpit draft was re-run through the live rewrite flow and the staged/apply step replaced the raw JSON summary with a normal human summary in-panel.
- The live cockpit drafting loop is now browser-proven end to end:
  - rewrite request completes
  - suggested rewrite is staged for review
  - applying the suggestion works
  - saving the draft persists back to the workspace
- The cockpit preview pane no longer crashes the entire workspace when the embedded PDF preview throws.
  - The cockpit now falls back to a plain section/text preview inside the drafting studio.
- `CRAFTING` is no longer just a compact bridge desk inside the cockpit.
- The cockpit `CRAFTING` section is now a real drafting studio:
  - live document preview
  - summary editing
  - visible skills editing
  - experience-focus editing for the top roles
- Rewrites are now staged instead of auto-applying to the live draft.
  - `Rewrite draft` creates a suggested draft
  - review happens before replacement
  - the live draft changes only after explicit acceptance
- Fact lock is now visible and controllable inside the cockpit drafting flow:
  - contact details
  - work history facts
  - metrics and numbers
  - visible skills
- Keyword coverage is now visible inside `CRAFTING` as an inspectable overlay instead of an opaque ATS-style score.
- The cockpit drafting flow now reports the real provider boundary cleanly when live `GLM-5` access is unavailable, instead of dumping the raw provider error text.
- The cockpit workspace is now stage-owned across the later managed stages too.
- `APPLIED` cards now open a submission and follow-up desk inside the cockpit:
  - submission record
  - application source reveal
  - in-panel follow-up notes
- `SCREENING` cards now open a screening desk instead of falling back to a generic asset panel:
  - current draft summary
  - visible skills
  - proof points
  - recruiter and screening notes
- `INTERVIEW` cards now open an interview prep board:
  - current draft context
  - proof points surfaced from the draft
  - interview prep notes inside the cockpit
- `OFFER` cards now open a decision board:
  - title/company/location/salary/source context
  - offer decision notes inside the cockpit
- The workflow rule is now explicit in `AGENTS.md`:
  - if the instruction is already approved or clearly routine inside scope, do the work
  - only stop for actual ambiguity, same-file overlap, or destructive boundaries
- The cockpit right panel is no longer just a descriptive placeholder for the first two working stages.
- `INTERESTED` cards now open a live notes workspace inside the cockpit:
  - notes load from the real workspace notes API
  - new notes can be added without leaving the cockpit
  - this stage now behaves like a real evaluation desk instead of a static status summary
- `CRAFTING` cards now open a compact draft desk inside the cockpit:
  - working draft seed comes from the workspace draft when it exists
  - otherwise it falls back to Career Data as the initial seed
  - rewrite strength is available directly in the panel
  - rewrite and save actions now work from the cockpit
  - summary and visible skills can be edited in the panel
  - a live text-first preview shows the current draft shape without embedding the old full Resume Builder shell
- Cockpit draft saves now explicitly revalidate `/dashboard-wireframe`, so saving from the workspace updates the live cockpit route instead of only the older resume/pipeline routes.
- A focused cockpit component test now locks this stage-owned workspace behavior:
  - `INTERESTED` must render real notes work instead of debug-ish state
  - `CRAFTING` must render a real draft desk with rewrite/save controls
- The cockpit shell no longer looks like live data poured into a generic dashboard frame.
- The top metrics were compressed into a compact telemetry strip instead of oversized summary cards.
- `Jump Back In` and `While You Were Out` now read as the real top-row orientation surfaces instead of stacked generic slabs.
- The river regained visual hierarchy:
  - stage-colored columns
  - visible column headers
  - company identity circles on cards
  - urgency / staleness signals
  - stronger stage-specific column hints
- The workspace panel was rewritten to stop presenting raw debug-ish labels as the primary experience.
- Workspace presentation now emphasizes:
  - what this needs now
  - story snapshot
  - stage track
  - documents / fallback
- The visual personality is now back in the cockpit shell without changing the live Phase 1 data/auth logic underneath it.
- Phase 1 of the cockpit migration plan is now implemented on the live app instead of only documented.
- `/dashboard-wireframe` now reads from live authenticated state instead of mock arrays.
- The signed-in default route now lands on the cockpit shell:
  - `/` redirects signed-in users to `/dashboard-wireframe`
  - `/auth/signin` now routes successful sign-in to `/dashboard-wireframe`
- The cockpit shell now shows live `Recent Activity` from real workspaces instead of placeholder cards.
- `While You Were Out` now computes live counts from discovery jobs not yet managed by the current user.
- The river now renders real stage columns from live state:
  - `NEW`
  - `INTERESTED`
  - `CRAFTING`
  - `APPLIED`
  - `SCREENING`
  - `INTERVIEW`
  - `OFFER`
- A dedicated Phase 1 view-model helper now makes the transitional stage mapping explicit:
  - `INTERESTED` + draft resumes becomes `CRAFTING`
  - `FOLLOW_UP` / `DORMANT` split into `SCREENING`, `INTERVIEW`, or `OFFER` using legacy application status
  - `PASSED` and `ARCHIVED` stay hidden from the river
- The cockpit now opens a read-only right-side workspace panel on desktop for the selected card.
- Legacy pages remain directly available during the transition through fallback links and unchanged routes:
  - `/jobs`
  - `/pipeline`
  - `/resume`
  - `/triage`
- The repo-wide TypeScript baseline is now clean again after the resume ownership rollout.
- Prisma config was aligned with the installed Prisma version instead of importing Prisma 6-only config helpers.
- Resume ownership helper typing was cleaned up so workspace-backed JSON writes typecheck correctly.
- Chronos simulation typing now matches the current `node-cron` package.
- The older flaky type debt in legacy tests was stabilized:
  - map component tests now match the current product behavior
  - geocoding tests now match the current graceful-null fallback behavior
  - profile utility tests now match the current profile shape
  - LLM tests now satisfy the stricter config/type requirements
- The resume/document truth model is now implemented, not just planned.
- `Workspace` now owns resume documents across working drafts, references, and submitted snapshots.
- `ApplicationStatus` now uses `PASSED` instead of `DISMISSED`, and passed opportunities have a real restore/archive flow.
- Inbox now supports multi-select with batch `Pass Selected` and `Save Selected`.
- Passed Bin now exists as a first-class page with search, batch selection, restore, and archive actions.
- Pipeline and workspace surfaces now read resume ownership from workspace-backed documents instead of relying on `application.resumePath`.
- Workspace now shows a `Resume Documents` panel and the workspace notes routes were fixed for the current Next async `params` contract.
- Resume save, resume upload, and apply flows now snapshot or upsert workspace-owned documents consistently.
- ADR 008 implementation is backed by a shipped Prisma migration:
  - `job-search-platform/prisma/migrations/20260308230500_resume_document_truth_and_passed_bin/migration.sql`
- `Resume Writer Zero` is now the default baseline resume writer for the app.
- The resume prompt now explicitly optimizes for strong tech resumes that stay readable to recruiters and hiring managers.
- Resume UI presets now surface `Resume Writer Zero` as the default baseline instead of leaving the default writer implicit.
- Master Data now supports global DOCX resume import from Profile Builder.
- Imported resumes now parse into reviewable profile facts before merge instead of attaching to one opportunity by default.
- Applying an imported resume now merges extracted work history and skills into profile master data.
- DOCX import now handles the denser multiline resume formats from the current local sample-resume set instead of only the cleaner first sample.
- The Profile Builder import route now survives ordinary words like `experience` inside bullet text without truncating the section early.
- Profile Builder now accepts PDF resumes in the same global import flow and surfaces the same review-before-merge step for PDF parsing.
- Resume export now works from the structured resume truth on `/resume` for both DOCX and PDF.
- DOCX export is now browser-safe by generating the file on the server and downloading it through `/api/resume/export/docx`.
- Resume PDF and DOCX export now share one structured resume document type instead of duplicating the shape across components.
- The resume customization spec now locks the final 7 voice dimensions:
  - Formality
  - Brevity
  - Technical Depth
  - Evidence
  - Confidence
  - Warmth
  - Persuasion
- Resume Builder now uses one visible writing strategy plus 7 explicit voice dimensions instead of the old overlapping preset/control stack.
- The new rail is wired into generation through custom voice-profile instructions rather than being cosmetic-only.
- Resume generation now reads current Prisma-backed `experiences` / `educations` profile data correctly instead of only the older legacy shape.
- Resume Builder now explains itself as a job-specific draft:
  - the left rail uses plain-English rewrite language
  - the fake `Starting Point` section is gone
  - the center editor explicitly says it starts from Career Data but edits the current draft
  - the rail groups the 7 controls into clearer voice sections instead of one long dump
- Resume Builder center is now one drafting workspace:
  - tabbed editing is gone
  - section jumps replace tabs
  - the preview lives inside the same workspace shell
  - the preview copy now explains that it is the same current draft shown in export layout
- Resume Builder left rail now behaves like a focused control console instead of a same-looking card stack:
  - rewrite strength is one segmented primary choice
  - the seven voice sliders are grouped behind three expandable sections
  - only one group stays open at a time
  - a bottom fade plus `Scroll for more controls` now signals hidden depth
- Profile Builder header now places `Import Resume` next to `Profile Builder` instead of burying the action away from the master-data context.
- Contact info now supports `Title`, `First Name`, and `Last Name` separately instead of forcing one flat full-name field.
- Phone values now normalize to a readable display format like `(949) 743-4975`.
- Re-importing a better resume summary now replaces the shorter truncated summary instead of leaving the weaker text behind.
- Work History remove actions no longer overlap the company field.
- Skills refresh now explains what it uses and shows a real loading state instead of a vague `Generating...` label.
- The resume customization product spec now explicitly requires preview-confirm review before accepting a rewritten draft.
- Keyword coverage is now positioned as an inspectable overlay tied to the target job instead of a black-box ATS score.
- The backlog now tracks local/private model support as a later trust feature rather than a v1 blocker.
- A dedicated cockpit migration plan now exists to phase the app from page-based routes into:
  - cockpit shell
  - river plus card-owned workspace expansion
  - embedded Resume Studio using BlockNote only for the CRAFTING editor surface
- The migration plan now makes the transitional rule explicit:
  - old pages remain fallback surfaces until cockpit parity is real
  - old pages are retired last, not first
- BlockNote's role is now pinned down:
  - editor surface only
  - not the cockpit shell
  - not the workspace chrome
  - not the source-of-truth model

## What Remains

- The remaining non-clean state should now only come from future intentional edits, not redesign residue.
- The new plain-language backlog now lives in `/home/richard/code/jobs/docs/project/backlog.md`, and follow-up work should start there instead of being reconstructed from chat.
- `CRAFTING` is now a real cockpit drafting studio, but the deeper studio layers are still pending:
  - full voice controls are not embedded there yet
  - BlockNote Resume Studio is still future work inside `CRAFTING`, not shipped in this slice
- Real submitted artifact capture for apply flows is still pending after the resume I/O lane.
- Richer import review controls are still pending:
  - field-level accept/reject before merge
  - optional hard-linking a specific imported resume into an opportunity workspace later
- The next resume-profiler layer is still pending:
  - infer the 7-dimension voice profile from uploaded writing samples
  - express confidence when the inferred voice signal is weak
  - separate optional signature phrases from the main 7-dimension sliders
- Trust features from the resume customization spec are now partially live inside cockpit `CRAFTING`:
  - fact lock
  - preview -> confirm review
  - keyword coverage overlay
  - human signal check is still pending
- The staged review is now section-level, but deeper text diff presentation is still pending:
  - inline wording diffs for summary changes
  - richer role-by-role text diffs inside experience
- Clean up the lingering open-handle / timer leak reported by Jest in `tests/lib/llm-testing.test.ts`.
- Move from the Phase 1 shell into deeper Phase 2 cockpit work:
  - strengthen the later-stage desks from status boards into richer working surfaces
  - make `CRAFTING` the real in-cockpit drafting hub instead of a compact bridge desk
  - continue shrinking dependence on legacy pages without removing them early
- Embed BlockNote only inside the future `CRAFTING` Resume Studio surface, not in the broader cockpit shell.

## Verification

- `npx jest tests/unit/components/ConfigActions.test.tsx --runInBand`
- `npx tsc --noEmit` now passes.
- Browser load passed on `http://127.0.0.1:3173/dashboard-v2`
- Focused cockpit workspace verification passed:
  - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx`
  - `tests/unit/lib/cockpit-phase1.test.ts`
- Browser verification passed on `http://127.0.0.1:3173/dashboard-wireframe` with the dev auto-login flow:
  - `INTERESTED` workspace screenshot: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-interested-workspace.png`
  - `CRAFTING` workspace screenshot: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-workspace.png`
  - browser proof summary: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-workspace-verification.json`
- Focused cockpit drafting studio verification passed:
  - `tests/unit/lib/cockpit-drafting.test.ts`
  - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx`
  - `tests/unit/lib/cockpit-phase1.test.ts`
  - `npx tsc --noEmit`
- Browser verification passed on `http://127.0.0.1:3173/dashboard-wireframe` for the live `CRAFTING` studio shell:
  - `Drafting studio` visible
  - `Fact lock` visible
  - `Keyword coverage` visible
  - screenshot: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-studio.png`
  - proof summary: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-studio-verification.json`
- Live rewrite boundary is now verified honestly in the browser:
  - the configured `GLM-5` provider path now completes live in the cockpit after the key-path fix
  - rewrite review appears, can be applied, and can be saved back to the workspace
  - screenshot: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-zai-rewrite-review.png`
  - proof summary: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-zai-rewrite-proof.json`
- Parser hardening verification passed:
  - `tests/unit/lib/resume-generation.test.ts --runInBand`
  - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx --runInBand`
  - `npx tsc --noEmit`
- Browser verification passed on `http://127.0.0.1:3173/dashboard-wireframe` for malformed JSON recovery in cockpit `CRAFTING`:
  - a polluted raw-JSON opening summary was present in the working draft before rewrite
  - live rewrite staged successfully
  - applying the staged rewrite replaced the raw JSON with a normal summary
  - screenshot: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-parser-hardening-clean-summary.png`
  - supporting screenshot: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-parser-hardening-proof.png`
- Section-review verification passed:
  - `tests/unit/lib/cockpit-drafting.test.ts --runInBand`
  - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx --runInBand`
  - `tests/unit/lib/resume-generation.test.ts --runInBand`
  - `npx tsc --noEmit`
- Granular diff + BlockNote embedding verification passed:
  - `tests/unit/lib/cockpit-drafting.test.ts --runInBand`
  - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx --runInBand`
  - `tests/unit/lib/resume-generation.test.ts --runInBand`
  - `npx tsc --noEmit`
- Narrative-depth + role-target BlockNote verification passed:
  - `tests/unit/lib/cockpit-drafting.test.ts --runInBand`
  - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx --runInBand`
  - `tests/unit/lib/resume-generation.test.ts --runInBand`
  - `npx tsc --noEmit`
- Rewrite timing stabilization verification passed:
  - `tests/unit/lib/resume-generation.test.ts --runInBand` (includes timeout fallback test)
  - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx --runInBand`
  - `tests/unit/lib/cockpit-drafting.test.ts --runInBand`
  - `npx tsc --noEmit`
- Browser verification passed on `http://127.0.0.1:3173/dashboard-wireframe` for mixed section acceptance in cockpit `CRAFTING`:
  - staged rewrite review showed separate controls for `summary`, `skills`, and `experience`
  - the live run kept current visible skills while accepting the rewritten summary
  - the resulting draft preserved that mixed state after apply
  - screenshot: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-section-review-mixed-apply.png`
- Browser verification passed on `http://127.0.0.1:3173/dashboard-wireframe` for granular review and deep editor:
  - staged review rendered inline summary wording diff in-panel
  - `Open BlockNote editor` and `Apply BlockNote summary` controls rendered inside `CRAFTING`
  - screenshots:
    - `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-inline-summary-diff.png`
    - `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-blocknote-editor.png`
- Browser verification passed on `http://127.0.0.1:3173/dashboard-wireframe` for expanded BlockNote role-targeting controls:
  - deep editor opened in cockpit `CRAFTING`
  - target indicator and explicit apply control rendered in-panel
  - screenshot:
    - `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-blocknote-role-writeback.png`
- Browser verification passed on `http://127.0.0.1:3173/dashboard-wireframe` for completed staged rewrite + narrative diff render:
  - rewrite completed to staged review instead of hanging in `Rewriting...`
  - staged review showed narrative diff blocks under experience review
  - screenshots:
    - `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-rewrite-complete-narrative-review.png`
    - `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-crafting-rewrite-narrative-diff-detail.png`
- Browser verification passed on `http://127.0.0.1:3173/dashboard-wireframe` for the live `APPLIED` cockpit workspace:
  - `Submission record` visible
  - `Follow-up log` visible
  - `View application source` visible
  - screenshot: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-applied-workspace.png`
  - proof summary: `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-applied-workspace-verification.json`
- `SCREENING`, `INTERVIEW`, and `OFFER` are implemented and covered by focused component tests, but those stages were not present in the live March 9 dataset during browser verification.
- New focused cockpit verification passed:
  - `tests/unit/lib/cockpit-phase1.test.ts`
  - `tests/unit/components/dashboard/CockpitWireframeClient.test.tsx`
- Focused stabilization suites passed:
  - `tests/lib/llm-testing.test.ts`
  - `tests/unit/llm-error-handling.test.ts`
  - `tests/unit/components/ConfigActions.test.tsx`
  - `tests/unit/components/map/JobMap.test.tsx`
  - `tests/unit/components/map/MapControls.test.tsx`
  - `tests/unit/lib/geocoding.test.ts`
  - `tests/unit/lib/profile-utils.test.ts`
  - `tests/unit/pages/MapPage.test.tsx`
- Prisma migration deployed locally and Prisma client regenerated successfully.
- Targeted unit verification passed:
  - `tests/unit/lib/passed-bin.test.ts`
  - `tests/unit/lib/resume-document-summary.test.ts`
  - `tests/unit/components/pipeline/ApplicationCard.test.tsx`
  - `tests/unit/components/pipeline/KanbanBoard.test.tsx`
- Focused resume/Mem0 verification passed:
  - `tests/unit/lib/resume-generator.test.ts`
  - `tests/unit/lib/resume-generation.test.ts`
  - `tests/unit/lib/mem0.test.ts`
  - `tests/unit/lib/profile-import.test.ts`
  - `tests/unit/lib/profile-import-service.test.ts`
- Focused resume stack verification passed:
  - `tests/unit/components/resume/AISettingsRail.test.tsx`
  - `tests/unit/components/resume/ResumeBuilder.test.tsx`
  - `tests/unit/lib/resume-export.test.ts`
  - `tests/unit/components/resume/ats-compliance.test.tsx`
  - `tests/unit/components/profile/ProfileBuilder.test.tsx`
  - `tests/unit/lib/profile-import.test.ts`
  - `tests/unit/lib/profile-import-service.test.ts`
- Focused Profile Builder cleanup verification passed:
  - `tests/unit/components/profile/ProfileBuilder.test.tsx`
  - `tests/unit/lib/profile-import.test.ts`
  - `tests/unit/lib/profile-import-service.test.ts`
- Planning-doc verification passed:
  - read-through against `docs/product/cockpit-interaction-spec.md`
  - BlockNote boundary checked against current official docs:
    - React overview
    - custom schemas
    - shadcn integration
  - plans index updated to include `docs/plans/cockpit-migration-plan.md`
- Browser verification passed on `http://127.0.0.1:3173` for:
  - `/auth/signin` dev auto-login landing on `/dashboard-wireframe`
  - `/dashboard-wireframe` rendering live `Recent Activity`
  - `/dashboard-wireframe` rendering live `While You Were Out`
  - `/dashboard-wireframe` rendering a live read-only river from real discovery/workspace state
  - `/dashboard-wireframe` opening the right-side read-only workspace panel on desktop
  - `/dashboard-wireframe` after the visual redesign showing:
    - compact telemetry strip instead of oversized summary cards
    - stage-colored river columns
    - company identity circles on cards
    - urgency/staleness signals
    - redesigned workspace panel language
  - cockpit `Pipeline fallback` link loading `/pipeline`
  - Inbox multi-select toolbar and batch actions surface
  - Passed Bin page load and restore/archive controls
  - Workspace resume documents panel
  - Workspace notes fetch and note creation after fixing async route params
  - Settings smoke load after the stabilization pass
  - Resume Builder showing `Resume Writer Zero` as the default preset baseline
  - Career / Master Data DOCX import review and merge using `sample-resumes/RichardRuiz_SHI.docx`
  - Career / Master Data DOCX import review and merge using `sample-resumes/Richard_Ruiz_Resume_Cyberhaven.docx`
  - Career / Master Data PDF import review using the generated proof artifact `job-search-platform/output/playwright/profile-import-sample.pdf`
  - Resume Builder DOCX download via `/api/resume/export/docx`
  - Resume Builder PDF download via the existing PDF export surface
  - Resume Builder redesigned drafting flow showing:
    - `Rewrite This Draft`
    - `How hard should JobScout rewrite this?`
    - `Tune The Voice`
    - no `Starting Point`
    - explicit `Resume Draft For This Job` copy
  - Resume Builder unified drafting workspace showing:
    - `Draft Workspace`
    - `Jump to section`
    - no tab UI
    - `What the current draft looks like`
  - Resume Builder left rail redesign showing:
    - `Writing Profile`
    - `Rewrite Strength`
    - `Voice Controls`
    - `Scroll for more controls`
    - progressive disclosure between `Tone & Clarity`, `Technical Signal`, and `Positioning`
  - Career / Master Data contact cleanup after import:
    - import button placement
    - split contact name fields
    - formatted phone
    - longer summary retained after re-import
  - Career / Master Data Work History remove-button layout
  - Career / Master Data Skills refresh helper text and loading progress state
- Proof artifacts live at:
  - `/home/richard/code/jobs/job-search-platform/output/playwright/inbox-multiselect-toolbar.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/passed-bin.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/workspace-notes-fixed.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/stabilization-settings-smoke.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-writer-zero-default.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-imported-work-history.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-import-cyberhaven-work-history.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-import-pdf-review.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-import-sample.pdf`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-export-docx-pdf-buttons.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-export-proof.docx`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-export-proof.pdf`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-rail-seven-dimensions.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-builder-guided-redesign.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-builder-workspace-shell.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-builder-left-rail-redesign.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-phase1-live-shell.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/cockpit-phase1-visual-redesign.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-resume-stack.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-skills-tab.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-contact-cleanup.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-work-history-cleanup.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-skills-refresh-state.png`

## Known Risks

- The sign-in page still logs `403` for `/api/auth/single-user` and unrelated WebGL warnings from the auth scene during browser checks. This slice did not change that behavior.
- The new schema direction is now in place, so follow ADR 008 instead of re-introducing `application.resumePath` ownership patterns.
- `tests/lib/llm-testing.test.ts` passes, but Jest still reports a forced worker exit from open timers / handles after that suite finishes.
- PDF import proof currently uses a generated sample PDF artifact rather than a user-supplied real PDF resume.
- Live browser proof for `SCREENING`, `INTERVIEW`, and `OFFER` still depends on having real opportunities in those stages; current March 9 live data only exposed `APPLIED` beyond the first two stages.
- Timeout fallback uses profile truth to keep cockpit flow moving, but can produce less aggressively tailored language than a completed provider response.

## Next Recommended Task

- The cockpit stage contract is now the governing spec for workspace behavior. Start implementation from the contract:
  1. **INTERESTED stage notes with BlockNote** — replace the current plain textarea with the BlockNote block editor; this proves the universal notes engine pattern across all stages
  2. **Stage toolbar implementation** — wire up the per-stage toolbar as defined in the stage contract (each stage gets its own slim action bar with forward-transition verb on the right)
  3. **Drawer pattern for Resume Studio** — implement the slide-over drawer so `Open Resume Studio` from CRAFTING toolbar opens the full editor without navigating away from the cockpit
  4. **JobSwipe follow-up polish** — now that descriptions are readable, add first-impression note capture or stronger card information hierarchy if the user wants the swipe experience polished further
  5. **Discovery quality tuning** — now that `NEW` is a personalized KC pool, tune the role/domain matcher and high-fit thresholds so the top of the list feels even closer to “software sales engineer / AI SaaS” intent
- Use the backlog tracker for bug/debt work:
  - `/home/richard/code/jobs/docs/project/backlog.md`
- Keep legacy pages as fallback until the cockpit path has true parity
