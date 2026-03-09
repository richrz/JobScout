# Current Pointer

**Status:** Active  
**Purpose:** Live baton-pass file for the next agent

## Branch

- `save/restore-tasks`

## Latest Product Checkpoint

- `498922d` — advanced the resume stack with committed PDF import, DOCX export, Profile Builder cleanup, and the new 7-dimension Resume Builder rail
- `ce4adc3` — codified the resume customization trust model, backlog tracker, and docs pointers
- `afbeb10` — hardened DOCX import parsing for real resume variants
- Current working tree still contains unrelated dashboard / agent-doc dirt outside the resume stack slice

## Read First

1. [Docs Hub](/home/richard/code/jobs/docs/README.md)
2. [Architect Operating Contract](/home/richard/code/jobs/docs/guides/architect-operating-contract.md)
3. [Backlog Tracker](/home/richard/code/jobs/docs/project/backlog.md)
4. [Current Implementation Roadmap](/home/richard/code/jobs/docs/plans/current-implementation-roadmap.md)
5. [Resume Document Truth Model Sprint Brief](/home/richard/code/jobs/docs/plans/resume-document-truth-model-sprint-brief.md)
6. [Resume Document Truth Model ADR](/home/richard/code/jobs/docs/decisions/008-resume-document-truth-model.md)
7. [Journal](/home/richard/code/jobs/JOURNAL.md)

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

- Finalize and implement the resume/document truth model so mass-tailored application flow becomes trustworthy end to end.

## Sprint Execution Mode

- This sprint is schema-sensitive.
- Architecture direction is already approved in ADR 008 and the sprint brief's `Approved Direction` section.
- Do not start a fresh architect pass if the requested slice stays inside ADR 008.
- If the requested slice would extend, change, or contradict ADR 008, stop for a fresh architect pass and human approval.
- Max `2` coder attempts per micro-contract.
- Max `3` loops on the same ownership question before pausing for the human.

## What Was Finished

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
- Profile Builder header now places `Import Resume` next to `Profile Builder` instead of burying the action away from the master-data context.
- Contact info now supports `Title`, `First Name`, and `Last Name` separately instead of forcing one flat full-name field.
- Phone values now normalize to a readable display format like `(949) 743-4975`.
- Re-importing a better resume summary now replaces the shorter truncated summary instead of leaving the weaker text behind.
- Work History remove actions no longer overlap the company field.
- Skills refresh now explains what it uses and shows a real loading state instead of a vague `Generating...` label.
- The current resume AI settings rail was reviewed against the shipped code and should be redesigned, not merely polished:
  - too many overlapping controls
  - only part of the UI meaningfully changes output today
  - control labels and widgets do not explain themselves clearly enough
- The resume customization product spec now explicitly requires preview-confirm review before accepting a rewritten draft.
- Keyword coverage is now positioned as an inspectable overlay tied to the target job instead of a black-box ATS score.
- The backlog now tracks local/private model support as a later trust feature rather than a v1 blocker.

## What Remains

- The new plain-language backlog now lives in `/home/richard/code/jobs/docs/project/backlog.md`, and follow-up work should start there instead of being reconstructed from chat.
- Real submitted artifact capture for apply flows is still pending after the resume I/O lane.
- Richer import review controls are still pending:
  - field-level accept/reject before merge
  - optional hard-linking a specific imported resume into an opportunity workspace later
- The next resume-profiler layer is still pending:
  - infer the 7-dimension voice profile from uploaded writing samples
  - express confidence when the inferred voice signal is weak
  - separate optional signature phrases from the main 7-dimension sliders
- Trust features from the resume customization spec are still not fully built:
  - fact lock
  - preview -> confirm diff flow
  - keyword coverage overlay
  - human signal check
- Clean up the lingering open-handle / timer leak reported by Jest in `tests/lib/llm-testing.test.ts`.

## Verification

- `npx tsc --noEmit` now passes.
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
  - `tests/unit/lib/resume-export.test.ts`
  - `tests/unit/components/resume/ats-compliance.test.tsx`
  - `tests/unit/components/profile/ProfileBuilder.test.tsx`
  - `tests/unit/lib/profile-import.test.ts`
  - `tests/unit/lib/profile-import-service.test.ts`
- Focused Profile Builder cleanup verification passed:
  - `tests/unit/components/profile/ProfileBuilder.test.tsx`
  - `tests/unit/lib/profile-import.test.ts`
  - `tests/unit/lib/profile-import-service.test.ts`
- Browser verification passed on `http://127.0.0.1:3173` for:
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
  - Resume Builder redesigned rail showing:
    - `Writing Profile`
    - `Conservative / Balanced / Standout`
    - the 7 voice dimensions
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
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-resume-stack.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-skills-tab.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-contact-cleanup.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-work-history-cleanup.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-builder-skills-refresh-state.png`

## Known Risks

- The new schema direction is now in place, so follow ADR 008 instead of re-introducing `application.resumePath` ownership patterns.
- `tests/lib/llm-testing.test.ts` passes, but Jest still reports a forced worker exit from open timers / handles after that suite finishes.
- PDF import proof currently uses a generated sample PDF artifact rather than a user-supplied real PDF resume.

## Next Recommended Task

- Use the new backlog tracker as the first stop for follow-up work selection:
  - `/home/richard/code/jobs/docs/project/backlog.md`
- Then take the next resume-profiler layer:
  - infer the 7-dimension voice profile from uploaded writing samples
  - keep `Resume Writer Zero` as fallback when the signal is weak
  - start wiring fact lock and preview-confirm into the rewrite flow
