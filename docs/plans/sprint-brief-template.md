# Sprint Brief Template

Use this template for the next focused implementation slice when the work needs more shape than a pointer alone.

## Sprint Name

- Short descriptive name

## Goal

- What this sprint is trying to accomplish

## Why Now

- Why this work matters now
- What problem or risk it reduces

## In Scope

- The specific changes this sprint is allowed to make

## Out Of Scope

- What this sprint should not touch

## Done Means

- What must be true before this sprint is considered complete

## Verification

- The strongest practical checks expected for this sprint
- Required RED check(s) before coding
- Required GREEN check(s) to declare success
- Required broader regression checks
- Required browser flow verification
- Required evidence artifacts (screenshots and/or proof logs)

## Handoff Gate

- No handoff if RED/GREEN evidence is missing
- No handoff if browser verification is missing for web changes
- No handoff if screenshot/proof artifacts are missing

## Approved Direction (required for schema-sensitive work)

If this sprint is schema-sensitive, link the ADR that locks the architecture direction:

- **ADR:** [ADR NNN: Title](../decisions/NNN-title.md)
- **Key decisions:** list the numbered decisions from the ADR
- **Agent instruction:** These decisions are settled. Read the ADR and proceed to slicing. Do not re-derive or re-ask for approval. If the requested slice stays inside these accepted decisions, no additional architect approval is needed.

If no ADR exists yet, write one in `docs/decisions/` and get human approval before starting the sprint. Do not begin schema-sensitive implementation without an approved ADR.

## Risks

- Known risks, assumptions, or schema concerns

## Read First

1. The linked ADR (if schema-sensitive)
2. The current pointer
3. The roadmap
4. The most relevant product contract or ADR

## Next Handback

- What the pointer should say when this sprint is finished
