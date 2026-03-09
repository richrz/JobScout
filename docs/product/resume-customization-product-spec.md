# Resume Customization Product Spec

**Status:** Draft  
**Purpose:** Define the v1 product contract for JobScout's trust-first resume customization stack

## Why This Exists

JobScout's next resume wave should not be another generic AI rewrite surface.

The product opportunity is clear:
- applicants feel buried in an AI-spam economy
- many current tools make resumes sound generic, inflated, or fake
- users want help that preserves their voice and facts while making them more targeted and more credible

The core promise is:

`You, but everywhere.`

That means JobScout should preserve the user's real voice and truth, then amplify and adapt that voice across many relevant jobs without turning the output into generic AI sludge.

## User Problem

Applicants do not mainly need more text generation.

They need:
- a way to sound like the strongest version of themselves
- a way to tailor faster without redoing the entire resume every time
- a way to compete in a noisy market without becoming part of the spam
- a way to trust the system not to fabricate or silently distort their story

The emotional problem is also important:
- people believe other applicants are using AI more aggressively than they are
- they feel helpless in a market full of AI-generated resumes
- they want to feel agency again, not just automation

JobScout should answer that by helping users send fewer, better, more believable applications.

## Product Goals

The v1 resume customization stack should:
- preserve voice and factual truth while improving clarity, positioning, and targeting
- make tailoring faster without hiding what changed
- help users sound more job-relevant without sounding fake
- let users tune how technical, formal, assertive, or polished the output feels
- give users confidence that the system is helping them compete without crossing into dishonesty

## Non-Goals

This v1 spec does not try to:
- build a mass-apply bot
- "beat AI detectors"
- produce a black-box ATS score as the primary value
- support deep per-user model fine-tuning
- finalize the exact ML architecture for voice inference
- finalize all seven voice dimensions and slider names

## Core Product Position

JobScout is not trying to help users out-bot the bots.

It is trying to help one real applicant send stronger human signal.

Positioning truths:
- anti-spam, pro-signal
- preserve voice, do not flatten it
- preserve facts, do not fabricate
- show the user what changed and why
- help the user sound sharper, not synthetic

## Core Concepts

### 1. Resume Writer Zero

`Resume Writer Zero` remains the fallback baseline writer.

Use it when:
- the user has not provided enough voice signal
- uploaded writing samples are weak, messy, or inconsistent
- the user wants a trustworthy neutral baseline before customization

Its role is:
- strong recruiter and hiring-manager readability
- ATS-friendly structure
- impact-first, plain-English rendering of technical work
- no hype-driven fakery

### 2. Voice Profile

The `Voice Profile` is the user's reusable resume-writing profile.

Its job is to capture how the user tends to present themselves so JobScout can tailor output while still sounding like them.

The v1 profile should:
- be inferred from uploaded resumes and writing samples
- be editable by the user
- influence multiple resume generations over time
- remain separate from factual truth

Important v1 constraint:
- the final seven dimensions and their names are still `TBD`

### 3. Fact Lock

`Fact Lock` is the trust boundary.

Users must be able to lock:
- titles
- employers
- dates
- metrics
- named achievements

When facts are locked:
- the AI may rephrase or reorder
- the AI may not silently change or invent them

### 4. Transparent Diff

Every meaningful rewrite should be inspectable.

The user should be able to see:
- original text
- suggested text
- why the change was made
- whether the change was wording-only or tied to job targeting

This is a core trust feature, not a nice-to-have.

### 5. Preview And Confirm

Resume customization should use an explicit `preview -> confirm` contract.

Before a tailored draft becomes the accepted version:
- JobScout shows a preview tied to a specific input state
- the user reviews the diff, rationale, and warnings
- only the confirmed draft becomes the saved artifact

Rules for v1:
- preview must happen before confirmation
- confirmation should be explicit, not implied by navigation
- confirmed output should map back to the reviewed preview state
- later versions should remain inspectable as separate artifacts

### 6. Audience And Jargon Tuning

JobScout should help the user tune how the same truth is expressed for different readers.

The product should support controlled variation for:
- recruiter readability
- hiring-manager credibility
- technical depth
- jargon level

This is not a license to change facts.
It is a license to change framing, vocabulary, and emphasis.

### 7. Keyword Coverage Overlay

JobScout should show keyword coverage as a concrete overlay, not a black-box score.

Its job is to show:
- which important job terms are already covered
- which ones are missing
- where they appear in the current draft
- whether the wording feels natural or risks stuffing

This should support targeting without pretending to be magic ATS science.

### 8. Human Signal Check

JobScout should help users avoid generic, same-y, AI-ish resume language.

This check should focus on:
- vague claims
- repeated empty phrasing
- buzzword-heavy bullets
- weak or context-free impact statements

The intent is:
- not "AI detection"
- but quality and credibility protection

### 9. Signature Phrase Layer

`Signature Phrases` or `quirks` are a separate optional layer above the main voice profile.

They are not one of the core sliders.

Their role is to preserve small parts of the user's writing fingerprint, such as:
- recurring turns of phrase
- characteristic verbs
- familiar framing patterns
- phrases the user is known for

Rules for v1:
- they must be approved
- they must be classified for safe usage
- they must be used sparingly
- they must never lower clarity or professionalism

## Trust Model

Trust is the main product differentiator.

JobScout should feel safe because it:
- preserves the user's facts
- shows the user what changed
- explains why a rewrite helps
- avoids silent inflation
- avoids black-box magic framing

V1 trust rules:
- no fabrication
- no silent deletion of important wins without the user's approval
- preview before confirm for any meaningful rewrite acceptance
- keyword coverage should be shown as an inspectable overlay, not a black-box ATS score
- no pretending a score is more scientific than it is
- no hiding behind vague ATS claims

## Primary User Flow

### Flow A: Build Or Refresh Voice Profile

1. User uploads one or more resumes or writing samples.
2. JobScout infers a reusable voice profile.
3. JobScout shows the user:
   - a plain-language summary of the voice profile
   - editable voice controls
   - optional signature phrase suggestions
4. User approves or adjusts the profile.
5. JobScout stores the profile for later resume work.

### Flow B: Tailor A Resume For A Job

1. User selects a target job.
2. JobScout starts from structured truth:
   - profile facts
   - approved evidence
   - the target opportunity context
   - the user's voice profile
3. JobScout generates a tailored preview draft.
4. The preview is shown with:
   - transparent diff
   - rationale
   - fact lock protection
   - keyword coverage overlay
   - human signal checks
5. User confirms, rejects, or edits changes.
6. Only the confirmed draft becomes the accepted artifact version.

### Flow C: Tune For Audience

1. User chooses a different reader emphasis.
2. JobScout adjusts framing and jargon, not truth.
3. User previews the changes before saving.

## V1 Scope

V1 should include:
- a reusable voice profile inferred from uploaded samples
- `Resume Writer Zero` fallback
- fact lock
- transparent diff with rewrite rationale
- preview and confirm before accepting a rewritten draft
- audience or jargon tuning
- keyword coverage overlay tied to the target job
- human signal check
- optional signature phrase suggestions with approval

V1 can leave these lighter or partial:
- exact seven-slider taxonomy
- strong confidence visualizations
- multi-profile voice systems
- conversational story-mining as a full guided interview product

## Later Trust Extensions

These matter, but they are not v1 blockers:
- optional local or private model support for privacy-sensitive users
- a stronger privacy story for resume customization on top of the same trust contract
- keeping fact lock, preview-confirm, and diff behavior consistent even when the model provider changes

## Explicit V1 Open Questions

These are real `TBD`s, not hidden assumptions:

1. What are the final seven voice dimensions?
2. What should each slider control, and what must it not control?
3. How much writing is enough for a strong voice profile versus a weak one?
4. What should the confidence model look like in product language?
5. How should signature phrases be detected, approved, and limited?
6. How much audience tuning belongs in v1 versus later?
7. What is the right user-facing name for the profile system?

## Success Criteria

This feature wave is successful when:
- users feel the output still sounds like them
- users can see what the AI changed and why
- users trust that JobScout is not lying on their behalf
- tailored resumes are more targeted without becoming generic sludge
- the product helps users feel more agency in a spam-heavy market

## Product Principle To Preserve

If a future idea makes it easier to send more generic applications but harder to send believable ones, it is moving in the wrong direction.

The correct direction is:
- fewer, stronger applications
- more believable signal
- more user control
- more trust in the result
