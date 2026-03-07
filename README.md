# JobScout Repository Guide

This repository contains the JobScout product, its documentation system, and the agent workflow tooling used to operate on it.

## Where To Start

- Product documentation hub: [docs/README.md](docs/README.md)
- Development journal: [JOURNAL.md](JOURNAL.md)
- Runnable app: [job-search-platform/README.md](job-search-platform/README.md)
- App deployment notes: [job-search-platform/docs/DEPLOYMENT.md](job-search-platform/docs/DEPLOYMENT.md)

## Repository Shape

- `docs/`
  - Canonical product and architecture documentation
- `job-search-platform/`
  - Main Next.js application
- `landingsite/`
  - Marketing/landing surface
- `vps/`
  - Infrastructure and deployment notes

## Documentation Hierarchy

Use this order when you need the current product truth:

1. [docs/README.md](docs/README.md)
2. [docs/decisions/README.md](docs/decisions/README.md)
3. [docs/product/README.md](docs/product/README.md)
4. [JOURNAL.md](JOURNAL.md)

Historical and one-off records live under `docs/archive/` and should not outrank the active specs.

## Workflow Tooling

This repo also includes the Task-master / Autopilot workflow kit.
If you are working as an agent, the operational rules live in:

- [AGENTS.md](AGENTS.md)
- [docs/guides/taskmaster-guardrails.md](docs/guides/taskmaster-guardrails.md)
- [docs/guides/autopilot-agent-runbook.md](docs/guides/autopilot-agent-runbook.md)

Those are process docs, not product specs.
