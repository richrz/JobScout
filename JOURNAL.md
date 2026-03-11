# JobScout Development Journal

> A chronological record of strategic decisions, pivots, and progress. Read this to understand *why* things are the way they are.

---

## 2026-03-10 — Cockpit Prototype Rebuilt As Full-Bleed River-First Surface

### Context
The previous prototype still looked and behaved like a dashboard panel:
- it was still wrapped by the app shell/sidebar
- workspace motion was not forceful enough
- the overall composition still felt boxed and static

### Decisions Made
1. **Prototype route now bypasses app shell chrome.**
   - `AppShell` fullscreen logic now includes `/dashboard-cockpit-prototype`
2. **Rebuilt prototype layout around the correct hierarchy.**
   - header row
   - full-width river row directly beneath header
   - stage workspace motion rail as the central drafting surface
   - utility row (`Jump Back In`, `While You Were Out`) at the bottom
3. **Implemented stronger spatial progression.**
   - workspace panels are positioned on a fixed track
   - selecting later stages shifts the whole workspace track left aggressively
   - non-active panels remain visible as contextual neighbors
4. **Kept the route isolated and fake-data only.**
   - no DB/API dependency added
   - no behavior changes to live cockpit route

### Verification
- typecheck passed (`npx tsc --noEmit`)
- browser proof captured:
  - `cockpit-prototype-fullbleed-main.png`
  - `cockpit-prototype-fullbleed-offer.png`

### Why This Matters
The prototype now behaves like a pipeline cockpit instead of a static dashboard:
- river is primary
- stage progression is spatial and visible
- motion encodes movement through the pipeline

## 2026-03-10 — Prototype Layout Updated To River-First Order

### Context
The cockpit prototype needed to match the wireframe interaction hierarchy:
- header first
- river immediately under header
- utility panels (`Jump Back In`, `While You Were Out`) below the river/workspace area

### Decisions Made
1. **Moved river block to first row under header.**
2. **Moved `Jump Back In` and `While You Were Out` to the lower row.**
3. **Kept motion, data stubs, and stage-rail behavior unchanged.**

### Verification
- typecheck passed (`npx tsc --noEmit`)
- browser screenshot confirms ordering on `/dashboard-cockpit-prototype`

### Why This Matters
This puts the pipeline back in the primary visual position so the prototype reflects the intended cockpit model: river is the center of the surface, not secondary telemetry.

## 2026-03-10 — Isolated Cockpit Motion Prototype Route Added

### Context
The active cockpit route is already wired to live state and stage-owned workspaces.

We needed a safe place to design and validate the new spatial interaction model without destabilizing production cockpit behavior:
- full-width river
- stage-owned workspace motion
- leftward progression feeling as stages advance
- layering and z-index behavior under animation

### Decisions Made
1. **Added an isolated prototype route for motion/layout work.**
   - new route: `/dashboard-cockpit-prototype`
   - fake/stub content only
   - no DB/API reads
2. **Encoded the spatial model directly in the prototype.**
   - river spans the main canvas
   - stage selection drives active workspace emphasis
   - workspace rail repositions with smooth motion so stage progression feels physical
   - non-active stage workspaces remain visible as background context
3. **Used animation as information architecture, not decoration.**
   - stage-select transition
   - workspace position transition
   - active-stage emphasis
   - subtle telemetry pulse
4. **Kept this work isolated from live cockpit behavior.**
   - no behavior changes to `/dashboard-wireframe`

### Verification
- Typecheck passed (`npx tsc --noEmit`)
- Browser route check passed (`/dashboard-cockpit-prototype`)
- Screenshots captured for base and later-stage selection states

### Why This Matters
This creates a safe design lab for the cockpit interaction model.

We can iterate on layout, motion, and layering quickly without breaking the live cockpit route while redesign work is in progress.

## 2026-03-10 — CRAFTING Rewrite Timing Stabilized With Timeout Fallback

### Context
Live cockpit rewrite could remain in `Rewriting...` when provider responses stalled.

That blocked reliable browser proof for staged review and narrative diff rendering.

### Decisions Made
1. **Added a hard rewrite timeout in server generation flow.**
   - rewrites now fail fast from the UI perspective instead of hanging indefinitely
2. **Added deterministic profile-based fallback when timeout hits.**
   - fallback draft is built from saved profile fields
   - staged review can still proceed so cockpit flow remains usable
3. **Kept staged review contract unchanged.**
   - rewrite still stages first
   - apply remains explicit
   - no silent overwrite behavior introduced

### Verification
- unit test now covers timeout fallback behavior in `generateTailoredResume`
- cockpit component tests still pass
- browser proof now shows completed staged rewrite with narrative diffs active after rewrite completion

### Why This Matters
This resolves the timing instability that was blocking trustworthy end-to-end cockpit proof.

`CRAFTING` rewrite now completes to a clear result path:
- provider response
- or timeout fallback
- then staged review with diffs

The user is no longer stuck waiting on an indefinite rewrite state.

## 2026-03-10 — CRAFTING Narrative Diff Depth + BlockNote Role Targeting

### Context
The previous slice added section-level review and summary-first BlockNote editing.

Two gaps remained:
- experience review still needed richer narrative-level visibility
- BlockNote needed to target role narratives, not just the opening summary

### Decisions Made
1. **Experience review now has richer narrative diffs.**
   - each changed role now shows a narrative diff section
   - updated roles show inline wording diffs plus line-level bullet diffs
   - added/removed roles still render line-level deltas
2. **BlockNote deep editor now supports role targeting.**
   - users can choose `Summary` or role targets from `Experience focus`
   - loading a target pulls that content into BlockNote
   - apply writes back only to the selected target
3. **Write-back is controlled and explicit.**
   - no automatic replacement from BlockNote edits
   - apply action is required for summary or role narrative updates

### Verification
- unit tests cover:
  - inline word diff helper
  - inline line diff helper
  - cockpit review and deep-editor controls
- browser validation confirmed:
  - BlockNote deep editor in cockpit
  - target selection and explicit apply controls
- live rewrite remained in long-running `Rewriting...` state during this checkpoint, so inline-diff browser proof is represented by test coverage in this slice rather than a completed live rewrite response.

## 2026-03-10 — CRAFTING Diff Review Got Granular + BlockNote Embedded

### Context
Section-level accept/reject was live, but review quality was still too coarse:
- summary and experience were still mostly "current vs suggested" slabs
- users could not see wording deltas inline
- `CRAFTING` still lacked the deeper editor layer inside the cockpit

### Decisions Made
1. **Review now renders inline text diffs for summary wording.**
   - insertions are highlighted
   - removals are struck
   - users no longer need to mentally compare two separate boxes
2. **Experience review now renders bullet-level diffs.**
   - added lines
   - removed lines
   - unchanged lines
   - this makes role-level rewrite impact obvious before apply
3. **BlockNote is now embedded directly in `CRAFTING` as the deep editor layer (summary-first).**
   - `Open BlockNote editor` loads the current summary into BlockNote
   - `Apply BlockNote summary` writes the edited result back into the draft
   - this keeps deep editing inside cockpit flow instead of bouncing to a separate page
4. **Coverage and save/rewrite behavior stayed on the same cockpit contract.**
   - rewrite still stages first
   - apply still requires explicit user action
   - save still persists to workspace draft

### Why This Matters
This pushes `CRAFTING` from "staged rewrite control" into a more trustworthy drafting surface:
- clearer review signal before acceptance
- deeper editing where users already work
- less context switching between cockpit and legacy pages

## 2026-03-10 — CRAFTING Now Reviews Rewrite Changes Section by Section

### Context
`CRAFTING` had already moved to a staged rewrite flow, but the review step was still too blunt:
- the user could stage a rewrite
- the preview updated
- but acceptance was effectively all-or-nothing

That was not enough control for a trust-first drafting surface.

### Decisions Made
1. **Staged rewrites now review `summary`, `skills`, and `experience` separately.**
   - each section can keep current content
   - or take the suggested rewrite
2. **The staged preview now reflects the selected mix before apply.**
   - review is no longer abstract
   - the preview shows the actual accepted combination
3. **Experience review now surfaces role-level change context.**
   - added roles
   - removed roles
   - updated descriptions
4. **Live browser proof had to show mixed acceptance, not just a happy-path full apply.**
   - the staged rewrite was generated live in the cockpit
   - visible skills were kept current
   - the rewritten summary was accepted
   - the resulting draft preserved that mixed state in-panel

### Why This Matters
This is the first real trustful rewrite-review layer inside the cockpit.

The user can now see and control:
- what changed
- which sections to accept
- which sections to leave alone

That is the right bridge between raw generation and the deeper BlockNote editing layer that comes later.

## 2026-03-10 — CRAFTING Rewrite Parser Now Repairs Malformed Model Output

### Context
The live `CRAFTING` rewrite loop was working again after the Z.AI key-path fix, but one trust break remained:
- malformed model JSON could survive the fallback path
- when that happened, the cockpit could stage or show raw JSON inside the opening summary field

That was unacceptable because the rewrite flow looked "successful" while degrading the draft.

### Decisions Made
1. **Resume rewrite parsing now has a repair path before raw fallback.**
   - strip markdown fences
   - clean the JSON candidate
   - rebalance delimiters
   - salvage structured fields when full parse still fails
2. **Raw model output no longer wins if structured sections can be recovered.**
   - contact info
   - summary
   - experience
   - education
   - skills
3. **The cockpit rewrite flow was browser-checked against an already polluted draft.**
   - rewrite staged successfully
   - applying the staged rewrite replaced the raw JSON summary with a normal summary
   - the proof image now shows the cleaned summary/skills state in-panel
4. **The nearby regression in `scripts/test-resume-generation.ts` was cleaned up so repo-wide typecheck stays green.**

### Why This Matters
This closes the last obvious trust break in the current cockpit drafting loop.

The rewrite flow now behaves like a real staged editor flow:
- broken model JSON is repaired when possible
- structured draft sections survive
- the user no longer gets a JSON blob dumped into the summary field just because the model response was imperfect

## 2026-03-10 — CRAFTING Became A Real Cockpit Drafting Studio

### Context
`CRAFTING` inside the cockpit was still a bridge desk:
- rewrite
- save
- a thin text preview

That was enough to prove stage ownership, but not enough to make the cockpit the real place where resume work happens.

The missing trust layers were also obvious:
- rewrites were replacing the live draft immediately
- there was no visible fact lock
- there was no honest keyword coverage view
- there was no review gate before a rewrite touched the draft

### Decisions Made
1. **`CRAFTING` is now a real drafting studio inside the cockpit.**
   - live preview
   - editable summary
   - editable visible skills
   - editable experience-focus blocks
2. **Rewrites are now staged, not auto-applied.**
   - rewrite generates a suggested draft
   - the user reviews it
   - only explicit acceptance replaces the working draft
3. **Fact lock is now visible and controllable in the cockpit.**
   - contact details
   - work history facts
   - metrics / numbers
   - visible skills
4. **Keyword coverage is now visible as an overlay, not a black-box score.**
   - covered keywords
   - missing keywords
   - staged rewrite coverage can be inspected before acceptance
5. **The provider boundary is now explicit.**
   - the studio shell is live and browser-verified
   - the live rewrite round-trip is currently blocked by the configured `GLM-5` plan access on this account
   - the product now reports that boundary cleanly instead of dumping raw provider noise

### Why This Matters
This is the first cockpit slice where `CRAFTING` behaves like a trustworthy workbench instead of a small shortcut into older page-era tooling.

The remaining gap is not the studio shell anymore.
It is:
- live provider access for the rewrite round-trip
- deeper Resume Studio editing later, including the planned BlockNote document surface

## 2026-03-09 — Cockpit Workspace Became Real For INTERESTED And CRAFTING

## 2026-03-09 — Cockpit Workspace Expanded Across The Later Stages

### Context
The cockpit already handled `INTERESTED` and `CRAFTING` as real in-panel work, but the later stages were still falling back to generic summary content.

That created a broken mental model:
- the river implied each stage owned its work
- the right panel only really delivered on that promise for the first two active stages

The next boundary was to make the later stages stage-owned too, without dragging the old page-era shells back into the cockpit.

### Decisions Made
1. **The cockpit now treats `APPLIED`, `SCREENING`, `INTERVIEW`, and `OFFER` as stage-owned workspaces.**
2. **`APPLIED` is now a submission and follow-up desk.**
   - submission record
   - source reveal link
   - follow-up notes in-panel
3. **`SCREENING` is now a screening desk instead of a generic asset slab.**
   - draft summary and skills stay visible
   - recruiter/screening notes live in-panel
4. **`INTERVIEW` is now an interview prep board.**
   - proof points from the draft are surfaced directly
   - prep notes live in-panel
5. **`OFFER` is now a decision board.**
   - salary/source context stays visible
   - offer decision notes live in-panel
6. **The workflow rule was hardened too.**
   - if something is already approved or clearly routine inside scope, do it
   - only stop for actual ambiguity, overlap, or destructive boundaries

### Why This Matters
This closes the biggest remaining gap in the cockpit model short of full Resume Studio embedding.

The river now maps to real stage-owned work much more honestly:
- click a card
- the stage-specific desk opens
- the work stays with that opportunity inside the cockpit

The remaining step is not “make the panel real.” It is to deepen the stage-owned desks and then embed the richer `CRAFTING` studio work there.

### Context
The cockpit had already become the signed-in shell and regained its visual hierarchy, but the right panel was still only a Phase 1 placeholder.

That meant the river could show live motion, but clicking a card still led to a mostly descriptive panel instead of real work.

The next useful boundary was clear:
- `INTERESTED` should become a real note-taking desk
- `CRAFTING` should become a compact drafting desk
- the old full Resume Builder page should remain fallback, not the only place work can happen

### Decisions Made
1. **The cockpit right panel is now stage-owned work, not a generic summary slab.**
2. **`INTERESTED` now opens a real notes workspace.**
   - live notes load from the workspace notes API
   - the user can add notes directly inside the cockpit
   - this turns `INTERESTED` into an actual holding and evaluation stage
3. **`CRAFTING` now opens a compact drafting desk inside the cockpit.**
   - rewrite strength is available directly in the workspace
   - rewrite and save actions now live in the cockpit panel
   - summary and visible skills can be edited there
   - a live text-first draft preview shows the current shape of the draft
4. **The old Resume Builder shell was not embedded wholesale.**
   - the full page-era shell stays fallback
   - the cockpit uses the smaller reusable pieces:
     - workspace-owned draft data
     - rewrite action
     - save action
     - compact draft editing
5. **Cockpit save now revalidates `/dashboard-wireframe` too.**

### Why This Matters
This is the first step where the workspace stops being a promise and starts being the actual place work happens.

The user can now:
- click an `INTERESTED` card and capture why it matters
- click a `CRAFTING` card and actually shape the draft there

That is the correct direction for the cockpit model:
- the card owns the workspace
- the workspace owns the work
- fallback pages remain only while deeper cockpit parity is still growing

## 2026-03-09 — Cockpit Migration Now Has A Phased Execution Plan

### Context
The cockpit interaction spec is now the governing UX truth, but the repo still mostly behaves like a page-based app.

That created a dangerous gap:
- the product vision said `one cockpit`
- the actual implementation path was still too implicit
- BlockNote had been chosen for Resume Studio, but its role inside the system was not yet pinned down tightly enough

### Decisions Made
1. **A dedicated cockpit migration plan now exists at `docs/plans/cockpit-migration-plan.md`.**
2. **The migration path is now explicitly phased from the current app to the cockpit end state.**
   - cockpit shell
   - cockpit triage and passed recovery
   - card-owned workspace expansion
   - embedded CRAFTING workbench
   - BlockNote Resume Studio
   - apply flow and submitted snapshots
   - retirement of the old page model
3. **BlockNote's boundary is now explicit.**
   - BlockNote owns the editable Resume Studio document surface inside CRAFTING
   - BlockNote does not own the cockpit shell, workspace expansion, diff, voice controls, keyword overlay, or submission logic
4. **The plan now keeps the current page-based surfaces as transitional fallbacks instead of pretending they disappear all at once.**

### Why This Matters
This turns the cockpit spec from a strong vision into an executable migration path.

It also protects the implementation from two common mistakes:
- trying to rebuild the whole product in one jump
- letting BlockNote silently become the system of record instead of staying an editor surface

## 2026-03-09 — Resume Builder Left Rail Dropped The Card Stack

### Context
Even after the earlier Resume Builder cleanup, the left column still felt like too many equal-weight cards jammed into a narrow box.

That made the page hard to scan for three reasons:
- the strategy controls and voice controls all looked equally important
- the page hid depth below the fold without signaling it well
- the user still had to decode containers instead of making one clear choice at a time

### Decisions Made
1. **The left rail now behaves like a compact control console instead of a pile of cards.**
2. **Rewrite strategy became one primary segmented choice.**
   - one visible control
   - one live description
   - no repeated strategy cards
3. **The seven voice sliders now live behind three expandable groups.**
   - Tone & Clarity
   - Technical Signal
   - Positioning
4. **Only one group stays open at a time.**
   - this lowers noise and keeps the user focused on one type of decision
5. **The rail now signals hidden depth explicitly.**
   - bottom fade
   - `Scroll for more controls` cue

### Why This Matters
This reduces the information entropy of the page.

The left rail now says:
- choose rewrite strength
- open the kind of voice control you want
- adjust that one group
- keep moving

That is much closer to a usable drafting tool than the earlier same-looking card stack.

## 2026-03-09 — Resume Stack Was Reworked Into One Trustworthy System

### Context
Today’s work stopped being a collection of small resume tweaks and became one connected resume-system pass.

The product truth now spans:
- import source material into Career Data
- shape a job-specific draft in Resume Builder
- export the exact draft you want to send
- move toward a trust-first customization model instead of generic AI polish

### What Shipped Today
1. **The resume customization stack now has a real product spec.**
   - `You, but everywhere` is the core proposition
   - trust primitives are explicit:
     - `Fact Lock`
     - `Transparent Diff`
     - `Human Signal Check`
     - audience / jargon tuning
     - `Resume Writer Zero` fallback
2. **Resume import and export became part of the real product flow.**
   - global DOCX import into Profile Builder master data
   - hardened DOCX parsing against current local resume samples
   - PDF import into the same review-before-merge lane
   - DOCX and PDF export from the same structured resume truth
3. **Profile Builder became more trustworthy after import.**
   - clearer import placement
   - better contact handling
   - better summary replacement on re-import
   - less broken work-history editing
   - clearer skill-refresh behavior
4. **Resume Builder’s voice controls were reset around the final 7 dimensions.**
   - Formality
   - Brevity
   - Technical Depth
   - Evidence
   - Confidence
   - Warmth
   - Persuasion
5. **Resume Builder itself was restructured twice.**
   - first, the page stopped reading like a vague settings dump
   - then the center became one drafting workspace instead of tabs plus a detached preview pane

### Direction Now
The next design problem is no longer “what should the controls be called?”

It is information architecture:
- the left column still has too many equal-weight surfaces
- too many boxes compete for attention
- scrolling depth is not communicated well
- the page still asks the user to decode control containers instead of making one clear choice at a time

The next redesign direction is:
- reduce the entropy of the left column
- stop using a same-looking stack of cards as the default answer
- use clearer hierarchy, progressive disclosure, and visible below-fold cues
- make the rail feel like a focused control console, not a pile of settings boxes

### Why This Matters
This makes the resume system more coherent:
- Career Data is the source
- Resume Builder shapes a draft for one job
- export uses that same draft truth
- the product is moving toward trustworthy voice amplification rather than generic AI rewriting

## 2026-03-09 — Resume Builder Center Became One Drafting Workspace

### Context
Even after the left rail cleanup, the center of Resume Builder still felt like two unrelated tools:
- a tabbed editor in the middle
- a detached preview pane on the right

That made the page feel generic and broke the mental model. The user is not editing "tabs." They are shaping one resume draft for one job.

### Decisions Made
1. **The center of Resume Builder now behaves like one drafting workspace.**
   - the tabbed shell is gone
   - the editor now flows from top to bottom as one working document
2. **Section switching became jump navigation instead of tabs.**
   - Basics
   - Summary
   - Work History
   - Skills
3. **The preview now belongs to the same workspace instead of reading like a separate app pane.**
   - shared shell
   - sticky preview card
   - explicit copy that this is the same draft shown in export layout
4. **The source-of-truth split is now stated directly.**
   - Career Data is the source
   - edits here affect the current draft only

### Why This Matters
This gives Resume Builder one coherent mental model:
- choose the target job
- shape one draft
- preview that same draft
- save or export the version you want to send

That is much closer to how the user actually thinks about resume work.

## 2026-03-09 — Resume Builder Now Reads Like A Drafting Tool Instead Of A Settings Dump

### Context
The first rail redesign fixed some truth problems, but the page still read like internal tooling:
- `Writing Goal` was vague
- `Starting Point` looked smarter than it really was
- `Technical IC` was insider language
- the middle editor still did not explain its relationship to Career Data clearly enough

That left the page technically improved, but still confusing in the exact places the user has to trust.

### Decisions Made
1. **The Resume Builder rail now uses plain-English rewrite language.**
   - `Writing Goal` became a direct question about how hard JobScout should rewrite the draft
   - the strategy labels now read like user intent instead of internal settings
2. **`Starting Point` was removed from the rail.**
   - it was a hardcoded preset section pretending to be more intelligent than it was
3. **The voice controls are now grouped into clearer cards.**
   - tone and clarity
   - technical signal
   - positioning
4. **The main editor now explains itself as a job-specific draft.**
   - it starts from Career Data
   - edits in the center affect this draft, not the master profile

### Why This Matters
This makes the page more trustworthy.

Instead of asking the user to decode product jargon, the page now explains:
- what the left side actually changes
- how hard the rewrite should push
- where the draft comes from
- what is still separate from Career Data

## 2026-03-09 — Resume Customization Now Has A Draft Product Spec

### Context
The repo already had the resume input and voice strategy rationale, but the actual v1 product contract for the trust-first customization stack was still spread across chat and working assumptions.

That was enough to discuss direction, but not enough to hand the work cleanly to future agents.

### Decisions Made
1. **A draft product spec now exists at `docs/product/resume-customization-product-spec.md`.**
2. **The draft locks the main product shape without pretending the unresolved details are finished.**
   - core promise: `You, but everywhere`
   - trust-first customization
   - anti-spam, pro-signal stance
   - `Resume Writer Zero` fallback
   - `Fact Lock`, `Transparent Diff`, `Human Signal Check`, audience/jargon tuning, and optional `Signature Phrase` layer
3. **The open questions remain explicit `TBD`s.**
   - final seven voice dimensions
   - confidence model
   - signature phrase limits
   - final profile naming
4. **The product indexes now point to this draft spec so new agents can find it.**

### Why This Matters
This creates a real handoff artifact for the resume profiler and builder stack.

Future work can now argue with one visible spec instead of reconstructing the product from memory or chat.

## 2026-03-09 — Resume Stack Checkpoint Landed Around Truth, Control, And I/O

### Context
The resume surface had several partially-finished truths at once:
- Profile Builder import and cleanup work was already in progress
- export from structured resume truth existed locally but was not checkpointed
- the old Resume Builder AI rail had been criticized accurately, but not replaced
- the customization spec still said the final 7 voice dimensions were unresolved

That left the product with the right direction but an incomplete, hard-to-trust surface.

### Decisions Made
1. **The resume customization spec now locks the final 7 voice dimensions.**
   - Formality
   - Brevity
   - Technical Depth
   - Evidence
   - Confidence
   - Warmth
   - Persuasion
2. **Resume Builder now uses one truthful writing strategy plus 7 explicit sliders instead of the older overlapping controls.**
3. **The new rail is wired into resume generation.**
   - the controls now feed custom voice-profile instructions into generation instead of pretending to change output
4. **The broader resume stack was checkpointed as one coherent slice.**
   - Profile Builder contact cleanup
   - PDF import support in the master-data lane
   - browser-safe DOCX export route
   - shared structured resume document type
5. **Resume generation now reads the Prisma-backed profile shape correctly for experiences and educations.**

### Why This Matters
This turns the resume surface into something closer to one real system:
- import source material into trusted master data
- shape output from structured truth
- export cleanly
- control the writing profile with explicit, understandable dimensions

The next layer is no longer “clean up the random UI.” It is the actual profiler logic above this:
- infer the 7-dimension profile from uploads
- express confidence honestly
- add fact lock, preview-confirm, and other trust features from the customization spec

## 2026-03-09 — A Plain Backlog Tracker Became Part Of The Active Docs

### Context
The project had a real backlog, but it was spread across chat, the handoff pointer, a few bug docs, and memory.

That made follow-up work harder to trust because new agents had to reconstruct the open bugs and next product work instead of reading one obvious list.

### Decisions Made
1. **A single plain-language backlog file now exists at `docs/project/backlog.md`.**
2. **The docs hub now points to the backlog as an active source of truth.**
3. **The live handoff pointer now tells new agents to read the backlog early instead of reconstructing it from chat.**
4. **Detailed bug reports stay in `docs/bugs/`, but the backlog is now the front door.**

### Why This Matters
This gives the project one simple place to look for:
- what is broken
- what UX debt is known
- what product work is next

That should make new agents less likely to miss known issues or start wandering.

## 2026-03-09 — Profile Builder Was Cleaned Up, And The AI Settings Rail Needs A Reset

### Context
After resume import started working on real files, the next friction was no longer "can the file get in?" It was whether the Profile Builder felt trustworthy once the imported data landed.

The review surfaced two truths:
- parts of Profile Builder still felt clumsy or visually broken
- the Resume Builder AI settings rail looked powerful, but the shipped controls were not explaining themselves well and not all of them were meaningfully wired

### Decisions Made
1. **Profile Builder contact editing was made more honest and readable.**
   - `Import Resume` now sits next to the main `Profile Builder` heading
   - contact info now supports title + first name + last name
   - phone numbers normalize into a readable format
2. **Resume re-import now prefers the better summary instead of preserving a shorter truncated one.**
3. **Work History and Skills UX were cleaned up for clarity.**
   - remove controls no longer overlap fields
   - skills refresh now explains what it scans and shows a visible progress state
4. **The current AI settings rail should be redesigned, not just relabeled.**
   - too many overlapping control groups
   - inconsistent widgets
   - helper text is too thin
   - some visible controls imply precision that the generation path does not actually honor yet

### Why This Matters
Resume import only helps if the user trusts the master-data editing surface afterward.

This also clarified the next UX debt honestly: the resume AI rail needs to become simpler, more legible, and more truthful about what each choice really changes.

## 2026-03-08 — DOCX Import Hardened Against Real Resume Variants

### Context
The first DOCX import ship worked on one cleaner sample, but several real local resumes still under-parsed.

That meant the route existed, yet the trustworthy outcome was not there: importing the current sample-resume set into Master Data still failed in practice for denser formats.

### Decisions Made
1. **DOCX import parsing was hardened against real multiline and dense resume layouts.**
2. **Section slicing now stops only on real headings, not ordinary words like `experience` inside bullet text.**
3. **Experience extraction now handles multiline headers, inline bullets, and the extra employer-line variant seen in the sample resumes.**
4. **Browser proof was upgraded from one clean sample to the harder Cyberhaven-style resume.**

### Why This Matters
This turns DOCX import from a promising first pass into something the user can actually use on the current sample-resume set.

It also sets a better floor for the next chunk:
- PDF import
- export from structured truth
- richer review and merge controls later

## 2026-03-09 — PDF Import And DOCX/PDF Export Landed On Structured Resume Truth

### Context
After DOCX import shipped, the next honest gap was still the rest of resume I/O:
- PDF resumes still could not enter the same Profile Builder import lane
- export from `/resume` was not yet complete across both file formats

That meant the resume system had the right internal truth shape, but not the full input/output loop around it.

### Decisions Made
1. **Profile Builder now accepts PDF resumes in the same global import flow as DOCX.**
2. **PDF import keeps the same review-before-merge contract.**
   - parse first
   - show extracted counts
   - merge only on explicit apply
3. **DOCX and PDF export now both start from the same structured resume truth on `/resume`.**
4. **DOCX export moved behind a server route for browser safety.**
   - the client asks for the file
   - the server builds the DOCX
   - the browser downloads it cleanly
5. **The shared resume document shape was centralized instead of duplicated across export surfaces.**

### Why This Matters
This closes the first real resume I/O loop:
- import source material into master data
- keep structured profile/resume data as truth
- export the resulting resume cleanly as DOCX or PDF

It also means the next resume lane can move up the stack:
- submitted artifact capture
- finer review/merge controls
- optional hard-links from imported reference resumes into opportunity workspaces

## 2026-03-08 — Master Data Resume Import Shipped As Global DOCX Parsing

### Context
The app could upload resumes into opportunity workspaces, but it could not turn a real resume into profile master data.

That was the wrong shape for the next product step because imported resumes are better treated as global source material first, not as opportunity-attached truth by default.

### Decisions Made
1. **DOCX import now starts in Profile Builder / Master Data, not in an opportunity workspace.**
2. **Imported resume parsing is review-before-save.**
   - upload a resume
   - inspect extracted counts
   - apply the import explicitly
3. **Structured profile data stays the internal truth.**
   - imported documents feed profile data
   - they do not become truth automatically
4. **PDF import/export stays a follow-up lane.**
   - DOCX import shipped first because the real sample resumes and parser path were cleaner there

### Why This Matters
This is the first real bridge from existing resumes into JobScout master data.

It also keeps the product aligned with the intended model:
- global import first
- structured truth in the profile
- optional workspace hard-links later when they are intentional

## 2026-03-08 — Resume Writer Zero Became The Default Resume Baseline

### Context
The product already had resume generation, but it still lacked a clearly named baseline writer that the rest of the resume system could branch from.

That made it harder to reason about what "normal" meant before users asked for more concise, more technical, or more aggressive variants.

### Decisions Made
1. **`Resume Writer Zero` is now the default baseline resume writer.**
2. **The baseline is optimized for high-end tech hiring without becoming jargon soup.**
3. **Its core job is to translate complex technical work into clear recruiter and hiring-manager value while staying truthful.**
4. **The resume UI now surfaces `Resume Writer Zero` as the default preset reference.**

### Why This Matters
This gives the app one trustworthy center of gravity for resume quality.

It also creates a better foundation for imported resumes, voice tuning, and later variants because "more" or "less" can now branch from a named default instead of an implicit prompt.

## 2026-03-08 — Post-Rollout Stabilization Cleared The Typecheck Floor

### Context
After the resume ownership rollout shipped, the repo still had older type debt that made the floor feel less trustworthy than the product state actually was.

The main problems were:
- Prisma config drift against the installed Prisma version
- a few app/runtime typing mismatches
- stale tests that still asserted old map copy, old color tokens, or outdated profile/geocoding expectations

### Decisions Made
1. **Stabilization was treated as a real follow-through step, not optional cleanup.**
2. **The repo-wide TypeScript baseline was cleared** before declaring the floor stable again.
3. **Legacy tests were updated to match current product truth** instead of preserving stale expectations.
4. **Parallel development was used where it was safe.**
   - one lane handled app/runtime typing
   - another lane scoped the test debt
   - integration still happened centrally in the main lane

### Why This Matters
This gets the repo back to a place where the next product build can start from a cleaner, more trustworthy baseline instead of carrying known type debt forward.

It also proved a better operating pattern:
- broad goal from the human
- safe split into disjoint lanes
- central integration and verification before handoff

## 2026-03-08 — Resume Ownership, Inbox Multi-Select, And Passed Bin Shipped

### Context
The product had already converged on the right direction in ADR 008, but the app still behaved like the older model:
- resume ownership was split between `Application` and `Workspace`
- Inbox had only one-at-a-time triage
- Passed Bin was still mostly an idea
- workspace notes were broken by stale Next dynamic route signatures

That meant the docs were ahead of the product, and the user could not trust the workflow end to end.

### Decisions Made
1. **`Workspace` is now the live owner of resume documents.**
   - working drafts, references, and submitted snapshots are stored as workspace-linked resume records
   - apply flows now snapshot documents instead of treating `application.resumePath` as the durable source of truth
2. **Passed work became a first-class lifecycle.**
   - `PASSED` replaced `DISMISSED`
   - Passed Bin now supports search, restore, archive, and batch selection
3. **Inbox triage now supports multi-select.**
   - batch `Save Selected`
   - batch `Pass Selected`
4. **Workspace and pipeline UIs now read document truth from workspace-owned resumes.**
5. **The stale Next async `params` bug was fixed** in the workspace routes that were still breaking notes and status APIs at runtime.

### Why This Matters
This is the first checkpoint where the approved ownership model actually exists in the product surface instead of only in docs.

It also turns three separate frustrations into one coherent flow:
- Inbox can move multiple jobs quickly
- Passed Bin gives recovery instead of silent loss
- Workspace now visibly owns the resume history behind each opportunity

## 2026-03-08 — Architect Replies Became Friendlier And More Actionable

### Context
The architect role still sounded too formal and report-like.

That caused two problems:
- the tone felt colder than it needed to
- replies could explain what happened without clearly telling the human what to do next

### Decisions Made
1. **Architect replies should be friendly, direct, and concise.**
2. **Architect replies must always include both:**
   - a short `What Happened`
   - a clear `What's Next`
3. **The architect template headings were updated** to:
   - `What Happened`
   - `Risk`
   - `Direction`
   - `What Must Stay True`
   - `Approval Needed`
   - `What's Next`
4. **The orchestrator prompts were updated** so schema-sensitive architect passes now require those headings exactly.

### Why This Matters
This keeps architect replies useful to an actual human instead of reading like internal paperwork.

The architect should help the human move, not just summarize the situation.

## 2026-03-08 — Outcome Ownership Replaced Step-Level Approval

### Context
Even after simplifying the public interface, the repo still treated commit and push as separate approvals.

That kept recreating the same bad working relationship:
- the human states one outcome
- the agent finishes part of it
- then the agent asks for the next tiny permission

That is just "tiny slices" under a different name.

### Decisions Made
1. **`GO: <goal>` now means outcome ownership, not partial execution.**
2. **Default completion now includes:**
   - verification
   - pointer/docs updates
   - focused commit
   - push to the current branch
3. **The default stop conditions are now explicit.**
   - unclear product choice
   - overlap with unrelated dirty paths
   - schema direction that would extend or contradict approved ADRs
   - destructive actions outside approved scope
   - actions beyond the current branch checkpoint:
     - merge
     - deploy
     - release
     - secrets/account changes
4. **`HOLD` and `LOCAL ONLY` are now the intentional exceptions.**
   - `HOLD` = stop after the current verified checkpoint
   - `LOCAL ONLY` = do not push the branch

### Why This Matters
This changes the relationship from:
- "tell me each sub-step"

to:
- "tell me the outcome and I will own the rest unless a real boundary appears"

## 2026-03-08 — Public Execution Interface Simplified

### Context
The process still expected the human to speak in implementation language like `GO: <tiny slice>`.

That was a product failure, not a user failure.
The user should be able to state the outcome they want while the architect/orchestrator does the narrowing internally.

The repo also still left too much room for a vague "dirty repo" disclaimer instead of a path-level overlap check.

### Decisions Made
1. **The public workflow is now `ARCH -> READY -> GO`.**
2. **Direct shorthand is allowed as `GO: <goal>`.**
   - This authorizes execution on the stated outcome without forcing the human to phrase the work as a micro-task.
3. **Internal narrowing is the architect/orchestrator's job.**
   - Agents should convert a broad but clear goal into the first safe micro-contract.
   - Agents should ask the human only when the goal is genuinely ambiguous or risky.
4. **Dirty-tree handling is now explicit.**
   - Agents must classify scope overlap as `no overlap`, `overlap`, or `unknown`.
   - `overlap` and `unknown` require a stop with exact conflicting paths.
   - "Dirty repo" is no longer an acceptable generic explanation.
5. **`paste.txt` was reduced to a thin entry shim** so it stops competing with the architect contract as a second giant source of truth.

### Why This Matters
This makes the process act more like a product surface and less like an internal agent ritual.

It also directly addresses the trust problem:
- the human no longer has to manage internal slicing
- the agent has to own narrowing
- dirty-tree risk must be stated concretely or execution stops

## 2026-03-08 — Default Repo Cleanup Policy Applied

### Context
The repo still carried known dirt even after the process contract improved.

That was undermining trust because the same stale surfaces kept surviving from task to task:
- tracked local machine config
- retired `.taskmaster` and `.tdd` residue
- scaffold loop folders that looked more real than they were
- `paste.txt` still existing as an extra entry point

### Decisions Made
1. **Root local config is no longer repo truth.**
   - `.env.local`
   - `.gemini/settings.json`
   - `.gemini/settings.json.orig`
   - `.mcp.json`
   are now treated as local-only and should not stay tracked.
2. **Retired workflow residue was removed** from `job-search-platform/.taskmaster/` and `job-search-platform/.tdd/`.
3. **The tracked legacy `.tdd` verification artifact was deleted** instead of archived.
4. **Scaffold loop folders under `docs/loops/2026-03-07/` were deleted.**
5. **`paste.txt` was removed** so it stops competing with the architect contract.

### Why This Matters
This reduces the number of ways the repo can look active while still carrying stale operational clutter.

More importantly, it removes the biggest non-product sources of repeated "repo is dirty" friction without asking the human to remember the history of each leftover file.

## 2026-03-08 — Architect Operating Contract

### Context
The repo had the right ingredients for deterministic execution, but they were spread across too many places and one key rule had drifted.

The main conflict was:
- the new explicit `GO:` gate said planning is the default
- the active sprint brief said ADR 008 already approved the resume-document schema direction
- the current pointer and orchestrator prompts still behaved as if every schema-sensitive task required a fresh architect STOP before any slice could begin

That made the process feel unsafe and contradictory.

### Decisions Made
1. **`docs/guides/architect-operating-contract.md` is now the canonical end-to-end operating contract** for architect-led execution.
2. **Process precedence is now explicit**:
   - `AGENTS.md` hard gates first
   - current pointer next
   - active sprint brief + accepted ADR next
   - roadmap/product docs after that
   - templates are output shape only
   - mem0 and project memory are reminders, not canonical truth
3. **Accepted ADRs linked in a sprint brief now explicitly satisfy the approval gate for in-bounds schema slices.**
   - Agents should not re-derive or re-ask for approval when the requested slice stays inside those approved decisions.
   - If a requested slice would extend or change the approved direction, that still requires a fresh architect pass and human approval.
4. **Commit and push language is now clarified**:
   - every meaningful sprint should be prepared for commit/push
   - actual commit/push still happens only when the human explicitly asks
5. **Ralph loop scaffolds are now labeled honestly** until a real filled example exists.

### Why This Matters
This turns the architect role from “search several docs and guess which one wins” into one explicit contract.

It also prevents the exact failure mode that has been burning time:
- planning context being mistaken for execution permission
- approved architecture being re-opened accidentally
- process docs disagreeing about whether the next move is STOP or slice

### Follow-On Decision
We also added a temporary trust-building interface for execution:
- `ARCH:` to think and narrow
- `READY` to produce a safety card without edits
- `GO` to execute only the prepared move

This exists because the user does not yet trust the process to move safely from planning into action.
The key guardrail is simple:
- if dirty-tree status is `overlap` or `unknown`, do not execute

## 2026-03-07 — Resume Document Truth Model Sprint Brief

### Context
The next implementation move needed to stop being “we should probably fix the resume system next” and become a real sprint target.

The product direction is already clear:
- JobScout is ultimately an AI-assisted application engine
- the resume system is the choke point
- richer workspace or Inbox work will not matter enough if document ownership stays fuzzy

### Decisions Made
1. **The next sprint is now explicitly centered on the resume/document truth model.**
2. **The sprint brief locks the implementation focus** around:
   - `Workspace` owning notes, guidance, and artifacts
   - `Application` becoming event/history instead of main truth
   - clean separation of `Existing Resume`, `Working Draft`, `Saved Variant`, and `Submitted Snapshot`
   - resume generation using only approved facts, selected tone, and optional AI guidance
3. **Inbox multi-select, Passed Bin, and richer workspace UI are intentionally out of scope** for this sprint so the core ownership problem gets solved first.

### Why This Matters
This keeps the next build step from drifting back into UI work while the deepest data and trust problem remains unresolved.

It also gives future agents a much clearer answer to:
> "What are we actually building next?"

Answer:
- the resume/document truth model first
- then the next feature wave on top of that foundation

---

## 2026-03-07 — Repo-Native Sprint And Handoff Workflow

### Context
We reached the point where chat history was doing too much of the memory work.

That is risky for a long-running product:
- context windows reset
- new agents arrive cold
- commits alone do not always say what to read first or what to do next

The repo needed a cleaner baton-pass pattern.

### Decisions Made
1. **The official sprint flow is now**:
   - design
   - sprint brief
   - code
   - verify
   - commit
   - push
   - pointer
2. **The repo, not chat, is the memory system** for handoff.
3. **`docs/handoffs/current-pointer.md` is now the live baton-pass file** for the next agent.
4. **Old ad hoc handoff files were retired** so the active handoff surface stops competing with stale process leftovers.

### Why This Matters
This creates a simpler answer to:
> "If we clear the current agent’s memory, how does the next agent pick up cleanly?"

Answer:
- read the pointer
- read the docs hub and roadmap
- inspect the referenced checkpoint
- continue from the named next task

That is a much more durable workflow than hoping chat history remains available or complete.

---

## 2026-03-07 — Inbox Polish And Honest Filter Reset

### Context
The remaining worktree had a real product cluster mixed with half-truths.

Some of the Inbox improvements were clearly worth keeping:
- keyword search
- match-based sorting
- clickable job titles
- save-from-detail flow
- pipeline header improvements

But the filter work was still pretending the app had structured work-mode and salary filtering when the underlying data was not normalized enough yet.

### Decisions Made
1. **Keyword search is now a first-class Inbox control** instead of relying only on sidebar filters.
2. **Match sorting is now explicitly supported**:
   - `Best Match`
   - `Lowest Match`
3. **Job titles in the Inbox are now clickable** and go to the same detail page as the Details button.
4. **Saving from the job detail page now works directly** and feeds back into the shared opportunity/application flow.
5. **Pipeline got a more useful header and manual add-application modal** as a practical workflow improvement.
6. **Misleading structured filter controls were intentionally replaced with an honest placeholder**:
   - search and sort are real now
   - work-mode, salary, and experience filters should come back only after normalized data supports them
7. **Geocoding remains intentionally disabled** while the map work stays paused.
8. **JSearch ingestion was tightened**:
   - KC-focused query defaults
   - jobs without apply URLs are dropped before persistence

### Why This Matters
This is a better checkpoint than silently keeping half-working filters.

The app now does a few important things more truthfully:
- users can search and sort the Inbox reliably
- users can click straight into details from the title
- users can save from detail and see the result in Pipeline

And just as important:
- the UI no longer overpromises structured filters that the data cannot support yet

That honesty buys us room to rebuild filtering properly on top of the normalization contract instead of layering more fake precision onto raw strings.

---

## 2026-03-07 — Resume Artifact Defaults And Naming

### Context
The resume strategy discussion reached the point where “good ideas” were no longer enough.

We needed to stop drifting on:
- what the reusable tone object is called
- how many uploads or resume objects v1 should allow
- how to distinguish a tone-learning upload from an opportunity-specific uploaded resume
- whether users are allowed to bring an existing resume into an opportunity workflow

### Decisions Made
1. **The reusable user voice object is now `My ToneAdjust Profile`.**
2. **v1 supports one ToneAdjust Profile per user** fed by up to `3` global `Voice Samples`.
3. **Opportunity resume objects are now standardized**:
   - `Existing Resume`
   - `Working Draft`
   - `Saved Variant`
   - `Submitted Snapshot`
4. **Accepted v1 defaults are now locked as product rules**:
   - `1` working draft per opportunity
   - up to `5` saved variants per opportunity
   - up to `2` existing-resume uploads per opportunity
   - submitted snapshots follow application history and are not artificially capped
5. **Users are allowed to upload an `Existing Resume` for a specific opportunity**:
   - keep it as reference
   - or promote it into the working draft
   - but never silently treat it as factual truth or a submitted record
6. **These values are product defaults, not schema hard-limits.**

### Why This Matters
This reduces ambiguity before the resume system gets rebuilt.

It also protects the product from two predictable failures:
- confusing users with sloppy naming
- baking packaging or UI defaults directly into the database model

The result is a cleaner contract for future implementation and a better base for later plan design.

---

## 2026-03-07 — Taskmaster Removal

### Context
Taskmaster and the TDD/Autopilot wrappers were creating more drag than control.

The repo had accumulated:
- Taskmaster package wiring
- `.taskmaster/` state
- a parallel `.tdd/` wrapper born out of frustration
- editor and GitHub instruction files pushing agents back into the old system
- workflow docs that no longer matched how the product is actually being built

This was consuming attention and tokens without giving the team a trustworthy source of truth.

### Decisions Made
1. **Taskmaster is no longer part of the active workflow for this repo.**
2. **The repo itself is now the workflow system**:
   - docs hub
   - active product specs
   - roadmap
   - journal
   - focused git commits
3. **The `.tdd/` experiment was removed too** because it still depended on the same Taskmaster assumptions and duplicated the confusion rather than fixing it.
4. **Active agent instructions were rewritten** so future agents stop trying to use Taskmaster by default.
5. **Taskmaster-specific scripts, guides, editor rules, and bundle copies were removed** from active surfaces.

### Why This Matters
This reduces process overhead and makes the repository more honest.

Future work should now answer:
- What is true? Read the docs spine.
- What changed and why? Read the journal and commits.
- What should happen next? Read the roadmap.

That is a much better fit for how JobScout is actually being built.

---

## 2026-03-07 — Resume Input Contract And Voice Strategy

### Context
The planning conversation shifted back to the product’s real center of gravity: JobScout is not just an opportunity tracker. It is supposed to help users apply to many relevant jobs faster using AI-tailored materials that still sound like them.

That exposed a risk in the current state of the app:
- the resume engine is not yet strong enough to carry that promise cleanly
- the current tone controls are richer in UI than in engine reality
- future evidence farming only helps if the resume input contract becomes trustworthy first

### Decisions Made
1. **The resume engine is now treated as a first-class product contract**, not a loose side feature.
2. **Resume generation should be grounded in clearly separated inputs**:
   - stable profile facts
   - approved reusable evidence
   - target opportunity context
   - reusable voice preset
   - one-off AI guidance
3. **Uploaded exemplar resumes are now part of the product direction**:
   - they are meant to teach the system how the user sounds
   - not silently become trusted factual truth
4. **Voice and truth are now explicitly separated**:
   - exemplar resumes can produce tone profiles
   - facts extracted from them should go through review before entering the profile/evidence layer
5. **The new tone feature should simplify the UI instead of multiplying controls**:
   - `My ToneAdjust Profile` should appear as a preset
   - selecting it should auto-align the current controls
   - controls should remain read-only until the user chooses to customize
6. **A new `AI Guidance` concept is part of the intended resume flow**:
   - opportunity-level default guidance
   - per-resume override for special cases that sliders cannot express

### Why This Matters
This work clarifies why the next resume wave exists.

It is not about adding more novelty controls.
It is about making AI tailoring more faithful to the user and more trustworthy at scale.

If this is done well:
- resume automation feels personal instead of generic
- reusable evidence becomes dramatically more valuable
- the app can help users apply broadly without making them sound like the model

### Guardrail
We also explicitly recorded a schema warning:
- the current schema has good bones
- but it should be treated as a bridge
- not extended blindly while resume ownership, artifact state, and lifecycle ownership are still mixed

That warning now lives in both the roadmap and the new product strategy doc so it does not get lost in chat history.

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

## 2026-03-06 — Pro Tier Levers And Resume Hardening Note

### Context
We kept pushing on monetization and landed on a better direction: make the Pro tier deeper, not just bigger.

### Locked Direction
- Pro should likely include richer workflow tools beyond basic workspace access.
- Strong candidates include:
  - tone and style presets
  - more document variants per opportunity
  - additional document types inside the workspace
  - version history and comparison for resume/cover-letter drafts

### Important Backlog Note
- Resume creation and document handling still need a dedicated hardening pass.
- This now belongs explicitly in the implementation roadmap under artifacts and application events, not as a floating product note.

---

## Earlier History

> *Note: This journal was started on 2026-03-04. Earlier project history can be pieced together from git log, the PRD, and docs in `/docs/`.*

### Key Milestones (Pre-Journal)
- **Nov 2025**: Project inception. PRD written. Core vision: AI-powered job search CRM.
- **Dec 2025**: "Prism" UI overhaul planned. Data pipeline architecture designed. LLM provider abstraction built (OpenAI, Anthropic, Gemini, Ollama, OpenRouter, Azure).
- **Jan 2026**: Product Owner "Sisyphus" persona established. Market research on ageism in hiring completed. Triage feed, workspace, and resume builder implemented.
- **Feb 2026**: JSearch API integration completed. Geographic heatmap built. Landing site created.
- **Mar 2026**: KC scraper pivot (this entry).
# 2026-03-08 - Ralph loop anti-drift guardrails tightened

- Closed loopholes that still allowed agents to invent a "quicker path" outside the Ralph loop.
- Made it explicit that off-repo side folders, sibling repos, worktrees, and alternate planning tracks are not allowed without explicit human approval.
- Made commit and push behavior explicit in the contract at that stage so agents stopped improvising handoff rules.
- Tightened the current pointer so the first artifact cannot degrade into a vague checklist update.
- Added schema-sensitive mode with architect-first execution, explicit human signoff before schema-changing implementation, and lower retry caps for ownership/lifecycle work.
- Added Ralph-style promise tokens so the orchestrator must end each loop with an explicit `COMPLETE`, `FAIL`, or `STOP` state.
- Tightened boot overflow behavior so orchestrators hit `<promise>STOP</promise>` instead of reopening exploratory drift when they exceed the allowed startup rounds.

# 2026-03-09 - Resume customization trust model tightened

- Added `preview -> confirm` to the resume customization product spec so rewrites must be reviewed before they become the accepted artifact.
- Added `keyword coverage overlay` to the trust model so job targeting stays inspectable instead of collapsing into a black-box ATS score.
- Marked local/private model support as a later trust extension rather than a v1 blocker.
- Added matching backlog items so future agents can pick these up from one plain-language source.

# 2026-03-09 - Phase 1 cockpit shell shipped

- Promoted `/dashboard-wireframe` from a static mock into the live signed-in cockpit shell.
- Switched signed-in entry behavior so:
  - `/` redirects authenticated users to `/dashboard-wireframe`
  - `/auth/signin` now lands on `/dashboard-wireframe` after successful login
- Added a dedicated `cockpit-phase1` view-model helper to make the transitional state mapping explicit:
  - discovery jobs without workspaces render as `NEW`
  - `INTERESTED` plus draft resumes becomes `CRAFTING`
  - `FOLLOW_UP` / `DORMANT` split into `SCREENING`, `INTERVIEW`, or `OFFER` via legacy application status
  - `PASSED` / `ARCHIVED` stay hidden from the cockpit river
- The cockpit now renders live:
  - `Recent Activity`
  - `While You Were Out`
  - read-only river columns from current discovery and workspace state
  - a desktop right-side read-only workspace panel for the selected card
- Legacy pages remain available as transition fallbacks instead of being retired early:
  - `/jobs`
  - `/pipeline`
  - `/resume`
  - `/triage`
- Verified with:
  - `tests/unit/lib/cockpit-phase1.test.ts`
  - `npx tsc --noEmit`
  - browser proof on `http://127.0.0.1:3173` including sign-in landing, cockpit render, live river, workspace panel, and fallback pipeline link

# 2026-03-09 - Cockpit visual hierarchy restored

- Reworked the cockpit presentation layer in `CockpitWireframeClient.tsx` without changing the underlying Phase 1 data/auth wiring.
- Compressed the oversized top metrics into a compact telemetry strip.
- Restored the intended top-row flow so `Jump Back In` and `While You Were Out` feel like orientation surfaces instead of generic stacked boxes.
- Brought visual life back into the river:
  - stage-colored columns
  - stronger headers
  - company identity circles
  - urgency and staleness signals
- Reframed the right-side workspace panel away from raw debug-ish state labels and toward:
  - what this needs now
  - story snapshot
  - stage track
  - documents / fallback
- Verified with:
  - `npx tsc --noEmit`
  - `tests/unit/lib/cockpit-phase1.test.ts`
  - browser screenshot proof at `/dashboard-wireframe`

# 2026-03-10 - Z.AI cockpit rewrite path fixed

- Diagnosed the live `GLM-5` failure empirically instead of trusting the docs:
  - the app-local `ZAI_API_KEY` path was failing
  - the root repo `API_KEY` succeeds with `glm-5` on `https://api.z.ai/api/coding/paas/v4`
- Added a shared Z.AI config resolver so JobScout now prefers the proven repo-local key order:
  - `JOBSCOUT_ZAI_API_KEY`
  - `API_KEY`
  - `ZAI_API_KEY`
- Wired that resolver through the live custom-provider paths:
  - config defaults
  - cockpit rewrite route
  - resume generator
  - skill suggestion route
- Verified the live cockpit drafting loop on `/dashboard-wireframe`:
  - rewrite request completes
  - suggested rewrite is staged for review
  - applying the suggestion works
  - saving the draft writes back to the workspace
- Fixed the cockpit drafting workspace so a PDF preview failure no longer crashes the whole page:
  - the cockpit now falls back to a plain text/section preview if the embedded PDF preview throws
- Remaining defect after the provider fix:
  - Z.AI sometimes returns malformed JSON for the resume rewrite payload
  - the app currently falls back by stuffing the raw response into the summary field when JSON parsing fails

# 2026-03-10 - Redesign residue cleaned and cockpit direction checkpointed

- Removed redesign scratch residue that was polluting repo status:
  - `.playwright-cli/`
  - ad hoc redesign skill scratch
  - temporary research files
  - `dashboard-v3` scratch route
  - untracked mockup/proof screenshots that were not part of the chosen path
- Kept the active cockpit-direction files:
  - `docs/product/cockpit-interaction-spec.md`
  - the current dashboard/app-shell/dashboard-metrics tracked edits
  - roadmap and product docs that now reference the cockpit direction
- Verified the kept active set with:
  - `tests/unit/components/ConfigActions.test.tsx`
  - `npx tsc --noEmit`
  - browser load on `/dashboard-v2`

# 2026-03-11 - Cockpit prototype rebuilt around 1:1 opportunity workspaces

- Reworked `/dashboard-cockpit-prototype` away from the earlier abstract workspace-motion idea.
- The prototype now matches the clarified product model:
  - river = full kanban across all stages
  - each opportunity in the river is individually selectable
  - opportunity : workspace = `1 : 1`
  - the selected opportunity opens one persistent workspace below the river
  - the workspace contains stage sections for that same opportunity
  - past sections show history
  - current section is active
  - next section is visible but not yet active
  - future sections stay blank until the opportunity reaches them
- Verified with:
  - `tests/unit/components/dashboard/CockpitPrototypeClient.test.tsx`
  - `npx tsc --noEmit`
  - browser checks on `/dashboard-cockpit-prototype`
  - screenshots for `Interested` and `Applied` workspace states

# 2026-03-11 - Cockpit prototype redesigned into river + stage browser + workspace

- Reworked `/dashboard-cockpit-prototype` into a two-surface cockpit:
  - stable river/kanban on top
  - dual-purpose lower surface below
- Collapsed the prototype header into a thin strip:
  - small `Good morning, Richard`
  - fallback icons only
- Made the river the first dominant surface:
  - taller overall lane area
  - denser preview cards
  - stage headers separated from opportunity-card clicks
- The lower surface now behaves in two modes:
  - default = selected opportunity workspace
  - stage click = full-width stage browser for that lane
- Added dense mini-card browser mode for stage browsing:
  - intended to scale better for high-volume stages like `Interested`
  - explicit `Close` button
  - `Esc` closes the browser
- Kept direct river-card behavior:
  - clicking a river opportunity still opens its workspace directly
- Added identity-preserving motion for the mock:
  - stage heading morphs into the lower stage-browser header
  - selected mini-card morphs into the lower workspace identity block
- Moved utility content to the bottom and demoted it so the river and lower work surface stay primary.
- Verified with:
  - `tests/unit/components/dashboard/CockpitPrototypeClient.test.tsx --runInBand`
  - `npx tsc --noEmit`
  - browser proof on `/dashboard-cockpit-prototype`
  - screenshots:
    - `job-search-platform/output/playwright/cockpit-prototype-default-workspace.png`
    - `job-search-platform/output/playwright/cockpit-prototype-interested-browser.png`
    - `job-search-platform/output/playwright/cockpit-prototype-browser-to-workspace.png`

# 2026-03-11 - Cockpit prototype pass 2: surface differentiation

- Kept the same mock interaction model on `/dashboard-cockpit-prototype`:
  - river cards still open workspace directly
  - stage headers still open the lower stage browser
  - stage-browser cards still open the selected opportunity workspace
- Changed the visual grammar so the three surfaces no longer read like one family of hollow boxes:
  - river = lighter map-like lanes and denser preview cards
  - stage browser = filled selector tray
  - workspace = solid dossier/workbench surface
- Added real background fills instead of relying on outline-color changes.
- Made the shared identity blocks more visible by giving them distinct filled treatments in river, browser, and workspace contexts.
- Verified with:
  - `tests/unit/components/dashboard/CockpitPrototypeClient.test.tsx --runInBand`
  - `npx tsc --noEmit`
  - browser screenshots on `/dashboard-cockpit-prototype`
  - proof artifacts:
    - `job-search-platform/output/playwright/cockpit-prototype-pass2-default.png`
    - `job-search-platform/output/playwright/cockpit-prototype-pass2-browser.png`

# 2026-03-07 - Ralph loop workflow added

- Added a repo-native Ralph loop workflow for deterministic agent execution.
- Locked the role split between orchestrator and coder so implementation and grading do not share incentives.
- Added reusable micro-contract and verification report templates.
- Added a lightweight loop runner to create proof folders under `docs/loops/`.
- Positioned Ralph loops as a stricter execution layer on top of the existing docs-first and HITL workflow.
