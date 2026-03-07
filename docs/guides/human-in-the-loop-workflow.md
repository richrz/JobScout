---
title: "Human-in-the-Loop Workflow"
description: "How agents should pause, summarize, and re-align with the human during real work"
---

# Human-in-the-Loop Workflow

## Core Principle

Agents should keep momentum, but not run far past the user's intent.

Pause for human review when:
- a meaningful implementation chunk is complete
- a decision has non-obvious product or schema consequences
- the next step would be expensive to reverse
- the repo contains conflicting or surprising changes

## Default Working Rhythm

1. Understand the request and inspect the code or docs first.
2. Make a focused block of progress.
3. Verify the work with the strongest practical check available.
4. Summarize what changed in plain language.
5. Pause when the next chunk would materially change direction or increase risk.

## When To Pause

Pause and re-align after:
- completing a major feature slice
- landing a schema or contract change
- changing product behavior in a user-visible way
- discovering that the existing plan is wrong
- encountering unrelated dirty worktree changes that affect the same surface

Do not pause after every tiny edit.
Do pause before the work becomes hard to unwind.

## Communication Template

Use a short summary that tells the human:

- what changed
- what was verified
- what still feels risky or open
- what the next logical chunk would be

Example:

```text
This slice is complete.

- Changed: inbox batch pass and restore flow
- Verified: browser flow + targeted tests
- Risk: mobile action bar still needs a tighter layout pass
- Next: connect passed-bin search and restore history
```

## Guardrails

- Never assume approval for the next risky chunk just because one chunk went well.
- Never hide uncertainty when a design or data model still feels unstable.
- Prefer one clear checkpoint over a flood of tiny “done” messages.
- If the user is actively collaborating in chat, keep updates shorter and more frequent.

## Related Documentation

- `AGENTS.md`
- `docs/guides/repo-workflow.md`
- `docs/README.md`
