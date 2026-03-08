# Current Pointer

**Status:** Active  
**Purpose:** Live baton-pass file for the next agent

## Branch

- `save/restore-tasks`

## Latest Product Checkpoint

- `4794835` — resume ownership, inbox multi-select, and passed bin shipped end to end

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

## What Remains

- Clean up the older repo-wide TypeScript failures that still exist outside this slice.
- Decide whether the next product move is:
  - real submitted artifact capture for apply flows
  - richer workspace guidance / journals
  - broader Next 16 route cleanup beyond the workspace area

## Verification

- Prisma migration deployed locally and Prisma client regenerated successfully.
- Targeted unit verification passed:
  - `tests/unit/lib/passed-bin.test.ts`
  - `tests/unit/lib/resume-document-summary.test.ts`
  - `tests/unit/components/pipeline/ApplicationCard.test.tsx`
  - `tests/unit/components/pipeline/KanbanBoard.test.tsx`
- Browser verification passed on `http://127.0.0.1:3173` for:
  - Inbox multi-select toolbar and batch actions surface
  - Passed Bin page load and restore/archive controls
  - Workspace resume documents panel
  - Workspace notes fetch and note creation after fixing async route params
- Proof artifacts live at:
  - `/home/richard/code/jobs/job-search-platform/output/playwright/inbox-multiselect-toolbar.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/passed-bin.png`
  - `/home/richard/code/jobs/job-search-platform/output/playwright/workspace-notes-fixed.png`

## Known Risks

- `npx tsc --noEmit` still reports older unrelated repo issues outside this feature slice.
- The new schema direction is now in place, so follow ADR 008 instead of re-introducing `application.resumePath` ownership patterns.

## Next Recommended Task

- Do a focused cleanup pass on the remaining repo-wide TypeScript / Next 16 debt so future feature work starts from a steadier floor.
