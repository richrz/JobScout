# Dirty Tree Cleanup Audit

**Date:** 2026-03-08  
**Scope:** Classify every current dirty or hidden repo path before any deletions  
**Outcome:** Blanket cleanup was not safe at audit time; default-policy cleanup was later executed in a follow-up pass

## Follow-Up Cleanup Applied

Approved default policy was executed after this audit:

- stop tracking local-only config:
  - `.env.local`
  - `.gemini/settings.json`
  - `.gemini/settings.json.orig`
  - `.mcp.json`
- delete retired workflow residue:
  - `job-search-platform/.taskmaster/`
  - `job-search-platform/.tdd/`
  - `job-search-platform/.tdd/output/hitl-verify/task-20.txt`
- delete scaffold loop folders under `docs/loops/2026-03-07/`
- delete `paste.txt`

This audit remains useful as the pre-cleanup classification record.

## RED Evidence

- Pre-check run: `test -f docs/audits/dirty-tree-cleanup-audit.md`
- Result before this audit: failed, because the audit file did not exist yet

## Summary

- `git worktree list --porcelain` shows exactly **one** worktree: `/home/richard/code/jobs`
- Current dirty tree contains **14 modified tracked paths**
- Current repo surface contains **22 untracked repo files** before this audit artifact was created
- Hidden local/tooling surfaces still exist at the repo root and in `job-search-platform/`
- The broad “fix everything now” request overlaps the same docs/process files already being changed, so cleanup should happen in phases

## Classification Legend

- `keep-and-stage` = intentional repo truth that should likely remain and be checkpointed
- `local-only` = machine/user-specific data that should not drive repo truth
- `delete-candidate` = likely safe to remove after approval
- `archive-candidate` = historically useful, but no longer active
- `needs-human-decision` = risky enough that deletion or retention should be chosen explicitly
- `ignore` = external or non-repo-truth noise

## Modified Tracked Paths

| Path | Class | Why | Recommended next action |
| --- | --- | --- | --- |
| `.env.local` | `needs-human-decision` | Local environment config is tracked and currently modified | Decide whether to stop tracking local env files in a follow-up cleanup slice |
| `.gemini/settings.json` | `needs-human-decision` | Local assistant tooling config is tracked and currently modified | Decide whether to stop tracking machine-specific Gemini config |
| `.mcp.json` | `needs-human-decision` | Local MCP wiring is tracked and currently modified | Decide whether this file is repo truth or local machine config |
| `AGENTS.md` | `keep-and-stage` | Active operating agreement; recent changes align the architect and `GO:` contract | Keep as active source of truth |
| `JOURNAL.md` | `keep-and-stage` | Records process rationale and recent operating-contract decisions | Keep and checkpoint with related process docs |
| `docs/README.md` | `keep-and-stage` | Canonical docs hub; now points to the architect contract | Keep |
| `docs/decisions/README.md` | `keep-and-stage` | ADR index now includes ADR 008 | Keep |
| `docs/guides/human-in-the-loop-workflow.md` | `keep-and-stage` | Active pause/re-align guide in current workflow | Keep |
| `docs/guides/repo-workflow.md` | `keep-and-stage` | Active repo workflow; recent changes clarify commit/push behavior | Keep |
| `docs/guides/sprint-workflow.md` | `keep-and-stage` | Active sprint workflow; recent changes clarify commit/push behavior | Keep |
| `docs/handoffs/README.md` | `keep-and-stage` | Active handoff guidance | Keep |
| `docs/handoffs/current-pointer.md` | `keep-and-stage` | Live baton-pass file for next agent | Keep, but review often because it is volatile by design |
| `docs/plans/resume-document-truth-model-sprint-brief.md` | `keep-and-stage` | Active sprint brief with approved ADR direction | Keep |
| `docs/plans/sprint-brief-template.md` | `keep-and-stage` | Active template for future schema-sensitive briefs | Keep |

## Untracked Repo Paths

| Path | Class | Why | Recommended next action |
| --- | --- | --- | --- |
| `docs/decisions/008-resume-document-truth-model.md` | `keep-and-stage` | Accepted ADR that locks the active schema direction | Keep |
| `docs/guides/architect-operating-contract.md` | `keep-and-stage` | Canonical end-to-end architect contract | Keep |
| `docs/guides/ralph-loop.md` | `keep-and-stage` | Active Ralph workflow guide | Keep |
| `docs/loops/README.md` | `keep-and-stage` | Honest wrapper explaining loop folders as scaffolds or records | Keep |
| `docs/loops/2026-03-07/2026-03-07-234756-inbox-batch-pass/README.md` | `archive-candidate` | Template-generated scaffold, not proof of real delivery | Archive or delete if the repo should only keep real loop records |
| `docs/loops/2026-03-07/2026-03-07-234756-inbox-batch-pass/artifacts/.gitkeep` | `archive-candidate` | Placeholder only | Archive or delete with scaffold folder |
| `docs/loops/2026-03-07/2026-03-07-234756-inbox-batch-pass/micro-contract.md` | `archive-candidate` | Unfilled scaffold file | Archive or delete with scaffold folder |
| `docs/loops/2026-03-07/2026-03-07-234756-inbox-batch-pass/verification-report.md` | `archive-candidate` | Unfilled scaffold file | Archive or delete with scaffold folder |
| `docs/loops/2026-03-07/2026-03-07-234830-deterministic-audit/README.md` | `archive-candidate` | Template-generated scaffold, not proof of real delivery | Archive or delete if the repo should only keep real loop records |
| `docs/loops/2026-03-07/2026-03-07-234830-deterministic-audit/artifacts/.gitkeep` | `archive-candidate` | Placeholder only | Archive or delete with scaffold folder |
| `docs/loops/2026-03-07/2026-03-07-234830-deterministic-audit/micro-contract.md` | `archive-candidate` | Unfilled scaffold file | Archive or delete with scaffold folder |
| `docs/loops/2026-03-07/2026-03-07-234830-deterministic-audit/verification-report.md` | `archive-candidate` | Unfilled scaffold file | Archive or delete with scaffold folder |
| `docs/project/agent-user-preferences.md` | `keep-and-stage` | User-specific operating preferences for future sessions | Keep |
| `docs/project/orchestration-lessons.md` | `keep-and-stage` | Repo memory about orchestration failures and fixes | Keep |
| `docs/templates/architect-prompt.md` | `keep-and-stage` | Active template for architecture-only pass | Keep |
| `docs/templates/coder-prompt.md` | `keep-and-stage` | Active template for coder role | Keep |
| `docs/templates/micro-contract.md` | `keep-and-stage` | Active Ralph contract template | Keep |
| `docs/templates/orchestrator-entry-prompt.md` | `keep-and-stage` | Active human entry prompt template | Keep |
| `docs/templates/orchestrator-prompt.md` | `keep-and-stage` | Active orchestrator template | Keep |
| `docs/templates/verification-report.md` | `keep-and-stage` | Active Ralph verification template | Keep |
| `scripts/run-ralph-loop.sh` | `keep-and-stage` | Active helper that creates loop folders from templates | Keep |

## Hidden And Off-Path Surfaces

| Path | Class | Why | Recommended next action |
| --- | --- | --- | --- |
| `.claude/` | `local-only` | Local assistant tooling surface, not repo truth | Leave out of cleanup commits |
| `.claude/settings.local.json` | `local-only` | Machine-local assistant settings | Leave local |
| `.gemini/settings.json.orig` | `needs-human-decision` | Hidden tracked backup file inside tooling config surface; likely stale and easy to forget | Decide whether to delete or archive with the Gemini config policy |
| `job-search-platform/.env.local` | `local-only` | App-local environment config | Leave local |
| `job-search-platform/.taskmaster/` | `delete-candidate` | Retired workflow surface still present locally | Remove in a dedicated cleanup slice if confirmed unused |
| `job-search-platform/.taskmaster/tasks/` | `delete-candidate` | Empty retired workflow directory | Remove in the same cleanup slice |
| `job-search-platform/.tdd/` | `delete-candidate` | Retired workflow surface still present locally | Remove in a dedicated cleanup slice after deciding what to do with tracked residue |
| `job-search-platform/.tdd/output/hitl-verify/task-20.txt` | `archive-candidate` | Tracked legacy verification artifact from retired `.tdd` workflow | Archive or delete in a deliberate tracked cleanup change |
| `node_modules/uri-templates/.gitmodules` | `ignore` | Vendor dependency internals, not repo truth | Ignore |
| `node_modules/url-template/.gitmodules` | `ignore` | Vendor dependency internals, not repo truth | Ignore |
| `git worktree list` result | `keep` | Only one worktree exists; no hidden alternate worktree cleanup needed | No action |

## Document Sweep Findings

- Active docs now span **71 files**
- Current active docs are concentrated in:
  - `docs/decisions/`
  - `docs/guides/`
  - `docs/handoffs/`
  - `docs/plans/`
  - `docs/product/`
  - `docs/project/`
  - `docs/templates/`
- Active docs do **not** still depend on Taskmaster or `.tdd` as active workflow systems
- Historical `.tdd` references remain in archive material such as `docs/archive/session-history/crash-history.md`
- Biggest active hallucination-risk surfaces now are duplicate orchestration entry points:
  - `AGENTS.md`
  - `docs/guides/architect-operating-contract.md`
  - `docs/handoffs/current-pointer.md`
  - `docs/templates/orchestrator-entry-prompt.md`

## Recommended Cleanup Order

1. **Checkpoint intentional process truth**
   - Treat the active docs/process package as one reviewable checkpoint instead of deleting around it blindly

2. **Decide local-config policy**
   - Resolve whether `.env.local`, `.gemini/settings.json`, and `.mcp.json` should remain tracked
   - This is the most important dirt source because it mixes local machine state with repo state

3. **Remove retired workflow residue**
   - Clean `job-search-platform/.taskmaster/`
   - Clean `job-search-platform/.tdd/`
   - Decide whether `job-search-platform/.tdd/output/hitl-verify/task-20.txt` is worth archiving

4. **Prune redundant orchestration artifacts**
   - Remove duplicate entry shims if they are no longer needed
   - Decide whether scaffold loop folders under `docs/loops/2026-03-07/` should be archived or deleted

5. **Do a second active-doc reduction pass**
   - After the dirt surface is smaller, reduce duplicate active process entry points so the repo has fewer competing instructions

## Not Done In This Audit

- The audit file itself is an intentional new artifact and is not counted in the pre-audit dirty inventory above
- This file describes the repo before the approved cleanup pass
- Some actions listed above were intentionally deferred until policy approval existed

This audit exists to make the next cleanup steps explicit and safer.
