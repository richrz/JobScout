# Resume Input And Voice Strategy

**Status:** Active  
**Purpose:** Capture why the next resume-system overhaul exists and what product truths should guide it

JobScout is not becoming a note-taking app with resume features on the side.
It is an AI-assisted application engine whose output quality depends on having trustworthy inputs, reusable user knowledge, and tone that still feels like the user.

This document records the rationale for the next resume and tone wave so future implementation does not drift.

## Why This Exists

We are adding this layer because the resume engine is the product choke point.

If the resume engine is fuzzy:
- better evidence capture does not help enough
- richer workspaces do not help enough
- automation becomes risky instead of valuable
- “tailored” output still feels generic or untrustworthy

The system needs a clean contract for what it uses, what it is allowed to change, and what should remain frozen once something is submitted.

## Product Truth

JobScout exists to help users apply to many relevant jobs faster with better materials and less repeated effort.

That means:
- `Opportunity` and `Workspace` are supporting systems
- the resume engine remains central
- evidence farming exists to improve future tailored output
- tone controls exist to make AI output sound like the user, not the model

## Resume Input Contract Rationale

We are formalizing a resume input contract because resume generation should only pull from clearly separated inputs:
- `Profile` for stable candidate facts
- `Evidence Library` for approved reusable proof
- `Opportunity Context` for the target job
- `Voice Preset` for how the user wants the output to sound
- `AI Guidance` for one-off instructions that do not fit sliders or presets

This separation matters because the system must not blur:
- truth and style
- reusable identity and opportunity-specific emphasis
- editable drafts and submitted application records

## Why Evidence Farming Matters

We are adding evidence farming because mass-tailored applications only work if the app has enough approved information to draw from.

Users should not have to rediscover and retype their own skills, achievements, and examples every time they tailor a resume.

The product should gradually pull durable knowledge out of the user’s head and make it reusable later.

That is why workspace capture, slash-capture, and resume-side import suggestions matter.

## Voice Presets From Uploaded Exemplars

We are adding uploaded exemplar resumes because tailored output still fails if it does not sound like the user.

Users want automation that preserves:
- voice
- jargon level
- confidence
- professional polish

This is a strong differentiator because the app is not only learning what jobs require.
It is also learning how the user naturally presents themselves.

### Working Defaults

Current working defaults for this feature wave:
- support up to `3` user-uploaded voice presets
- learn `tone + jargon` in v1, not layout structure
- keep presets in a global library with smart opportunity-level suggestions
- allow the user to override the suggested preset

## Separate Voice From Factual Truth

Uploaded resumes can teach the system how the user sounds.
They should not automatically become the source of truth for what the user has done.

That guardrail exists because style and facts are different product responsibilities.

If we blur them:
- the system can invent or over-trust claims
- users lose confidence in the app
- the data layer becomes harder to reason about later

Working default:
- facts extracted from exemplar resumes should enter a review queue before they are added to the profile or evidence library

## Simplify The Tone UX

We are adding tone presets to simplify the current control model, not to create a second competing tone system.

The intended model is:
- preset chooses the overall voice
- sliders are a fine-tune layer
- `AI Guidance` handles special-case instructions

### Working Defaults

- add `My ToneAdjust Profile` to the preset selector
- when selected, existing controls auto-align to the preset
- controls become read-only by default
- a `Customize` action unlocks manual override

This keeps the interface calmer and easier to trust.

## AI Guidance

We are adding `AI Guidance` because some instructions are situational and cannot be represented well by sliders.

Examples:
- do not mention a certain employer
- keep this more formal for a government or police role
- emphasize reliability, compliance, or leadership
- avoid startup language

Working default:
- store a default guidance note on the `Opportunity`
- allow per-resume overrides on drafts and variants

Guidance can shape emphasis, exclusions, and framing.
It should not silently authorize false claims.

## Artifact Trust Model

We are recording this now because users need to understand what they are editing versus what was actually sent.

The system needs clear separation between:
- `Working Draft`
- `Saved Variant`
- `Submitted Snapshot`

This is essential for mass application because users must be able to trust which version is editable, which version they liked, and which version became the application record.

## Schema Decision Gate

The current schema has good bones but should be treated as a bridge, not a blank check.

Do not extend the schema for recovery bins, stage journals, or resume/artifact workflows until these core ownership questions are resolved:
- one authoritative lifecycle model
- the long-term role of `Application`
- expanded workspace state coverage
- explicit artifact ownership for draft, variant, and submitted snapshot
- typed stage-journal structure
- limits on JSON as workflow truth

Current risks already identified:
- `Application.status` and `Workspace.status` both carry lifecycle meaning
- resume ownership is split across `Resume`, `Artifact`, and `Application.resumePath`
- notes are still too flat to act as real stage journals
- JSON fields are carrying more workflow meaning than they should

This gate exists to prevent years of avoidable schema debt while the new resume and tone system is being designed.
