# CLAUDE RULES

This repo uses a docs-first workflow.

## Start Here

- Read [docs/README.md](/home/richard/code/jobs/docs/README.md)
- Read the relevant active specs under [docs/product/](/home/richard/code/jobs/docs/product/README.md)
- Check the current roadmap in [docs/plans/current-implementation-roadmap.md](/home/richard/code/jobs/docs/plans/current-implementation-roadmap.md)
- Use [JOURNAL.md](/home/richard/code/jobs/JOURNAL.md) for recent rationale and direction changes

## Working Rules

1. Let the repo docs be the source of truth.
2. Verify important claims directly with tests, browser checks, or runtime checks.
3. Update docs when product truth changes.
4. Update `JOURNAL.md` when direction or rationale changes.
5. Be honest about blockers, uncertainty, and unfinished work.

## Agent Model Strategy

Preferred development mode: **Opus orchestrator + cheaper subagents.**

- **Opus (primary):** Architecture decisions, merge strategy, writing production code, final verification
- **Sonnet subagents:** File analysis, codebase research, reading/summarizing large files, drafting code sections
- **Haiku subagents:** Simple lookups, file pattern searches, quick checks

Always verify subagent work at the end — Opus reviews and confirms correctness before committing.

## Audit Notes

- If an audit report is needed, place it under `/home/richard/code/jobs/docs/audits/`.
- Do not rely on stale task wrappers or hidden workflow systems.
