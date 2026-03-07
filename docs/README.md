# JobScout Documentation Hub

**Status:** Active  
**Purpose:** Canonical entry point for current project documentation

This is the canonical navigation page for project documentation.

## Start Here

- Product direction: [PRD Open Source](./PRD-OPEN-SOURCE.md)
- Development journal: [`/JOURNAL.md`](/home/richard/code/jobs/JOURNAL.md)
- Architecture decisions: [ADR Index](./decisions/README.md)
- Product docs index: [Product Docs](./product/README.md)

## Recommended Reading Order

1. [PRD Open Source](./PRD-OPEN-SOURCE.md)
2. [ADR 004: Opportunity and Workspace Naming](./decisions/004-opportunity-workspace-naming.md)
3. [Lifecycle State Contract](./product/lifecycle-state-contract.md)
4. [Recovery And Plan Levers](./product/recovery-and-plan-levers.md)
5. [Resume Input And Voice Strategy](./product/resume-input-and-voice-strategy.md)
6. [Normalization Contract](./product/normalization-contract.md)
7. [Workspace Lifecycle Concept](./product/workspace-lifecycle-concept.md)

## Architecture and Plans

- Current implementation roadmap: [current-implementation-roadmap.md](./plans/current-implementation-roadmap.md)
- Plans index: [plans/README.md](./plans/README.md)
- Rearchitecture plan: [rearchitecture_and_redesign.md](./plans/rearchitecture_and_redesign.md)
- KC scraper strategy: [kc-job-acquisition-strategy.md](./kc-job-acquisition-strategy.md)
- KC scraper implementation: [kc-scraper-plan.md](./kc-scraper-plan.md)

## Active Vs Historical

Active source of truth:
- `docs/decisions/`
- `docs/product/`
- `docs/PRD-OPEN-SOURCE.md`
- `JOURNAL.md`

Working references:
- `docs/plans/`
- `docs/design/design-system.md`
- `docs/kc-job-acquisition-strategy.md`
- `docs/kc-scraper-plan.md`
- `docs/resume-language-spec.md`
- `FUNCTIONAL_TEST_PLAN.md`

Historical records:
- `docs/archive/`
- `docs/audits/`
- `docs/handoffs/`

## Current Core Specs

- Opportunity lifecycle state contract: [lifecycle-state-contract.md](./product/lifecycle-state-contract.md)
- Recovery and plan levers: [recovery-and-plan-levers.md](./product/recovery-and-plan-levers.md)
- Resume input and voice strategy: [resume-input-and-voice-strategy.md](./product/resume-input-and-voice-strategy.md)
- Opportunity/workspace lifecycle concept: [workspace-lifecycle-concept.md](./product/workspace-lifecycle-concept.md)
- Ingestion normalization contract: [normalization-contract.md](./product/normalization-contract.md)

## Decisions (ADRs)

- LLM provider support: [001](./decisions/001-llm-provider-support.md)
- Dual-pipeline scraper architecture: [002](./decisions/002-kc-scraper-dual-pipeline.md)
- Normalization contract and provider policy: [003](./decisions/003-normalization-contract-and-provider-policy.md)
- Opportunity vs Workspace naming: [004](./decisions/004-opportunity-workspace-naming.md)
- Opportunity lifecycle state contract: [005](./decisions/005-opportunity-lifecycle-state-contract.md)
- Recovery buckets and plan levers: [006](./decisions/006-recovery-buckets-and-plan-levers.md)

## Guides and Process

- Repository workflow: [repo-workflow.md](./guides/repo-workflow.md)
- Human-in-loop workflow: [human-in-the-loop-workflow.md](./guides/human-in-the-loop-workflow.md)

## Audits and Verification

- Audit reports, when needed, live in `docs/audits/`

## Archive

Legacy and historical materials are under:
- [docs/archive/README.md](./archive/README.md)

These are useful references but are not the active source of truth.
