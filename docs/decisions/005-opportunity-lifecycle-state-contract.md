# ADR 005: Opportunity Lifecycle State Contract

**Status**: Accepted  
**Date**: 2026-03-06  
**Author**: Product + Engineering

## Context

The product currently spreads user state across multiple surfaces:

- Inbox
- JobSwipe
- Pipeline
- Resume Builder
- Workspace

This creates ambiguous behavior:

- a save in one surface does not always mean the same thing in another
- a pass can feel irreversible
- documents appear attached to tabs instead of to the opportunity itself
- pipeline movement can become cosmetic instead of truthful

## Decision

Adopt one lifecycle contract for the canonical `Opportunity` object and make all major surfaces read/write that same state model.

See:

- `docs/product/lifecycle-state-contract.md`

Key decisions inside the contract:

1. `Opportunity` is the canonical job object.
2. `Workspace` is the durable operating space for an opportunity.
3. Inbox and JobSwipe operate on the same active discovery set.
4. Pipeline begins at `INTERESTED` and reflects opportunity state instead of inventing its own.
5. `PASSED` is recoverable and retention-based, not a hard disappearance.
6. Documents and submission artifacts belong to the workspace and become immutable snapshots when applied.

## Consequences

### Positive

- Shared state becomes understandable across the full product flow.
- Batch triage, restore, and search behavior can be designed against one model.
- Pipeline movement can enforce meaningful prerequisites.
- Resume/application history can become trustworthy.

### Negative

- Existing UI and data logic will need cleanup to converge on the contract.
- Some current behaviors will need migration rather than patching.
- Future stage additions require explicit contract updates.

## Scope

This ADR defines product behavior and lifecycle rules.
It does not by itself prescribe a database schema or migration plan.
