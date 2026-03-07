# ADR 007: Resume Artifact Defaults And Naming

**Status**: Accepted
**Date**: 2026-03-07
**Author**: Product + Engineering

## Context

The resume system is the product choke point, but the current planning language still left too much room for drift:

- naming was inconsistent across uploaded resumes, generated resumes, and submitted records
- the earlier voice discussion risked sounding like multiple competing preset systems
- product limits for drafts, variants, and uploads were not yet locked anywhere durable
- allowing user-uploaded existing resumes per opportunity needed a clear rule

Without a clear naming and defaults contract, future implementation would likely blur:
- tone-learning uploads and factual truth
- editable drafts and submitted history
- opportunity-specific resume uploads and global voice-learning inputs

## Decision

Adopt the following accepted v1 defaults and names for the resume system.

See:

- `docs/product/resume-input-and-voice-strategy.md`

Key decisions:

1. The user-facing reusable voice control is named `My ToneAdjust Profile`.
2. v1 supports `1` `My ToneAdjust Profile` per user.
3. v1 supports up to `3` global `Voice Samples` to tune that profile.
4. `Voice Samples` teach tone and jargon only; extracted facts must go through review before becoming profile or evidence truth.
5. Per-opportunity resume artifacts use this naming:
   - `Existing Resume`
   - `Working Draft`
   - `Saved Variant`
   - `Submitted Snapshot`
6. v1 defaults are:
   - `1` `Working Draft` per opportunity
   - up to `5` `Saved Variants` per opportunity
   - up to `2` `Existing Resume` uploads per opportunity
   - `Submitted Snapshots` are not artificially capped and should follow application history
7. Users are allowed to upload an `Existing Resume` for a specific opportunity.
8. An `Existing Resume` may be kept as reference or promoted to become the `Working Draft`.
9. An `Existing Resume` does not automatically become factual truth or a `Submitted Snapshot`.
10. These values are product defaults and plan levers, not schema hard-limits.

## Consequences

### Positive

- Users get clearer language around what each resume object is for.
- Resume uploads, generated drafts, and submitted history become easier to reason about.
- The tone system becomes simpler because it is centered on one user-facing profile instead of multiple competing preset ideas.
- The product gains practical defaults that can later become packaging levers without baking them into the schema.

### Negative

- Future packaging changes may still revise the numeric defaults.
- Migration work will be needed if the current app stores multiple overlapping resume objects in inconsistent ways.
- The app will still need a later implementation pass to enforce these defaults consistently in UI and backend flows.

## Scope

This ADR locks naming and accepted v1 product defaults for the resume system.
It does not finalize schema design, billing tiers, or the full evidence-library model.
