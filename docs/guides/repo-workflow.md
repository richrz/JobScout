---
title: "Repository Workflow"
description: "Simple docs-first workflow for agents and humans working in JobScout"
---

# Repository Workflow

## Source Of Truth

Use the repo itself as the operating system:

1. `docs/README.md`
2. `docs/decisions/`
3. `docs/product/`
4. `docs/plans/current-implementation-roadmap.md`
5. `JOURNAL.md`

Do not rely on external task orchestration state to understand what is true.

## Default Session Start

Before making changes:
- check `git status -sb`
- read the most relevant product and roadmap docs
- inspect the code that actually implements the behavior in question

## Default Working Style

- keep changes focused
- verify claims with the strongest practical check available
- use Ralph loops for non-trivial implementation slices that need tighter determinism
- update product docs when product truth changes
- update `JOURNAL.md` when rationale or direction changes
- keep commit scopes tight so history explains the work
- end each meaningful sprint with an updated handoff pointer in `docs/handoffs/current-pointer.md`
- prepare each meaningful sprint for a focused commit and push
- actually commit or push only when the human explicitly asks

## Sprint Sequence

Use this default sequence:

1. design
2. sprint brief
3. code
4. verify
5. commit
6. push
7. pointer

For the full baton-pass workflow, see `docs/guides/sprint-workflow.md`.
For deterministic micro-loop execution, see `docs/guides/ralph-loop.md`.

## When To Update Docs

Update docs when:
- a new product rule is accepted
- naming changes
- lifecycle or schema assumptions change
- a new implementation order becomes the real plan
- a feature exists because of a specific rationale that could be forgotten later

## What To Avoid

- duplicate sources of truth
- hidden workflow state outside the repo
- “temporary” process systems that agents have to rediscover every session
- committing large mixed changesets when the repo is already dirty
