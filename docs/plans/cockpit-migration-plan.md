# Cockpit Migration Plan

**Status:** Active Draft  
**Date:** 2026-03-09  
**Purpose:** Define the practical migration from the current page-based app to the cockpit model, card-owned workspace expansion, and embedded Resume Studio using BlockNote only for the CRAFTING editor surface

## What This Plan Governs

This plan turns the accepted cockpit interaction model into implementation phases that can ship without breaking the current product.

It is grounded in:

- [The Cockpit — Interaction Specification](../product/cockpit-interaction-spec.md)
- [Current Implementation Roadmap](./current-implementation-roadmap.md)
- [Resume Customization Product Spec](../product/resume-customization-product-spec.md)
- [Opportunity Lifecycle State Contract](../product/lifecycle-state-contract.md)
- [Resume Input And Voice Strategy](../product/resume-input-and-voice-strategy.md)

## What This Plan Does Not Replace

It does not replace:

- the cockpit interaction spec as the governing UX truth
- the current implementation roadmap as the broader overhaul plan
- the resume customization spec as the trust and voice contract

This plan is the bridge from **today's page-based product** to the **cockpit end state**.

## Current Reality

Today the product still behaves like separate primary pages:

- `dashboard-v2`
- `jobs`
- `triage`
- `passed`
- `pipeline`
- `resume`
- `career`
- `workspace/[id]`

Important truth already in place:

- lifecycle state is moving toward `NEW → INTERESTED → CRAFTING → APPLIED → SCREENING → INTERVIEW → OFFER`
- resume and artifact ownership now live on the workspace side of the model
- passed-bin recovery exists
- Resume Builder and Profile Builder are already better aligned with structured truth

Important gap:

- the interaction model is still page-first
- the cockpit wireframe and cockpit spec are ahead of implementation
- Resume Studio still exists as a separate page concept instead of a CRAFTING workspace section

## Migration Principles

1. Ship the cockpit as a **new shell over the same opportunity state**, not as a separate product.
2. Keep old pages as **transitional fallbacks** until the cockpit equivalent is good enough.
3. Move one user job at a time into the cockpit:
   - re-enter work
   - triage
   - move through stages
   - craft
   - apply
4. Do not let BlockNote sprawl beyond the editor surface.
5. Preserve the current truth that:
   - artifacts belong to the workspace
   - source names stay hidden until submission
   - submitted packages are immutable

## BlockNote Boundary

### BlockNote Owns

- the editable resume document surface inside CRAFTING
- the editable cover-letter document surface, if we use the same document model later
- block-level editing interactions inside Resume Studio
- document rendering helpers for the editing surface

### BlockNote Does Not Own

- the cockpit shell
- the river / pipeline lane
- workspace expansion and collapse
- voice tuning controls
- keyword coverage overlay
- transparent diff / preview-confirm review
- artifact version picker
- apply / submit controls
- workspace notes, history, and stage chrome

### Source-of-Truth Rule

BlockNote is the editor surface, not the canonical truth model.

JobScout remains responsible for:

- structured resume truth
- workspace artifact ownership
- versioning
- submitted snapshots
- fact lock and review controls

### BlockNote Integration Notes

Use BlockNote for the editable document body only.

Practical constraints from the current BlockNote docs:

- treat the editor as a client-side React surface inside Resume Studio
- keep JobScout chrome outside the editor:
  - voice tuning
  - keyword overlay
  - transparent diff
  - artifact/version controls
- use custom schemas only where resume-specific blocks are truly needed
- do not make this plan depend on BlockNote owning suggestions, version history, or review workflows
- keep export and submission tied to JobScout's structured artifact model

## Transitional Surface Strategy

These surfaces should remain temporarily while the cockpit grows:

| Surface | Transitional Role | Retire When |
|---|---|---|
| `dashboard-v2` | launch point while cockpit matures | cockpit becomes default signed-in start |
| `jobs` / `triage` | fallback discovery and volume triage | `While You Were Out` + cockpit triage are trustworthy |
| `passed` | fallback recovery surface | passed filter/toggle is fully usable in the cockpit |
| `pipeline` | fallback pipeline page | the river and workspace expansion cover the same workflows |
| `resume` | fallback Resume Studio route | CRAFTING workspace editor is trustworthy |
| `workspace/[id]` | fallback deep workspace route | card-owned expansion covers the real job-to-work flow |

The rule is simple:

- cockpit becomes primary first
- old pages become fallbacks second
- old pages are removed last

## Phased Migration

### Phase 1 — Cockpit Shell And Read-Only River

**Goal**

Ship the cockpit route and shell without breaking current pages.

**Move first**

- create the cockpit as the new primary signed-in surface
- add the three top-level cockpit zones:
  - Recent Activity
  - While You Were Out
  - The River
- populate them from existing opportunity/workspace state
- keep navigation fallback available during transition

**What stays transitional**

- no workspace expansion yet
- old pages remain the way users complete work
- river cards can still deep-link to old pages during the first pass if needed

**Dependencies**

- stable counts and stage mapping from current opportunity/workspace state
- reliable recent-activity query
- agreed cockpit route and shell ownership

**Proof points**

- signed-in user lands on the cockpit route
- the river reflects the same opportunities visible in existing pipeline surfaces
- Recent Activity correctly links the user back into live work
- While You Were Out shows real counts, not mock framing only

### Phase 2 — Discovery, Triage, And Passed Flow Inside The Cockpit

**Goal**

Move the user's top-of-funnel control into the cockpit without forcing a full page hop.

**Move first**

- make While You Were Out the real discovery summary
- wire the swipe CTA into the breakout triage mode
- add passed toggle / reveal behavior inside the cockpit
- reflect save/pass decisions back into the river immediately

**What stays transitional**

- old `jobs`, `triage`, and `passed` pages remain as fallback tooling
- deep filtering can stay outside the cockpit until structured filters are ready

**Dependencies**

- shared state between swipe, discovery, passed recovery, and river
- safe restore behavior
- mobile-safe triage controls

**Proof points**

- save in Swipe Mode creates or reveals the card in `INTERESTED`
- pass in Swipe Mode removes the card from active discovery and makes it recoverable
- passed toggle shows recoverable opportunities inline without losing context

### Phase 3 — Card-Owned Workspace Expansion

**Goal**

Replace generic page navigation with card-owned depth.

**Move first**

- click a river card to expand the workspace in place
- preserve spatial continuity between card and workspace
- show stage-specific workspace content for:
  - `INTERESTED`
  - `CRAFTING`
  - `APPLIED`
  - `SCREENING`
  - `INTERVIEW`
  - `OFFER`
- keep previous stage sections available as collapsed history

**What stays transitional**

- old `workspace/[id]` remains as an escape hatch
- shared-element animation can start simple before full polish

**Dependencies**

- stable workspace reads by job/opportunity
- stage-specific content framing
- route/state strategy for expanded vs collapsed workspace

**Proof points**

- clicking a card opens the workspace without feeling like a new app
- closing the workspace returns the user to the same river context
- notes and artifacts remain visible as the opportunity changes stage

### Phase 4 — Embedded CRAFTING Workbench

**Goal**

Move the current Resume Builder concepts into the workspace where they belong, before swapping the editor technology.

**Move first**

- embed a CRAFTING section inside the expanded workspace
- move the existing tailoring controls into that section
- show:
  - current draft
  - variant chooser
  - voice tuning
  - keyword coverage area
  - generate action
  - artifact/version context

**What stays transitional**

- old `/resume` route remains a fallback
- the first embedded editor can still use current draft components before BlockNote arrives

**Dependencies**

- workspace artifact and draft reads
- trustworthy target-opportunity context
- saved variant model

**Proof points**

- user can enter CRAFTING from the cockpit card
- generate/save/export still attach to the same workspace truth
- switching opportunities does not lose the active draft context

### Phase 5 — BlockNote Resume Studio Inside CRAFTING

**Goal**

Replace the temporary draft editor with a Notion-like editing surface inside CRAFTING.

**Move first**

- embed BlockNote only inside Resume Studio
- map structured resume truth into editor content
- support draft editing, saved variants, and clean reload from workspace truth
- keep the first BlockNote rollout conservative:
  - standard block editing first
  - resume-specific block types only after the save/load boundary is stable
- keep side panels custom for:
  - voice tuning
  - keyword coverage overlay
  - transparent diff / preview-confirm
  - artifact actions

**What stays transitional**

- `/resume` can remain as a fallback during the first BlockNote rollout
- cover-letter editing can follow after resume drafting if needed

**Dependencies**

- a clear mapping between structured resume truth and BlockNote blocks
- save/load strategy that does not let the editor become the source of truth
- export path from structured truth or controlled editor serialization

**Proof points**

- opening CRAFTING shows the correct draft in BlockNote for the selected opportunity
- edits round-trip safely back to workspace-owned draft truth
- switching variants or versions reloads the right content
- voice tuning and keyword overlay still work outside the editor body

### Phase 6 — Apply Flow, Submitted Snapshots, And Source Reveal

**Goal**

Finish the cockpit loop from crafting to real submission.

**Move first**

- make `CRAFTING -> APPLIED` an explicit action in the workspace
- require variant selection before submission
- create immutable submitted snapshots
- reveal source link only at submission time
- move the card to `APPLIED` in the river

**What stays transitional**

- older apply entry points can remain temporarily if they write the same workspace snapshot truth

**Dependencies**

- immutable snapshot creation
- source reveal policy
- trustworthy submission package model

**Proof points**

- moving to `APPLIED` creates a saved submitted artifact set
- APPLIED workspace shows exactly what was sent
- source stays hidden during earlier stages and appears at submission

### Phase 7 — Retirement Of The Old Page Model

**Goal**

Make the cockpit the real app instead of one more route.

**Move first**

- make cockpit the default signed-in home
- demote or remove menu items that duplicate cockpit behavior
- keep only true long-lived separate pages:
  - Settings
  - Profile / Voice Setup

**Dependencies**

- cockpit parity for everyday workflows
- stable workspace expansion
- CRAFTING workbench and submission package trustworthy

**Proof points**

- most daily work is completed without leaving the cockpit
- old resume/workspace/pipeline pages are no longer necessary for normal use
- support burden from “where did this go?” confusion drops

## Risks

### 1. Route-Sprawl During Transition

Risk:
- users and developers may keep treating old pages as primary

Mitigation:
- make the cockpit the clear default as early as Phase 1
- mark old pages as fallback or legacy during transition

### 2. BlockNote Becoming The Truth Model

Risk:
- the editor could accidentally become the document system of record

Mitigation:
- preserve structured workspace-owned truth
- keep serialization boundaries explicit
- treat BlockNote as the editor surface only
- keep review, diff, and submission outside the editor body

### 3. Workspace Expansion Feeling Fragile

Risk:
- if expansion loses state or feels janky, trust drops quickly

Mitigation:
- ship a stable expansion first
- add richer motion only after the state model is solid

### 4. CRAFTING Scope Creep

Risk:
- resume, cover letter, keyword overlay, voice tuning, diff, and artifacts can sprawl into a mini-app before the cockpit shell is stable

Mitigation:
- phase the CRAFTING workbench in two steps:
  - embed current tooling first
  - swap in BlockNote second

### 5. Page Retirement Too Early

Risk:
- removing old pages before parity will create regressions and panic

Mitigation:
- retire routes only after cockpit proof is strong
- use transitional fallbacks deliberately

## Recommended Build Order

Build in this order:

1. cockpit shell
2. read-only river + recent activity + while-you-were-out
3. cockpit triage and passed recovery
4. card-owned workspace expansion
5. embedded CRAFTING workbench using current draft tooling
6. BlockNote inside Resume Studio
7. apply flow and submitted snapshots
8. retire old page-first navigation

## Success Criteria

This migration is successful when:

- the signed-in user thinks in terms of one cockpit, not many pages
- clicking a card feels like opening depth inside the same system
- CRAFTING is the real home of resume work
- BlockNote improves editing without owning the shell or truth model
- the app can show exactly what was crafted, saved, and submitted for one opportunity

## References

- [The Cockpit — Interaction Specification](../product/cockpit-interaction-spec.md)
- [Current Implementation Roadmap](./current-implementation-roadmap.md)
- [Resume Customization Product Spec](../product/resume-customization-product-spec.md)
- [BlockNote React Overview](https://www.blocknotejs.org/docs/react/overview)
- [BlockNote Custom Schemas](https://www.blocknotejs.org/docs/features/custom-schemas)
- [BlockNote shadcn Integration](https://www.blocknotejs.org/docs/getting-started/shadcn)
