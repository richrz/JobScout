# Orchestration Lessons

## Core Problem

LLM agents drift from instructions no matter how detailed the prompt. The real need is not "follow a long behavioral prompt". The real need is "get the task done and do not carry errors forward."

## What Works

- Separate roles by session context: orchestrator, coder, verifier.
- Treat the micro-contract as the main artifact.
- Use a fresh-context verifier with no investment in the coder's effort.
- Make failure cheap: send the coder back with the exact failed check and keep the loop tight.

## What Does Not Work

- Long prompts that hope the agent will self-police.
- Ceremony as enforcement.
- One session trying to act as boot protocol, planner, coder, and verifier at the same time.

## Repo Planning Gap

The correct chain is:

Product spec -> decision doc -> sprint brief -> implementation

If a schema-sensitive sprint brief skips the approved decision doc, every new agent session re-derives the architecture and the approval dies with the session.

## Repo Fix Applied

- Schema-sensitive sprint briefs must link an approved ADR.
- The sprint brief template now requires an `Approved Direction` section for schema-sensitive work.
- If no ADR exists yet, write one and get approval before implementation.
- The architect operating contract now treats an accepted ADR linked by the active sprint brief as the approval bridge for in-bounds schema slices.

## Useful Files

- `docs/guides/architect-operating-contract.md`
- `docs/templates/orchestrator-prompt.md`
- `docs/templates/orchestrator-entry-prompt.md`
- `docs/plans/sprint-brief-template.md`
- `docs/decisions/`

## Framework Search Result

No framework found fully solves "keep a single LLM session from drifting from its own instructions."

Closest options found:

- Ruflo: strongest anti-drift claim, but likely heavy for this repo
- CCCC: best collaboration kernel for multi-agent coordination
- Chief Wiggum: closest conceptual match to verification-driven loops, but too immature

## Practical Direction

Use a thin orchestrator, narrow contracts, and a separate verifier agent that grades by evidence.

## Missing Safeguard

The missing safeguard was an explicit execution gate.

- approvals, ADRs, and planning context are not permission to execute.
- Default to planning/discussion mode unless the user explicitly gives `GO` permission.
- Public interface should be `ARCH -> READY -> GO`.
- Direct shorthand `GO: <goal>` is allowed, but the architect/orchestrator owns the internal narrowing.
