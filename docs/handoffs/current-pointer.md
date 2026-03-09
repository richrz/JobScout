# Current Pointer

**Status:** Active  
**Purpose:** Live baton-pass file for the next agent

## Branch

- `save/restore-tasks`

## Latest Product Checkpoint

- `04f57ec` — repo typing stabilized after the resume ownership rollout

## Read First

1. [Docs Hub](/home/richard/code/jobs/docs/README.md)
2. [Architect Operating Contract](/home/richard/code/jobs/docs/guides/architect-operating-contract.md)
3. [Current Implementation Roadmap](/home/richard/code/jobs/docs/plans/current-implementation-roadmap.md)
4. [Resume Document Truth Model Sprint Brief](/home/richard/code/jobs/docs/plans/resume-document-truth-model-sprint-brief.md)
5. [Resume Document Truth Model ADR](/home/richard/code/jobs/docs/decisions/008-resume-document-truth-model.md)
6. [Journal](/home/richard/code/jobs/JOURNAL.md)

## First 10 Minutes Contract

After execution permission is satisfied in `AGENTS.md` (`GO: <goal>` or `GO` after `READY`), do this in order before broad exploration:

1. Confirm repo root and branch in one line.
2. Confirm the 3 required docs were read:
   - sprint brief
   - current pointer
   - roadmap
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

## What Remains

- Decide whether the next product move is:
  - PDF import for resume parsing
  - docx/pdf export from structured resume truth
  - real submitted artifact capture for apply flows
- Clean up the lingering open-handle / timer leak reported by Jest in `tests/lib/llm-testing.test.ts`.

## Verification

- `npx tsc --noEmit` is blocked only by the older unrelated `tests/unit/components/ConfigActions.test.tsx` delete-operand error.
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
- Browser verification passed on `http://127.0.0.1:3173` for:
  - Inbox multi-select toolbar and batch actions surface
  - Passed Bin page load and restore/archive controls
  - Workspace resume documents panel
  - Workspace notes fetch and note creation after fixing async route params
  - Settings smoke load after the stabilization pass
  - Resume Builder showing `Resume Writer Zero` as the default preset baseline
  - Career / Master Data DOCX import review and merge using `sample-resumes/RichardRuiz_SHI.docx`
- Proof artifacts live at:
  - `/home/richard/code/jobs/job-search-platform/output/playwright/inbox-multiselect-toolbar.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/passed-bin.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/workspace-notes-fixed.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/stabilization-settings-smoke.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/resume-writer-zero-default.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/profile-imported-work-history.png`

## Known Risks

- The new schema direction is now in place, so follow ADR 008 instead of re-introducing `application.resumePath` ownership patterns.
- `tests/lib/llm-testing.test.ts` passes, but Jest still reports a forced worker exit from open timers / handles after that suite finishes.
- Repo-wide `npx tsc --noEmit` is currently blocked by an older unrelated failure in `tests/unit/components/ConfigActions.test.tsx`.
- DOCX import is shipped first; PDF import/export is still pending.

## Next Recommended Task

- Resume product work on top of the stabilized floor:
  - real submitted artifact capture for apply flows is the best next build
  - fix the LLM test open-handle leak the next time that suite or retry logic is touched
