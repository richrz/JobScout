# Current Pointer

**Status:** Active  
**Purpose:** Live baton-pass file for the next agent

## Branch

- `save/restore-tasks`

## Latest Product Checkpoint

- `22a85f7` — Inbox polish, honest filter reset, and scraper cleanup

## Read First

1. [Docs Hub](/home/richard/code/jobs/docs/README.md)
2. [Current Implementation Roadmap](/home/richard/code/jobs/docs/plans/current-implementation-roadmap.md)
3. [Resume Document Truth Model Sprint Brief](/home/richard/code/jobs/docs/plans/resume-document-truth-model-sprint-brief.md)
4. [Resume Input And Voice Strategy](/home/richard/code/jobs/docs/product/resume-input-and-voice-strategy.md)
5. [Journal](/home/richard/code/jobs/JOURNAL.md)

## First 10 Minutes Contract

For a fresh/no-context agent, do this in order before broad exploration:

1. Confirm repo root and branch in one line.
2. Confirm the 3 required docs were read:
   - sprint brief
   - current pointer
   - roadmap
3. Name the first file to change and the first verification check.
4. Post at most 2 exploration updates.
5. Then do one of:
   - ship a small first artifact (small diff, focused checklist update, or failing test that captures the gap)
   - declare a concrete blocker with the exact missing path/decision

Rules:
- Do not keep narrating exploration after 2 updates.
- If repo path mismatch appears, stop and resolve path first.
- First concrete artifact should land within the first implementation chunk.

## Mandatory Delivery Gate

Before any handoff on this sprint:

1. Show RED -> GREEN verification for the sprint target.
2. Run broader checks after GREEN.
3. Verify the live web flow in browser.
4. Capture proof artifacts (screenshots and/or concrete test output references).

If any item is missing, no handoff.

## Current Sprint Goal

- Finalize and implement the resume/document truth model so mass-tailored application flow becomes trustworthy end to end.

## What Was Finished

- Taskmaster and `.tdd` were removed from the active workflow.
- The docs spine was cleaned up and made the source of truth.
- The repo-native sprint workflow and live baton-pass pointer were added.
- Opportunity, workspace, lifecycle, recovery, and resume naming decisions were locked.
- Inbox search, sort, clickable titles, and honest filter behavior were checkpointed in code.

## What Remains

- Lock the resume/document truth model in implementation, not just docs.
- Decide the schema ownership changes before building Passed Bin, stage journals, or richer artifact flows.
- Execute the new sprint brief for the resume/document truth model.
- Build the next major product wave:
  - resume/document contract
  - Inbox multi-select and Passed Bin
  - workspace capture

## Verification

- Latest product checkpoint was browser-verified on `http://127.0.0.1:3173`.
- Docs link sweeps were run during the docs cleanup passes.

## Known Risks

- The current schema is acceptable as a bridge but should not be extended blindly.
- Local machine config remains intentionally uncommitted:
  - `.env.local`
  - `.gemini/settings.json`
  - `.mcp.json`

## Next Recommended Task

- Finalize and implement the resume/document truth model:
  - `Workspace` owns notes, guidance, and artifacts
  - `Application` becomes event/history
  - resume generation uses approved facts, selected tone, and optional AI guidance
