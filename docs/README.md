# JobScout Documentation Hub

**Status:** Active  
**Purpose:** Canonical entry point for current project documentation

This is the canonical navigation page for project documentation.

## Start Here

- **Cockpit interaction spec (unified UX vision): [product/cockpit-interaction-spec.md](./product/cockpit-interaction-spec.md)**
- Product direction: [PRD Open Source](./PRD-OPEN-SOURCE.md)
- Development journal: [`/JOURNAL.md`](/home/richard/code/jobs/JOURNAL.md)
- Backlog tracker: [project/backlog.md](./project/backlog.md)
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
- `docs/project/backlog.md`
- `docs/handoffs/current-pointer.md`
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

## Current Core Specs

- **Cockpit stage contract: [cockpit-stage-contract.md](./product/cockpit-stage-contract.md)** ← inbound/work/outbound per stage, toolbar, drawer pattern, cross-stage editing rules
- Opportunity lifecycle state contract: [lifecycle-state-contract.md](./product/lifecycle-state-contract.md)
- Recovery and plan levers: [recovery-and-plan-levers.md](./product/recovery-and-plan-levers.md)
- Resume input and voice strategy: [resume-input-and-voice-strategy.md](./product/resume-input-and-voice-strategy.md)
- Resume customization product spec: [resume-customization-product-spec.md](./product/resume-customization-product-spec.md)
- Opportunity/workspace lifecycle concept: [workspace-lifecycle-concept.md](./product/workspace-lifecycle-concept.md)
- Ingestion normalization contract: [normalization-contract.md](./product/normalization-contract.md)

## Decisions (ADRs)

- LLM provider support: [001](./decisions/001-llm-provider-support.md)
- Dual-pipeline scraper architecture: [002](./decisions/002-kc-scraper-dual-pipeline.md)
- Normalization contract and provider policy: [003](./decisions/003-normalization-contract-and-provider-policy.md)
- Opportunity vs Workspace naming: [004](./decisions/004-opportunity-workspace-naming.md)
- Opportunity lifecycle state contract: [005](./decisions/005-opportunity-lifecycle-state-contract.md)
- Recovery buckets and plan levers: [006](./decisions/006-recovery-buckets-and-plan-levers.md)
- Resume artifact defaults and naming: [007](./decisions/007-resume-artifact-defaults-and-naming.md)

## Guides and Process

- Architect operating contract: [architect-operating-contract.md](./guides/architect-operating-contract.md)
- Repository workflow: [repo-workflow.md](./guides/repo-workflow.md)
- Sprint workflow: [sprint-workflow.md](./guides/sprint-workflow.md)
- Human-in-loop workflow: [human-in-the-loop-workflow.md](./guides/human-in-the-loop-workflow.md)
- Ralph loop workflow: [ralph-loop.md](./guides/ralph-loop.md)
- Live handoff pointer: [current-pointer.md](./handoffs/current-pointer.md)
- Backlog tracker: [project/backlog.md](./project/backlog.md)

## Audits and Verification

- Audit reports, when needed, live in `docs/audits/`

## Archive

Legacy and historical materials are under:
- [docs/archive/README.md](./archive/README.md)

These are useful references but are not the active source of truth.
