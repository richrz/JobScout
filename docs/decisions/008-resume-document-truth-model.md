# ADR 008: Resume Document Truth Model

**Status**: Accepted
**Date**: 2026-03-08
**Author**: Product + Engineering

## Context

The resume system has fractured ownership that blocks reliable mass-tailored application flow:

- **Resume model** is tied to `userId` + `jobId`, optionally linked to an `Application`. Holds JSON content, tailoringMode, pdfSnapshot, atsScore, feedback. Has no link to `Workspace`.
- **Artifact model** is tied to `workspaceId`. Generic type field (RESUME, COVER_LETTER, OTHER). Holds storagePath and optional content. No link to `Resume`.
- **Application.resumePath** is a bare string path. No FK or immutability guarantee. Competes with `Resume` for "what was submitted."

Lifecycle ownership is also split:

- `Application.status` is a free string defaulting to `"discovered"`.
- `Workspace.status` uses the `ApplicationStatus` enum.
- These are independent — no FK between `Application` and `Workspace`.
- Both link to `Job` + `User` independently with no cross-reference.

ADR 007 defined four resume states (`Existing Resume`, `Working Draft`, `Saved Variant`, `Submitted Snapshot`) but none exist in schema or code yet.

Without this decision, every agent session re-derives the architecture from scratch, and the approval evaporates at session end.

## Decision

### 1. Workspace owns resume work

Add `workspaceId` FK to `Resume`. Each resume belongs to exactly one workspace (and transitively to one opportunity). This replaces the current loose `userId` + `jobId` scoping.

### 2. DocumentState enum on Resume

Add a `documentState` enum to `Resume` with values:

- `REFERENCE` — uploaded existing resume, not tailored
- `WORKING_DRAFT` — editable, opportunity-scoped
- `SAVED_VARIANT` — named snapshot of a draft, still editable
- `SUBMITTED_SNAPSHOT` — frozen record of what was actually sent

This replaces the implicit state that was previously inferred from code paths.

### 3. Submitted snapshots are immutable

When `documentState = SUBMITTED_SNAPSHOT`, the `content`, `pdfSnapshot`, and `atsScore` fields are immutable. Enforcement: application-level guard + DB trigger or check constraint.

### 4. Deprecate Application.resumePath

Stop writing to `Application.resumePath`. Submission truth lives on `Resume` rows with `documentState = SUBMITTED_SNAPSHOT` linked to the workspace. Existing data stays as legacy read-only. Migration of historical data is deferred.

### 5. Bridge Application ↔ Workspace

Add `applicationId` FK to `Workspace` (optional, nullable). This gives a cross-reference so queries can traverse both models. This does not unify `Application.status` and `Workspace.status` — lifecycle unification is Phase 1 roadmap scope, not this sprint.

### 6. Do not change lifecycle status in this sprint

`Workspace.status` and `Application.status` remain as-is. Lifecycle unification is out of scope. This sprint only cleans the document-truth model.

### 7. Migration posture

Orphan `Resume` rows (those without a matching workspace) remain unlinked for now. They are not auto-assigned to new workspaces. They stay accessible as legacy read-only until organically adopted through normal user workflow.

## Invariants

- One `Workspace` per `(userId, jobId)` — already enforced by `@@unique`.
- Every new `Resume` belongs to exactly one `Workspace`.
- `SUBMITTED_SNAPSHOT` rows are immutable once created.
- Resume generation inputs are: profile facts, evidence, target opportunity, ToneAdjust profile, optional AI guidance — no other sources.
- `Artifact` table continues to exist for non-resume files; resume-type artifacts should reference the `Resume` row rather than duplicating content.

## Consequences

### Positive

- Resume ownership has exactly one home (`Workspace`), ending the three-way split.
- Document state is explicit in schema, not inferred from code paths.
- Submitted history is immutable by design, not by convention.
- The `Application ↔ Workspace` cross-link enables queries without unifying lifecycle prematurely.
- Orphan migration is deferred, avoiding risky data backfill during schema change.

### Negative

- `Application.resumePath` becomes legacy debt that still exists in the schema until a cleanup migration.
- Orphan `Resume` rows are temporarily in limbo (accessible but not workspace-scoped).
- The `applicationId` FK on `Workspace` adds a cross-link between models that were previously independent — future lifecycle unification must account for this.

## Scope

This ADR locks the schema direction for the resume document truth model. It does not cover:

- Lifecycle status unification (`Application.status` vs `Workspace.status`)
- Passed Bin or workspace UI changes
- Evidence library or profile fact extraction
- Pricing, plan limits, or billing tiers
