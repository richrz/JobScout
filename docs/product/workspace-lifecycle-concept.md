# Opportunity and Workspace Lifecycle Concept

**Status:** Concept Companion  
**Date:** 2026-03-06

Binding lifecycle rules now live in:
- [lifecycle-state-contract.md](./lifecycle-state-contract.md)

## Why This Exists

The product currently behaves like several partially-connected apps:
- Inbox
- JobSwipe
- Pipeline
- Resume Builder
- Workspace/notes/artifacts

This document proposes one product shape so the experience feels continuous instead of fragmented.

## Canonical Naming

- `Opportunity` = the job object discovered from sources.
- `Workspace` = the Notion-like operating area tied to one opportunity.
- `Stage Journal` = stage-specific context inside a workspace.

This document follows that naming standard.

## Core Product Idea

Every opportunity gets one durable home for the user relationship.

Recommended term:
- `Workspace` = the job's full operating space

Inside the workspace, each stage gets its own structured area.

Recommended term:
- `Stage Journal` = notes, docs, reminders, and evidence tied to one stage in the journey

This is better than creating separate disconnected mini cards for every column.

## Mental Model

- `Opportunity` = the external requisition from any source
- `Workspace` = the user's canonical relationship to that job
- `Stage Journal` = what happened at each stage
- `Artifacts` = documents, snapshots, recruiter materials, prep notes, attachments

The board is only a visual lens into the workspace.
The card is not the source of truth.

## Product Flow

### 1. Inbox

Purpose:
- Review all incoming jobs from all sources
- Search, filter, batch act, and triage

Key actions:
- Save to pursue
- Pass to recoverable bin
- Batch select and act on groups of jobs

Important behavior:
- Passing is not deletion
- Inbox needs multi-select before the pipeline does

### 2. JobSwipe

Purpose:
- Fast-focus triage mode

Better UX shape:
- The screen stays visually clean by default
- When the user saves a promising job, a lightweight composer appears
- The composer captures quick intent:
  - why it feels like a fit
  - first thoughts
  - next action

This should feel like a "capture moment," not permanent clutter.

Recommended behavior:
- Default card remains simple
- On save, show a compact stub/composer rather than a permanent large editor
- Saved quick notes become the opening entry in the workspace's `Triage` or `Interested` journal

### 3. Workspace

Purpose:
- The real home of the opportunity

Best interaction model:
- Clicking a card opens a right-side panel or focused detail screen
- The board stays lightweight
- Depth lives in the workspace

The workspace should contain:
- Overview
- Current stage
- Stage journals
- Artifacts/documents
- Recruiter/contact log
- Timeline/history
- Checklists and blockers

## Recommended Lifecycle

The accepted lifecycle contract is:

- `NEW`
- `INTERESTED`
- `PASSED`
- `PREP`
- `APPLIED`
- `SCREENING`
- `INTERVIEW`
- `OFFER`
- `REJECTED`
- `WITHDRAWN`
- `ARCHIVED`

`READY_TO_APPLY` should be treated as a readiness condition inside `PREP`, not a separate lifecycle state.

## Stage Journal Concept

Each workspace keeps journals by stage rather than forcing all notes into one blob.

Examples:
- `Triage` journal:
  - why it stood out
  - initial fit thoughts
  - quick concerns
- `Interested` journal:
  - deeper fit reasoning
  - company research
  - role questions
- `Prep` journal:
  - draft positioning
  - must-hit resume bullets
  - cover letter ideas
- `Applied` journal:
  - exact date/time submitted
  - submission notes
  - exact docs sent
- `Screening` journal:
  - recruiter call notes
  - phone screen questions
  - compensation signals
- `Interview` journal:
  - prep notes
  - interview loops
  - takeaways

## Document Model

Documents should not belong to a tab.
They should belong to the workspace.

Recommended document types:
- Draft resume
- Draft cover letter
- Submitted resume snapshot
- Submitted cover letter snapshot
- Recruiter-provided materials
- Interview prep docs

Important distinction:
- Drafts remain editable
- Submitted artifacts become immutable snapshots

## Board Movement Rules

Pipeline movement should be rule-based, not universally free drag-and-drop.

Examples of rules:
- `NEW -> INTERESTED`: manual
- `INTERESTED -> PREP`: manual
- `PREP -> APPLIED`: requires submission package and blockers cleared
- `APPLIED -> SCREENING`: manual or imported from user updates
- `SCREENING -> INTERVIEW`: manual
- `INTERVIEW -> OFFER / REJECTED / WITHDRAWN`: manual

This means:
- Some transitions allow drag-and-drop
- Some transitions are blocked with a clear explanation
- Some later transitions can be automated or assisted

## Passed Bin / Recovery

Passing an opportunity should create a recoverable state, not disappearance.

Recommended concept:
- `Passed Bin`

Requirements:
- Searchable
- Restorable
- Retention-based
- Separate from archive

Accepted direction:
- Default retention is 90 days
- Restore returns to the prior active state when known
- Passed opportunities keep notes and artifacts

## Data Normalization Requirement

Inbox filtering will stay unreliable until incoming jobs are normalized into structured fields.

Minimum desired structured fields:
- work mode: remote / hybrid / on-site
- normalized city
- normalized state
- seniority
- job type
- salary min
- salary max
- normalized source type
- extracted skills

The UI should filter on structured data first, not raw strings.

## Mobile Guardrail

The redesign must treat mobile as a first-class product, not a later cleanup.

Principles:
- Cards must never be obscured by fixed chrome
- Primary actions must remain thumb-reachable
- Right-side panel patterns need a mobile fallback:
  - bottom sheet
  - full-screen detail view
  - staged drill-in

## Open UX Bug To Track

- Mobile JobSwipe bottom tab tray is currently covering the save/pass controls at the bottom of the screen. This must be fixed during the lifecycle/workspace redesign so actions remain usable on mobile.

## Product Test: A Day In The Life

Morning:
- User opens Inbox
- Searches "database administrator"
- Multi-selects a batch
- Passes poor fits into Passed Bin
- Saves a few into pursuit

Midday:
- User opens JobSwipe for quick triage
- Saves a strong role
- Quick capture composer appears
- User writes why it seems promising
- That note becomes the first entry in the workspace journal

Afternoon:
- User opens the workspace from the board
- Adds company research
- Generates or edits resume draft
- Completes required checklist items
- Moves card toward apply-ready state

After applying:
- Submitted resume is snapshotted into the `Applied` stage
- Recruiter call notes land in `Screening`
- Interview prep materials land in `Interview`

The product should feel like one continuous conversation with the job, not five different tools.

## Next Design Questions

- What is the best name for `Passed Bin`?
- What is the best name for `Stage Journal` if we want more premium language?
- Which stages should appear as board columns vs only inside the workspace?
- Should JobSwipe write to `Triage` or directly to `Interested`?
- What fields are required before a card can advance into `READY_TO_APPLY` or `APPLIED`?
