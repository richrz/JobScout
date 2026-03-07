# ADR 006: Recovery Buckets And Plan Levers

**Status**: Accepted  
**Date**: 2026-03-06  
**Author**: Product + Engineering

## Context

The product needs a safer recovery model and a more durable monetization model.

Two risks were emerging:

- users could lose confidence if pass, dismiss, delete, archive, and restore are not clearly separated
- pricing could become weak if it relies mostly on raw opportunity counts, especially while application submission is still partially manual

## Decision

Adopt a bucketed recovery model and use `Managed Opportunities` as the primary count-based commercial lever.

See:

- `docs/product/recovery-and-plan-levers.md`

Key decisions:

1. `PASSED`, `ARCHIVED`, `TRASH`, and `RECOVERY` are distinct concepts.
2. Normal user actions should not hard-delete opportunities.
3. Raw discovery volume should not be the primary monetization lever.
4. `Managed Opportunities` is the recommended artificial bucket for plan design.
5. Mid-tier value should lean heavily on richer workspace tools, retention, recovery, and AI assistance.
6. Exact plan limits remain intentionally open until usage data is available.

## Consequences

### Positive

- Recovery behavior becomes clearer and safer.
- Pricing can align to real workflow value instead of inflated job counts.
- Workspace adoption becomes a natural product-growth lever.
- Future plan design can evolve without changing the canonical lifecycle model.

### Negative

- The app will need explicit bucket transitions and retention logic later.
- Some currently overloaded actions will need to be split into clearer user-facing behaviors.
- Packaging work will still require later tuning once real usage patterns are observed.

## Scope

This ADR defines the product direction for recovery and packaging.
It does not finalize numeric plan limits or billing implementation.
