# ADR 003: Normalization Contract and Provider Policy

**Status**: Accepted  
**Date**: 2026-03-06  
**Author**: Product + Engineering

## Context

Inbox behavior is currently unreliable because incoming job data is not normalized into consistent structured fields. Filtering by work mode/location and downstream workflow behavior can break when records are partially structured or source-dependent.

At the same time, model/provider drift introduces operational risk and hidden costs when routing through aggregators or free tiers.

## Decision

Adopt a formal normalization contract that all ingested jobs must pass before Inbox visibility.

See:
- `docs/product/normalization-contract.md`

Also enforce a production provider policy for normalization:

- Allowed production providers:
  - Google Gemini API (direct)
  - OpenAI API (direct)
- Disallowed in production normalization path:
  - OpenRouter
  - Free-tier routed models
  - Preview-only model strategy as sole default

## Key Rules

1. Deterministic normalization is required before LLM usage.
2. LLM enrichment is selective, confidence-driven, and budget-controlled.
3. Dedupe is mandatory before Inbox.
4. Records that fail contract validation are quarantined and not shown in Inbox.
5. Every refresh run must emit operational and cost telemetry.

## Consequences

### Positive

- Inbox filters become dependable across mixed sources.
- JobSwipe and pipeline state can rely on consistent record shape.
- Cost is controlled via deterministic-first + selective enrichment.
- Operational behavior becomes auditable and versioned.

### Negative

- More upfront implementation rigor required.
- Some records will initially route to quarantine until parsers improve.
- Contract evolution requires versioning and migration discipline.

## Out of Scope

- Geocoding and map-distance enrichment in the current phase.

These remain deferred to a future release.

