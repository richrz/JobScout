# Sprint Brief: Resume Document Truth Model

## Sprint Name

- Resume document truth model

## Goal

- Make the resume system trustworthy enough to support mass-tailored applications without confusing document ownership, tone inputs, or submission history.

## Why Now

- This is the product choke point.
- Better evidence capture, richer workspaces, and future automation all depend on the resume engine having a clean truth model first.
- If we keep building on the mixed current model, we risk long-lived schema debt and user distrust.

## In Scope

- Lock the implementation contract for resume ownership around the `Workspace`
- Define the runtime role of `Application` as event/history rather than main truth source
- Implement and enforce the four opportunity resume states:
  - `Existing Resume`
  - `Working Draft`
  - `Saved Variant`
  - `Submitted Snapshot`
- Ensure resume generation only uses:
  - approved profile facts
  - approved evidence
  - target opportunity
  - `My ToneAdjust Profile`
  - optional `AI Guidance`
- Make sure submitted snapshots are frozen and never silently mutate later
- Tighten the target-opportunity relationship so resume work is clearly attached to the right opportunity and workspace

## Out Of Scope

- Inbox multi-select
- Passed Bin UI and restore flow
- Notion-like workspace editor or stage journal UI overhaul
- pricing and plan limits
- new tone controls beyond the already accepted direction
- broad normalization or source-refresh work

## Done Means

- A user can clearly tell the difference between an uploaded reference resume, the editable working draft, a saved variant, and a submitted snapshot
- Resume generation pulls from the accepted input contract only
- `Workspace` is the obvious home for notes, guidance, and resume artifacts
- `Application` is no longer treated as a competing source of document truth
- The app preserves an accurate record of what was actually submitted for an opportunity
- The implementation direction is clear enough that the next feature wave can build on it without re-opening core ownership questions

## Verification

- direct browser checks for the target-opportunity resume flow
- targeted tests or runtime checks around document-state behavior
- validation that submitted snapshots remain immutable after later draft edits
- confirmation that the same opportunity shows consistent resume state across resume flow, workspace, and pipeline surfaces

## Risks

- Current schema is still a bridge model with mixed ownership
- `Application.status` and `Workspace.status` both still carry lifecycle meaning in parts of the app
- Resume ownership is currently split across `Resume`, `Artifact`, and `Application.resumePath`
- If this sprint sprawls into Passed Bin or workspace UI work, the core ownership problem may stay unresolved

## Approved Direction

The schema architecture for this sprint is locked in [ADR 008: Resume Document Truth Model](../decisions/008-resume-document-truth-model.md).

Key decisions (already approved — do not re-ask):

1. **Add `workspaceId` FK to Resume.** Resume truth becomes workspace-scoped.
2. **Add `DocumentState` enum** with values: `REFERENCE`, `WORKING_DRAFT`, `SAVED_VARIANT`, `SUBMITTED_SNAPSHOT`.
3. **Submitted snapshots are immutable.** Application-level guard + DB constraint.
4. **Deprecate `Application.resumePath`.** Stop writing to it. Submission truth = `SUBMITTED_SNAPSHOT` rows.
5. **Add `applicationId` FK to Workspace** (optional, nullable). Cross-link only — no lifecycle unification.
6. **Do not change `Application.status` or `Workspace.status`** in this sprint.
7. **Orphan Resume rows stay unlinked.** No auto-migration. Legacy read-only until organically adopted.

Agents: these decisions are settled. Read ADR 008 and proceed to slicing and implementation. Do not re-derive or re-ask for approval.

## Execution Guardrails

- Treat this sprint as schema-sensitive work.
- The architecture direction is approved in ADR 008. No additional architect pass is needed.
- Do not deviate from ADR 008 without explicit human approval.
- Max `2` coder attempts per micro-contract.
- Max `3` loops on the same ownership question before pausing for the human.
- Split schema-sensitive decisions from adjacent UI work instead of bundling them together.

## Read First

1. [ADR 008: Resume Document Truth Model](/home/richard/code/jobs/docs/decisions/008-resume-document-truth-model.md)
2. [Current Pointer](/home/richard/code/jobs/docs/handoffs/current-pointer.md)
3. [Current Implementation Roadmap](/home/richard/code/jobs/docs/plans/current-implementation-roadmap.md)
4. [Resume Input And Voice Strategy](/home/richard/code/jobs/docs/product/resume-input-and-voice-strategy.md)
5. [Opportunity Lifecycle State Contract](/home/richard/code/jobs/docs/product/lifecycle-state-contract.md)

## Next Handback

- The pointer should say the resume/document truth model is implemented, verified, and ready for the next wave:
  - Inbox multi-select and Passed Bin
  - workspace capture
  - later workspace and pipeline refinement on top of the cleaned document model
