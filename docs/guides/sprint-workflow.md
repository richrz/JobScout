---
title: "Sprint Workflow"
description: "Repo-native workflow for designing, building, verifying, and handing off work in JobScout"
---

# Sprint Workflow

Use this workflow when moving the project forward so a fresh agent can pick up from the repo without chat history.

## Core Principle

The repo is the memory.

Every meaningful sprint should leave behind:
- product truth in docs
- implementation truth in code
- verification truth in notes or test output
- a live pointer for the next agent

## The Workflow

1. **Design**
   - Lock product or workflow decisions in the docs spine before building if the behavior is new or ambiguous.
   - Use:
     - `docs/README.md`
     - `docs/decisions/`
     - `docs/product/`
     - `docs/plans/current-implementation-roadmap.md`

2. **Sprint Brief**
   - Define one focused implementation chunk.
   - Capture:
     - what this sprint is trying to accomplish
     - what “done” means
     - what is intentionally out of scope
   - Keep the sprint brief small enough that one agent can verify it honestly.
   - If the work needs a written brief, start from `docs/plans/sprint-brief-template.md`.

3. **Code**
   - Build only the scoped slice.
   - Avoid mixed work that hides what changed or why.

4. **Verify**
   - Run the mandatory minimum loop:
     - fail (`RED`)
     - code
     - fail
     - code
     - pass (`GREEN`)
     - broader checks
     - browser validation
     - screenshot/proof capture
   - Do not claim completion without verification evidence.

5. **Commit**
   - Make a focused commit whose message explains the implementation checkpoint.

6. **Push**
   - Push the branch so the checkpoint exists outside the local machine.

7. **Pointer**
   - Update `docs/handoffs/current-pointer.md`.
   - This is the official baton-pass file for the next agent.

## What The Pointer Must Contain

- branch name
- latest checkpoint commit
- the 2-4 docs a new agent should read first
- current sprint goal
- what was finished
- what remains
- what was verified
- where screenshot/proof artifacts live
- known risks or dirty local state
- next recommended task

## Default Start For A New Agent

Start here, in order:

1. `docs/handoffs/current-pointer.md`
2. `docs/README.md`
3. the current roadmap and product specs named in the pointer
4. `JOURNAL.md`
5. the latest referenced commit

## Rule Of Thumb

If a new agent cannot answer “what is true, what changed, and what should happen next?” within a few minutes, the sprint was not handed off cleanly enough.

## Handoff Gate

No handoff if any of these are missing:
- failing-to-passing verification history for the sprint target
- browser verification for web-facing behavior
- concrete evidence artifacts (screenshots and/or test output references)
