---
title: "Ralph Loop Workflow"
description: "Deterministic micro-loop workflow with separate orchestrator and coder roles"
---

# Ralph Loop Workflow

## Purpose

Use Ralph loops when you want more deterministic results from AI implementation work.

The core idea is simple:
- assume the model is fallible
- keep scope extremely small
- require external proof
- never let the same agent grade its own work

This workflow is a stricter execution mode layered on top of the repo's existing docs-first workflow.

It starts only after the explicit execution gate in `AGENTS.md` is satisfied (`GO: <goal>` or `GO` after `READY`).

The user may speak in goal language.
The orchestrator owns the internal narrowing into the micro-contract.

It is also an anti-drift system:
- do not invent a shortcut workflow
- do not create off-repo side paths
- do not silently collapse roles

## When To Use It

Use Ralph loops for:
- user-visible feature work
- refactors with regression risk
- bug fixes that need proof
- schema or lifecycle changes with downstream impact
- any task where prior agents have been overconfident or vague

Do not use it for:
- trivial copy edits
- one-file housekeeping with obvious outcomes
- pure discovery or reading tasks

## Core Roles

### Orchestrator

The orchestrator owns:
- task slicing
- acceptance criteria
- delegation strategy
- parallelism decisions when safe
- failing check definition
- verification and grading
- browser validation when relevant
- proof artifacts
- handoff judgment
- closing the loop to a real checkpoint on the current branch unless a stop condition is reached

The orchestrator does **not** self-justify completion based on a coder summary.
It verifies artifacts directly.
The orchestrator is not the coder for the slice it grades unless the human explicitly collapses the roles.
The orchestrator does not invent a parallel repo, side folder, or alternate workstream unless the human explicitly asks for it.

Default stance:
- assume the coder is wrong until proof says otherwise
- reject vague claims
- narrow scope instead of widening it
- prefer one coder by default
- use multiple coders only when write scopes and verification paths are clearly separable

### Coder

The coder owns:
- implementing the smallest viable change
- touching only the files needed for the contract
- stating expected verification impact
- returning changed files and known risks honestly

The coder does **not**:
- declare the task complete
- widen scope without approval
- rewrite adjacent systems "while in there"

Default rule:
- the orchestrator and coder are separate agents
- role collapse is opt-in, not assumed
- repo drift is not allowed

### Architect

The architect is an analysis-only role used for high-risk design questions.

The architect owns:
- mapping current truth and ambiguity
- proposing the narrowest safe design direction
- naming invariants that must not be broken
- identifying the first safe implementation slice

The architect does **not**:
- implement the change
- verify final completion
- silently approve schema edits

Default rule:
- the orchestrator spawns the architect when needed
- for schema-sensitive work, the architect pass is mandatory before coding unless the active sprint brief already links an accepted ADR whose approved direction clearly covers the requested slice

## The Ralph Loop

Each loop is one micro-contract.

1. Orchestrator writes the contract.
2. Orchestrator defines the proof.
3. A failing check is created or run first when practical.
4. Coder ships the smallest patch that should move the check toward green.
5. Orchestrator runs verification independently.
6. Orchestrator returns one verdict:
   - `PASS`
   - `FAIL`
   - `NEEDS-NARROWER-SCOPE`
7. If not `PASS`, the next loop must be smaller and more explicit.

If the orchestrator decides safe parallelism exists, step 4 may involve multiple coders with disjoint scopes.
The orchestrator is responsible for reconciliation before grading.
Delegation is not permission to let sub-agents invent their own workflow.

## Non-Negotiable Rules

- one loop, one user-visible outcome
- one primary success condition per loop
- RED before GREEN whenever practical
- browser proof for web behavior changes
- targeted regression checks after GREEN
- evidence beats explanation
- no self-certification
- no mixed-scope changes
- no off-repo side paths
- no “quicker path” exceptions
- commit the verified checkpoint and push the current branch by default
- use `HOLD` or `LOCAL ONLY` only when you intentionally want to stop short of that endpoint

## Schema-Sensitive Mode

Use schema-sensitive mode for:
- schema or migration work
- lifecycle truth changes
- ownership boundary changes
- resume/document truth changes
- any work that changes the authoritative source of truth

In schema-sensitive mode:
- the orchestrator must start with an architect pass unless the active sprint brief links an accepted ADR whose `Approved Direction` already covers the requested slice
- the human must explicitly approve the architecture direction before schema-changing implementation begins unless that approval is already captured in the accepted ADR linked by the active sprint brief
- schema edits must be isolated from unrelated feature work
- max `2` coder attempts per micro-contract
- max `3` loops on the same schema-sensitive question before pausing for the human
- if the task still feels broad after the architect pass, return `NEEDS-NARROWER-SCOPE`

If the requested slice would extend, change, or contradict the accepted ADR, stop and get a fresh architect pass plus human approval first.

The goal is not speed.
The goal is preventing expensive truth drift.

## Micro-Contract Format

Every Ralph loop starts with a written contract using `docs/templates/micro-contract.md`.

Required fields:
- goal
- non-goals
- likely files in scope
- failing check to run first
- passing condition
- browser proof requirement
- max scope warning

If the contract cannot fit on one screen, it is too large.

## Verification Standard

Every loop ends with a written verification report using `docs/templates/verification-report.md`.

Minimum evidence:
- failing check or explicit reason RED was not practical
- passing targeted check
- broader nearby check
- browser proof for web-facing changes
- artifact paths for screenshots or logs

Verification may be executed by the orchestrator or a separate verifier, but never by the coder alone.

No evidence, no handoff.
No side folder, no handoff.

## Promise Tokens

The orchestrator must end each loop with exactly one promise token:
- `<promise>COMPLETE</promise>`
- `<promise>FAIL</promise>`
- `<promise>STOP</promise>`

Meaning:
- `<promise>COMPLETE</promise>` = the loop passed and proof exists
- `<promise>FAIL</promise>` = the loop failed and should continue through another loop
- `<promise>STOP</promise>` = autonomous progress must pause for the human

Rules:
- only the orchestrator emits promise tokens
- the coder does not emit promise tokens
- the architect does not emit promise tokens
- never emit `<promise>COMPLETE</promise>` without evidence
- use `<promise>STOP</promise>` for approval gates, retry-cap hits, and ambiguity that needs the human

## Orchestrator Verdict Rubric

The orchestrator grades each loop on:
- contract adherence
- minimal scope
- targeted verification
- browser verification when relevant
- regression awareness
- honesty about uncertainty

Any serious miss is a failed loop.
The promise token must match the real outcome.

## Prompt Shape

Keep prompts boring, rigid, and repetitive.

Use these repo-native templates:
- `docs/templates/orchestrator-prompt.md`
- `docs/templates/orchestrator-entry-prompt.md`
- `docs/templates/architect-prompt.md`
- `docs/templates/coder-prompt.md`

### Orchestrator Prompt Shape

Use language like:
- define one micro-contract
- if schema-sensitive, start with an architect pass
- decide whether delegation is needed
- decide whether safe parallelism exists
- state the failing check first
- assume the coder summary is incomplete
- verify directly
- return only `PASS`, `FAIL`, or `NEEDS-NARROWER-SCOPE`
- do not invent a faster alternate path
- emit the correct promise token at the end

### Coder Prompt Shape

Use language like:
- implement only this contract
- keep the diff minimal
- do not widen scope
- do not claim completion
- return changed files and expected verification impact
- do not create new workspaces, repos, or side folders

## Failure Patterns This Prevents

Ralph loops are designed to suppress common agent failure modes:
- fake completion
- hidden scope creep
- speculative rewrites
- mixing implementation with grading
- narrative status updates without proof
- broad retries instead of narrowed diagnosis

## Mapping To JobScout

This repo already expects:
- docs-first truth
- RED to GREEN execution
- browser proof for web work
- proof artifacts for handoff

Ralph loops should be treated as the default execution mode for meaningful implementation slices inside that existing system.

## Recommended Adoption Path

Start small.

### Phase 1

Adopt the process only:
- start with one orchestrator and one coder
- let the orchestrator own all delegation decisions
- use the entry prompt and templates

### Phase 2

Use the loop runner:
- create a dated loop folder
- store the contract
- store check output
- store screenshot references
- store the orchestrator verdict

### Phase 3

Treat Ralph loops as the default for all non-trivial implementation work.

## Stop Conditions

Pause and re-align with the human when:
- the next loop would require schema changes
- the coder keeps failing the same contract twice
- the contract keeps expanding to include multiple outcomes
- browser behavior contradicts test behavior
- the repo state is dirtier than the loop assumptions allow
- the agent is tempted to bypass the loop because another path seems faster

## Related Documents

- `AGENTS.md`
- `docs/guides/repo-workflow.md`
- `docs/guides/human-in-the-loop-workflow.md`
- `docs/templates/orchestrator-prompt.md`
- `docs/templates/orchestrator-entry-prompt.md`
- `docs/templates/architect-prompt.md`
- `docs/templates/coder-prompt.md`
- `docs/templates/micro-contract.md`
- `docs/templates/verification-report.md`
