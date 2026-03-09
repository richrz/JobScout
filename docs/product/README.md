# Product Docs Index

**Status:** Active  
**Purpose:** Current product-spec navigation

This folder holds active product strategy and operating concepts.

## Core Product Specs

- Lifecycle state contract: [lifecycle-state-contract.md](./lifecycle-state-contract.md)
- Lifecycle concept: [workspace-lifecycle-concept.md](./workspace-lifecycle-concept.md)
- Normalization contract: [normalization-contract.md](./normalization-contract.md)
- Recovery and plan levers: [recovery-and-plan-levers.md](./recovery-and-plan-levers.md)
- Resume input and voice strategy: [resume-input-and-voice-strategy.md](./resume-input-and-voice-strategy.md)
- Resume customization product spec: [resume-customization-product-spec.md](./resume-customization-product-spec.md)

## Companion And Reference Docs

- Product owner memory: [OWNER.md](./OWNER.md)
- Market research: [market-research.md](./market-research.md)
## Recommended Reading Order

1. [Lifecycle state contract](./lifecycle-state-contract.md)
2. [Recovery and plan levers](./recovery-and-plan-levers.md)
3. [Resume input and voice strategy](./resume-input-and-voice-strategy.md)
4. [Resume customization product spec](./resume-customization-product-spec.md)
5. [Normalization contract](./normalization-contract.md)
6. [Lifecycle concept](./workspace-lifecycle-concept.md)

## Naming Standard

Use these terms consistently:
- `Opportunity` = the job object
- `Workspace` = the operating area tied to an opportunity
- `Stage Journal` = stage-specific notes and artifacts inside the workspace

Formalized in ADR:
- [ADR 004](../decisions/004-opportunity-workspace-naming.md)
- [ADR 005](../decisions/005-opportunity-lifecycle-state-contract.md)
- [ADR 006](../decisions/006-recovery-buckets-and-plan-levers.md)
- [ADR 007](../decisions/007-resume-artifact-defaults-and-naming.md)
