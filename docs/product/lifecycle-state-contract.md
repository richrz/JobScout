# Opportunity Lifecycle State Contract

**Status:** Accepted  
**Date:** 2026-03-06

## Purpose

This document defines the official lifecycle for an `Opportunity` and the rules that connect:

- Inbox
- JobSwipe
- Pipeline
- Resume Builder
- Workspace

The goal is to stop each surface from behaving like its own mini-app.

## Canonical Model

- `Opportunity` = the job itself
- `Workspace` = the durable operating space tied to one opportunity
- `Stage Journal` = stage-specific notes, artifacts, and context inside the workspace
- `Artifact` = resume, cover letter, recruiter material, prep file, or snapshot tied to the workspace
- `Application Event` = a real-world submission or follow-up event recorded against the opportunity

## Core Rules

1. Every opportunity has one workspace.
2. Inbox, JobSwipe, Pipeline, and Resume Builder are views into the same opportunity state.
3. A card is presentation only. It is not the source of truth.
4. Passing an opportunity is always recoverable for a defined period.
5. Documents belong to the workspace, not to a tab.
6. Submission artifacts become immutable snapshots once the opportunity is marked `APPLIED`.

## Lifecycle States

### Active Discovery

- `NEW`
  - Meaning: newly ingested, normalized, deduped, and available for triage
  - Primary surfaces: Inbox and JobSwipe
- `INTERESTED`
  - Meaning: user wants to pursue the opportunity
  - Primary surfaces: Pipeline and Workspace
- `PREP`
  - Meaning: user is actively preparing materials or research before applying
  - Primary surfaces: Pipeline and Workspace

### Active Pursuit

- `APPLIED`
  - Meaning: the opportunity has been submitted through an employer channel
  - Primary surfaces: Pipeline and Workspace
- `SCREENING`
  - Meaning: recruiter or early-stage screening activity is in progress
  - Primary surfaces: Pipeline and Workspace
- `INTERVIEW`
  - Meaning: interview-stage activity is in progress
  - Primary surfaces: Pipeline and Workspace
- `OFFER`
  - Meaning: an offer or offer-like outcome is active
  - Primary surfaces: Pipeline and Workspace

### Recoverable / Closed

- `PASSED`
  - Meaning: opportunity was intentionally removed from active pursuit but remains restorable
  - Primary surfaces: Passed Bin and Workspace
- `REJECTED`
  - Meaning: employer closed the opportunity against the user
  - Primary surfaces: closed views and Workspace
- `WITHDRAWN`
  - Meaning: user intentionally ended pursuit after previously moving forward
  - Primary surfaces: closed views and Workspace
- `ARCHIVED`
  - Meaning: opportunity is retained for history and search, but no longer active in default views
  - Primary surfaces: archive views and Workspace

## View Contract

### Inbox

- Inbox is the active discovery view for `NEW` opportunities.
- Inbox may expose `PASSED` through an explicit bin/filter, but passed items do not vanish from history.
- Batch actions belong here because this is where users manage volume.

### JobSwipe

- JobSwipe is a rapid interaction mode over the same active opportunity set as Inbox.
- JobSwipe is not a separate feed or independent state system.
- Notes captured during a save action in JobSwipe must carry into the workspace history and remain visible after the opportunity moves to `INTERESTED`.

### Pipeline

- Pipeline begins at `INTERESTED`.
- Pipeline does not create its own state. It reflects the same lifecycle state held by the opportunity.
- Only stages from `INTERESTED` forward appear as pipeline columns.

### Workspace

- Workspace is available from any lifecycle state.
- Workspace is the canonical home for notes, journals, documents, checklists, contacts, and history.

### Resume Builder

- Resume Builder is a workspace tool.
- It reads and writes workspace artifacts for a selected opportunity.
- A generated draft is not a submission record until it is snapshotted into an `Application Event`.

## Allowed Transitions

- `NEW -> INTERESTED`
  - Manual action from Inbox or JobSwipe
- `NEW -> PASSED`
  - Manual single or batch action from Inbox or JobSwipe
- `INTERESTED -> PREP`
  - Manual move when the user begins active preparation
- `INTERESTED -> PASSED`
  - Manual pass, preserving workspace history
- `PREP -> INTERESTED`
  - Manual move when the user wants to keep the opportunity warm without active prep
- `PREP -> APPLIED`
  - Explicit apply action only after blockers are cleared
- `PREP -> PASSED`
  - Manual pass, preserving workspace history
- `APPLIED -> SCREENING`
  - Manual or assisted update based on recruiter contact
- `APPLIED -> INTERVIEW`
  - Manual update when interview activity begins without a distinct screening step
- `APPLIED -> REJECTED`
  - Manual update with outcome note
- `APPLIED -> WITHDRAWN`
  - Manual update with withdrawal note
- `SCREENING -> INTERVIEW`
  - Manual update
- `SCREENING -> REJECTED`
  - Manual update with outcome note
- `SCREENING -> WITHDRAWN`
  - Manual update with withdrawal note
- `INTERVIEW -> OFFER`
  - Manual update with offer details
- `INTERVIEW -> REJECTED`
  - Manual update with outcome note
- `INTERVIEW -> WITHDRAWN`
  - Manual update with withdrawal note
- `OFFER -> ARCHIVED`
  - Manual close-out when the decision is complete
- `REJECTED -> ARCHIVED`
  - Manual or automated after retention threshold
- `WITHDRAWN -> ARCHIVED`
  - Manual or automated after retention threshold
- `PASSED -> prior active state`
  - Restore returns the opportunity to the last active state when known
- `PASSED -> NEW`
  - Fallback restore when no prior active state exists

## Transition Guardrails

### Free Drag-and-Drop

Allowed for lightweight planning movement only:

- `INTERESTED <-> PREP`

### Explicit Actions Instead of Drag-and-Drop

Required when the move represents a real-world event:

- `PREP -> APPLIED`
- any move after `APPLIED`
- any restore from `PASSED`

### Blocked Moves

- `NEW -> APPLIED` is blocked
- `NEW -> SCREENING` is blocked
- `INTERESTED -> APPLIED` is blocked
- `PASSED` cannot be reached by hard delete
- `APPLIED` and later stages cannot be rewound by casual drag-and-drop

If a later-stage correction is needed, it should use an explicit revert flow with an audit note, not a silent board move.

## Readiness and Blockers

### To Enter `PREP`

No hard requirements.
This stage is intentionally lightweight so users can collect thoughts early.

### To Enter `APPLIED`

The workspace must contain:

- at least one submitted resume snapshot
- submission timestamp or equivalent application event record
- application channel or destination when known

Optional but recommended:

- submitted cover letter snapshot
- compensation note
- recruiter/contact note

### To Enter `SCREENING` or Later

The move should create or attach:

- a dated note, event, or journal entry explaining what changed

This preserves timeline truth without forcing heavy ceremony.

## Stage Journal Contract

Every workspace supports journals for each major stage, but they should appear as lightweight stubs until used.

Minimum journals:

- `Triage`
- `Interested`
- `Prep`
- `Applied`
- `Screening`
- `Interview`
- `Offer`
- `Passed`
- `Closed`

Rules:

- Notes created during `NEW` triage remain visible after the opportunity moves forward.
- Stage journals preserve time-specific context rather than overwriting prior notes.
- Users should never lose notes because a card changed columns.

## Artifact Contract

Artifacts are universal workspace objects.
They are not owned by Inbox, Pipeline, or Resume Builder.

### Editable Artifacts

- draft resume
- draft cover letter
- research notes
- recruiter notes
- interview prep materials

### Immutable Artifacts

- submitted resume snapshot
- submitted cover letter snapshot
- employer-provided documents that should remain historically accurate

Rule:

Once an opportunity enters `APPLIED`, the submitted package is frozen as a snapshot.
Future edits create new drafts, not retroactive mutation of what was sent.

## Passed Bin Policy

- `PASSED` is a searchable, recoverable holding state
- default retention window: 90 days from the most recent pass action
- restore returns to the prior active state when available
- passing does not destroy workspace notes, journals, or artifacts

After the retention window, the opportunity may auto-move to `ARCHIVED` while preserving history.

## Search and Filter Dependency

This lifecycle assumes the opportunity has already passed the normalization contract.

See:

- [normalization-contract.md](./normalization-contract.md)

Structured fields must drive Inbox filters and JobSwipe filtering.
Lifecycle quality depends on normalized opportunity data.

## Mobile Guardrail

- Primary stage actions must remain visible above fixed mobile navigation
- Workspace detail must have a mobile form such as a sheet or full-screen detail view
- Stage journals and artifacts must remain usable without assuming desktop width

## Product Outcome

If this contract is followed:

- Inbox and JobSwipe share the same truth
- passing is safe and recoverable
- pipeline movement becomes intentional instead of sloppy
- document state becomes universal
- users can understand where an opportunity is and why
