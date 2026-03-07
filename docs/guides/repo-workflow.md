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
- update product docs when product truth changes
- update `JOURNAL.md` when rationale or direction changes
- keep commit scopes tight so history explains the work

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
