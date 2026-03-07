# Current Implementation Roadmap

**Status:** Active  
**Date:** 2026-03-06  
**Purpose:** Canonical execution plan for the next major JobScout update

## What This Roadmap Governs

This roadmap translates the current accepted product truth into implementation phases.

It is grounded in:

- [ADR 004: Opportunity and Workspace Naming](../decisions/004-opportunity-workspace-naming.md)
- [ADR 005: Opportunity Lifecycle State Contract](../decisions/005-opportunity-lifecycle-state-contract.md)
- [Job Ingestion Normalization Contract](../product/normalization-contract.md)
- [Opportunity Lifecycle State Contract](../product/lifecycle-state-contract.md)

## What This Roadmap Does Not Replace

It does not replace:

- the umbrella PRD
- the KC scraper workstream plans
- historical redesign ideas

Those remain supporting references.
This roadmap is the active implementation plan for the product overhaul now in front of us.

## Product Goal

Turn JobScout into one coherent opportunity management product where:

- all inbound jobs become normalized `Opportunities`
- Inbox and JobSwipe operate on the same state
- `PASSED` is recoverable, searchable, and safe
- Pipeline reflects real lifecycle rules instead of loose board movement
- every opportunity owns one `Workspace`
- artifacts, notes, and application events stay attached to that opportunity across the full journey

## Phase Overview

### Phase 1 — Unify The Opportunity Model

Goal:
- establish one canonical opportunity-state model across Inbox, JobSwipe, Pipeline, Resume Builder, and Workspace

Key outcomes:
- choose and enforce one source of truth for user-state on an opportunity
- map existing application/workspace behavior into the accepted lifecycle contract
- define migration and compatibility rules for current data
- ensure the same user action means the same thing everywhere

Done when:
- save, pass, restore, prepare, and apply all map to one lifecycle model
- no major surface invents its own disconnected status logic

### Phase 2 — Tighten Discovery And Triage

Goal:
- make Inbox the reliable control center for volume management

Key outcomes:
- Inbox and JobSwipe share the same active discovery set
- multi-select and batch actions exist in Inbox
- `PASSED` becomes a real passed bin with restore behavior
- search, filter, and batch flow are usable on desktop and mobile

Priority UX problems to solve:
- batch pass for poor-fit opportunities
- searchable passed bin
- notes captured during save/triage carry forward
- mobile controls never obscure primary actions

Done when:
- users can search a phrase, select many opportunities, and pass/restore safely
- accidental passes are no longer destructive

### Phase 3 — Build The Workspace Layer

Goal:
- make every opportunity feel like one continuous operating surface

Key outcomes:
- each opportunity has one workspace
- workspaces expose stage journals instead of fragmented notes
- stage journals preserve historical context as the opportunity moves
- the workspace becomes the home for notes, blockers, contacts, and artifacts

Recommended UX shape:
- lightweight cards in list/board views
- detail depth in a right-side panel on desktop
- sheet or focused full-screen view on mobile

Done when:
- an opportunity can move through stages without losing notes or context
- the workspace feels like the canonical home of the opportunity

### Phase 4 — Make Pipeline Movement Truthful

Goal:
- replace cosmetic drag-and-drop with rule-based state movement

Key outcomes:
- only allowed transitions are available
- lightweight stages can drag between each other
- real-world milestones require explicit actions
- blocked moves show clear requirements

Required behaviors:
- `INTERESTED <-> PREP` can stay lightweight
- `PREP -> APPLIED` requires a submission package
- later-stage reversions require explicit correction flow, not silent board dragging

Done when:
- the board visually reflects the lifecycle contract
- users understand why a move is or is not allowed

### Phase 5 — Unify Artifacts And Application Events

Goal:
- make document state trustworthy

Key outcomes:
- drafts live in the workspace
- submitted artifacts become immutable snapshots
- application events record when, where, and how something was submitted
- resume generation, saving, and applying all attach to the same opportunity/workspace system
- resume creation and handling become explicit and trustworthy across draft, tailored, imported, and submitted states
- document ownership, versioning, and restore behavior stop depending on which tab the user happened to use

Done when:
- “select a target job” in resume flow has a trustworthy relationship to the opportunity
- the app can show the exact package sent for a real application state
- users can understand the difference between an editable draft, a saved variant, and the submitted snapshot

### Phase 6 — Normalize Intake And Refresh Sources

Goal:
- ensure opportunity quality before anything reaches Inbox

Key outcomes:
- `refresh sources` runs deterministic normalization first
- selective LLM enrichment fills uncertain fields
- dedupe and validation happen before Inbox visibility
- filters rely on structured data instead of raw strings

Critical outputs:
- reliable `work_mode`
- normalized location
- job type, seniority, salary structure
- source confidence and versioning

Done when:
- filters such as remote / hybrid / on-site work on mixed-source jobs
- opportunities from different sources behave the same downstream

### Phase 7 — Polish, Guardrails, And Verification

Goal:
- make the new system stable and pleasant instead of merely correct

Key outcomes:
- mobile workflows are first-class
- transition rules are visible and understandable
- link between product docs and implementation stays current
- verification covers the critical discovery-to-apply path

Verification focus:
- Inbox batch triage
- passed bin restore flow
- workspace note continuity
- apply gating
- submitted artifact snapshotting
- normalized filter behavior

Done when:
- the system is robust enough that users do not need to guess where an opportunity went or why

## Implementation Order Recommendation

Build in this order:

1. opportunity state model
2. Inbox and passed bin
3. workspace and stage journals
4. pipeline rules
5. artifacts and application events
6. normalization hardening
7. polish and verification

This order matters because the UI should not be rebuilt on top of fuzzy state.

## What To Defer

Defer until the core flow is solid:

- geocoding and radius-based location enrichment
- advanced analytics polish
- ambitious visual experimentation that does not support the lifecycle
- broad source expansion beyond what the normalization contract can support cleanly

## Success Test

The roadmap is successful when one user can:

1. refresh sources
2. see normalized opportunities in Inbox
3. batch pass poor fits into a recoverable bin
4. save strong fits and capture first thoughts
5. open one workspace and continue from those notes
6. prepare and attach documents
7. move into applied state only when requirements are met
8. recover history, notes, and submitted artifacts later without confusion
