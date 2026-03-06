# ADR 004: Opportunity and Workspace Naming Standard

**Status**: Accepted  
**Date**: 2026-03-06  
**Author**: Product + Engineering

## Context

The product language has been inconsistent (`job`, `card`, `workspace`, `application`) and this creates confusion in docs, UX copy, and implementation conversations.

## Decision

Standardize naming:

- `Opportunity` = the job itself (the thing discovered from sources).
- `Workspace` = the Notion-like operating area tied to one opportunity.
- `Stage Journal` = per-stage notes/artifacts/context inside a workspace.

## Definitions

### Opportunity

Canonical user-facing object representing a single job opening.
This is what appears in inbox triage and pipeline views.

### Workspace

The depth surface for an opportunity:
- notes
- stage journals
- documents/artifacts
- activity history
- checklists and blockers

### Stage Journal

A stage-scoped record of context and actions, for example:
- triage rationale
- preparation notes
- applied submission details
- screening/interview updates

## Consequences

### Positive

- Cleaner product language across docs and UI.
- Less ambiguity when discussing lifecycle and state.
- Easier onboarding for future contributors.

### Negative

- Existing references to `job card` and generic `workspace` phrasing require gradual cleanup.

## Scope

This ADR is a naming standard. It does not by itself change database schema.

