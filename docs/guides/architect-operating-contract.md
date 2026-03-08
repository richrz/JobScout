---
title: "Architect Operating Contract"
description: "Canonical operating contract for orchestrators, coders, architects, and verifiers in JobScout"
---

# Architect Operating Contract

## Purpose

This guide is the canonical end-to-end contract for architect-led execution in JobScout.

Use it to keep one clear path from human intent to proof-based handoff:

public interface (`ARCH/READY/GO`) -> boot/read order -> schema gate -> internal micro-contract -> coder -> independent verification -> verdict/token -> human checkpoint -> pointer/journal -> optional commit/push

## Public Interface

The human-facing interface should stay small.

Use these commands:

- `ARCH: <goal or question>`
  - architect mode only
  - clarify the outcome, narrow the next move, and prepare execution
  - no edits
  - no loop execution

- `READY`
  - trust checkpoint before execution
  - no edits
  - return one safety card for the prepared move only

- `GO`
  - execute only the prepared move from the latest `READY` card
  - do not widen scope during execution

Preferred public flow:
- `ARCH -> READY -> GO`

Direct shorthand is also allowed:
- `GO: <goal>` = authorize direct execution on the stated outcome without a separate `READY` checkpoint

In either case, the architect/orchestrator owns the internal narrowing into a micro-contract. The human should not have to supply one.

## Ready Checkpoint

When the human says `READY`, return a safety card and do not edit files yet.

The safety card must include:

1. exact next move in plain English
2. expected files to touch
3. dirty-tree status:
   - `no overlap`
   - `overlap`
   - `unknown`
   - include exact overlapping paths when status is not `no overlap`
4. proof plan
5. whether the architect plans to use internal coder and verifier roles

Hard rule:
- if dirty-tree status is `overlap` or `unknown`, stop and do not execute
- do not fall back to “did my best”
- explain the overlap or uncertainty plainly and wait

## Dirty Tree Discipline

Never describe the repo as simply "dirty" and push through anyway.

Before execution:
- classify overlap against the requested scope as `no overlap`, `overlap`, or `unknown`
- name the exact paths behind that classification

Execution rule:
- `no overlap` = proceed and protect unrelated dirty paths
- `overlap` = stop and ask for a narrower or different move
- `unknown` = stop until the uncertainty is resolved

Local-only intentionally uncommitted files are not overlap by themselves unless the requested move needs them.

## Rule Of Precedence

When process docs disagree, use this order:

1. `AGENTS.md` = hard execution gate and non-negotiables
2. `docs/handoffs/current-pointer.md` = active sprint baton
3. sprint brief + linked accepted ADR = sprint-specific truth
4. roadmap and product docs = broader product truth
5. Ralph templates = output shape only
6. mem0 and project memory docs = reminders, never canonical truth

## Entry Gate

- Planning/discussion is the default.
- Execution starts only after an explicit user command in one of these forms:
  - `GO: <goal>`
  - `GO` after a `READY` card
- Without explicit `GO` or `GO:`, do not start a Ralph loop, do not spawn agents, do not edit files, and do not begin handoff behavior.
- approvals, ADRs, sprint briefs, and “looks good” are context, not permission.
- When using the trust-building workflow, do not treat `ARCH:` or `READY` as execution permission.
- If `GO: <goal>` is broad but clear, narrow it internally into the first safe micro-contract.
- If `GO: <goal>` is ambiguous or risky, stop and ask only for the missing decision.

## Boot Order

After `GO` or `GO:` is present:

1. Read `AGENTS.md`.
2. Read `docs/handoffs/current-pointer.md`.
3. Read `docs/README.md`.
4. Read `docs/plans/current-implementation-roadmap.md`.
5. Read the active sprint brief and any linked ADR named there.
6. Run `git status -sb` and confirm branch/commit.
7. Inspect the real code for the requested slice.
8. Decide whether the move is trivial or needs Ralph.

If the move is trivial and low-risk, keep it out of Ralph.
If the move is meaningful, user-visible, risky, or schema-sensitive, use Ralph.
If the human has requested a `READY` checkpoint first, execute only the move prepared in the latest safety card.
If the human used `GO: <goal>`, state the first safe micro-contract before implementing it.

## Schema Decision Tree

Treat schema, lifecycle-truth, ownership-boundary, and resume/document-truth work as schema-sensitive.

Use this decision tree:

1. If the sprint brief links an accepted ADR and the requested slice stays inside those approved decisions, the approval gate is already satisfied.
2. If there is no accepted ADR, or the slice would extend, change, or contradict the approved direction, stop for an architect pass and human approval.
3. If the slice mixes schema work and UI work, split the schema slice first.

Approved Direction in a sprint brief is the bridge from human approval to schema execution.
Do not re-derive architecture that is already locked in an accepted ADR.

## Role Boundaries

### Orchestrator

Owns:
- slice selection
- micro-contract
- delegation strategy
- proof requirements
- grading and token

Does not:
- code the graded slice by default
- trust coder summaries as proof
- widen scope to be helpful

### Coder

Owns:
- the smallest possible implementation diff
- only the files needed for the contract
- honest reporting of changed files and expected verification impact

Does not:
- self-certify
- widen scope
- emit promise tokens

### Architect

Owns:
- current truth
- risks
- narrowest safe direction
- invariants
- first safe slice

Does not:
- implement
- verify final completion
- emit promise tokens

### Verifier

Owns:
- independent evidence review
- RED/GREEN confirmation
- browser proof review when relevant

Does not:
- accept coder summaries as proof
- let the coder grade itself

Verification may be performed by the orchestrator or a separate fresh-context verifier, but never by the coder alone.

## Ralph Loop Contract

Use one loop per micro-contract.

Required shape:

1. Define one micro-contract.
2. Define one primary success condition.
3. Run or create a failing check first when practical.
4. Use one coder by default.
5. Use multiple coders only when write scopes and verification paths are clearly disjoint.
6. Run independent GREEN verification.
7. Run a nearby regression check.
8. Capture browser proof for web-facing changes.
9. Save proof artifacts.
10. Return one verdict and one promise token.

Verdicts:
- `PASS`
- `FAIL`
- `NEEDS-NARROWER-SCOPE`

Tokens:
- `<promise>COMPLETE</promise>`
- `<promise>FAIL</promise>`
- `<promise>STOP</promise>`

Only the orchestrator emits promise tokens.

## Wrap-Up Contract

After a meaningful verified chunk:

- update `JOURNAL.md` only when rationale or direction changed
- update `docs/handoffs/current-pointer.md` with what changed, what was verified, and what comes next
- prepare commit and push information every sprint
- actually commit or push only when the human explicitly asks

## Memory Contract

- Repo docs are canonical.
- mem0 and `docs/project/*` hold preferences, reminders, machine rules, and lessons.
- Do not store product truth only in memory tools.
- If memory conflicts with the repo, the repo wins.
