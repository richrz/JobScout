# Current Pointer

**Status:** Active  
**Purpose:** Live baton-pass file for the next agent

## Branch

- `save/restore-tasks`

## Latest Product Checkpoint

- `48c3f12` — repo cleanup and process alignment checkpoint

## Read First

1. [Docs Hub](/home/richard/code/jobs/docs/README.md)
2. [Architect Operating Contract](/home/richard/code/jobs/docs/guides/architect-operating-contract.md)
3. [Current Implementation Roadmap](/home/richard/code/jobs/docs/plans/current-implementation-roadmap.md)
4. [Resume Document Truth Model Sprint Brief](/home/richard/code/jobs/docs/plans/resume-document-truth-model-sprint-brief.md)
5. [Resume Input And Voice Strategy](/home/richard/code/jobs/docs/product/resume-input-and-voice-strategy.md)
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

- Taskmaster and `.tdd` were removed from the active workflow.
- Default repo cleanup policy was applied:
  - root local config is being removed from tracked repo truth
  - retired `.taskmaster` / `.tdd` residue was deleted from `job-search-platform/`
  - scaffold loop folders under `docs/loops/2026-03-07/` were pruned
  - `paste.txt` was removed
- Outcome ownership is now the default repo contract:
  - `GO: <goal>` means finish to a natural endpoint
  - focused commit and current-branch push are included by default
  - stop only at real risk boundaries or when the human says `HOLD` / `LOCAL ONLY`
- The docs spine was cleaned up and made the source of truth.
- The repo-native sprint workflow and live baton-pass pointer were added.
- The architect operating contract now defines the canonical path from `GO:` through proof, handoff, focused commit, and current-branch push.
- Opportunity, workspace, lifecycle, recovery, and resume naming decisions were locked.
- Inbox search, sort, clickable titles, and honest filter behavior were checkpointed in code.

## What Remains

- Lock the resume/document truth model in implementation, not just docs.
- Implement the already-approved schema ownership changes before building Passed Bin, stage journals, or richer artifact flows.
- Execute the new sprint brief for the resume/document truth model.
- Build the next major product wave:
  - resume/document contract
  - Inbox multi-select and Passed Bin
  - workspace capture

## Verification

- Latest product checkpoint was browser-verified on `http://127.0.0.1:3173`.
- Docs link sweeps were run during the docs cleanup passes.
- Process docs were aligned so the public interface is `ARCH/READY/GO`, direct `GO: <goal>` still works, and dirty-tree overlap now blocks execution explicitly.
- Repo cleanup verification confirmed:
  - local config files still exist locally but are now ignored
  - `paste.txt` is gone
  - `job-search-platform/.taskmaster/` and `job-search-platform/.tdd/` are gone
  - `docs/loops/` now keeps only its root `README.md`
- Outcome-ownership verification confirmed the active contract now treats current-branch commit and push as the default completion path.

## Known Risks

- The current schema is acceptable as a bridge but should not be extended blindly.
- Local machine config remains intentionally local-only:
  - `.env.local`
  - `.gemini/settings.json`
  - `.mcp.json`

## Next Recommended Task

- Finalize and implement the resume/document truth model:
  - follow ADR 008 without re-opening approved architecture
  - `Workspace` owns notes, guidance, and artifacts
  - `Application` becomes event/history
  - resume generation uses approved facts, selected tone, and optional AI guidance
