# Recovery And Plan Levers

**Status:** Accepted  
**Date:** 2026-03-06

## Purpose

This document defines the official recovery model and product packaging levers for `Opportunity` management.

It intentionally does **not** lock exact plan limits yet.

The goal is to preserve these decisions:

- users should not lose opportunities through normal workflow actions
- pricing should not mainly depend on raw job visibility
- paid value should increase as JobScout carries more of the user's workflow

See also:

- [lifecycle-state-contract.md](./lifecycle-state-contract.md)
- [workspace-lifecycle-concept.md](./workspace-lifecycle-concept.md)

## Core Packaging Principles

1. Raw discovery should not be the primary monetization lever.
2. Normal user actions should not hard-delete opportunities.
3. The main commercial lever should be how many opportunities the user is actively managing, not how many the market contains.
4. Higher tiers should unlock richer workspace behavior, longer retention, stronger recovery, and more automation.
5. Exact numeric caps remain intentionally open until real usage data is available.

## Official Bucket Model

### Discovery Catalog

- Meaning: all normalized `NEW` opportunities visible in Inbox and JobSwipe
- Purpose: search, filter, browse, and triage the market
- Product rule: this should feel broad and useful even on lower tiers
- Monetization rule: this is **not** the main count-based lever

### Managed Opportunities

- Meaning: the commercial bucket for opportunities the user has actively promoted into real pursuit
- Typical states:
  - `INTERESTED`
  - `PREP`
  - `APPLIED`
  - `SCREENING`
  - `INTERVIEW`
  - `OFFER`
- Product rule: this is the main count-based lever
- Why it exists: this is the set where the app is doing real organizational work for the user

This is the recommended artificial bucket for plan design.

### Passed Bin

- Meaning: searchable, recoverable "not now" holding area
- Entry paths:
  - pass from Inbox
  - pass from JobSwipe
  - de-prioritize from active pursuit when appropriate
- Product rule: `PASSED` is never hard deletion
- Monetization lever:
  - retention depth
  - bulk restore
  - richer search/history inside the bin

### Archive

- Meaning: long-term retained history for opportunities the user wants to keep but not actively work
- Typical entries:
  - completed pursuits
  - withdrawn opportunities
  - old passed items after retention transition
  - intentionally retained reference opportunities
- Product rule: archive remains searchable and restorable
- Monetization lever:
  - archive depth
  - historical analytics
  - long-term memory

### Trash

- Meaning: deliberate removal area for user-controlled records, especially manual entries or workspace artifacts
- Product rule:
  - trash is different from `PASSED`
  - trash should have a visible restore window
  - "empty trash" should still not become immediate, user-irreversible destruction

### Recovery Vault

- Meaning: support/admin-only recovery layer after trash clear or trash expiry
- Product rule:
  - not user-visible in the main UI
  - exists to prevent catastrophic data loss
- Monetization lever:
  - support level
  - recovery SLA
  - enterprise/admin tooling

## What Should Be Metered

Preferred plan levers:

- `Managed Opportunities`
- workspace feature depth
- passed-bin retention depth
- archive retention depth
- AI workspace assistance
- reminders, follow-up tooling, and timeline depth
- collaboration, governance, and admin recovery

## What Should Not Be The Main Lever

Avoid making these the core paywall:

- raw number of `NEW` opportunities visible in Inbox
- basic search and filtering
- the simple act of passing or restoring a single opportunity

The product should feel valuable before it feels restrictive.

## Workspace Tooling As A Tier Lever

This is the strongest mid-tier lever.

Recommended direction:

### Baseline Tier

- browse discovery catalog
- basic search/filter/sort
- save, pass, restore
- simple pipeline visibility
- lightweight workspace access

### Mid Tier

- richer stage journals
- artifact management
- submitted document snapshots
- multiple draft variants per opportunity
- tone and style presets for resume and cover letter generation
- saved personal tone profiles
- richer document families such as screening notes, recruiter call notes, and interview prep packets
- version history and draft comparison for key documents
- bulk triage and restore
- saved views and better history
- reminders and follow-up tools
- deeper AI assistance in the workspace

### Enterprise Tier

- shared workspaces
- team collaboration
- admin restore and recovery controls
- audit trail
- custom retention policies
- governance and approval workflows

## Product Gravity Principles

If we want users to adopt more of the app, the answer is not arbitrary limitation.
The answer is to make deeper workflow behavior live inside the product.

Recommended gravity:

- a save from JobSwipe should open a quick capture moment that feeds the workspace
- meaningful stage changes should require workspace-backed context or artifacts
- submitted resumes and cover letters should become official snapshots only inside the workspace
- follow-up, screening, and interview organization should work best inside the workspace
- recovery should preserve notes, journals, and artifacts so the system feels trustworthy

This creates upgrade pressure through usefulness instead of frustration.

## Commercial Guidance

The likely durable pricing story is:

- entry tier = broad discovery, lighter management
- middle tier = serious individual operator plan with the best workflow tools
- enterprise tier = team, governance, recovery, and custom policy

The middle tier should likely win on:

- better workspace tools
- more system memory
- better recovery
- better organization
- better resume and document control

Not simply on "more jobs."

## Open Decisions

Still intentionally undecided:

- exact `Managed Opportunities` cap by tier
- exact passed-bin retention by tier
- exact archive retention by tier
- whether archive has a soft storage quota
- whether recovery-vault restore is support-only on all tiers or varies by plan

## Packaging Notes To Revisit

Promising Pro-tier levers to test later:

- advanced tone settings and saved tone presets
- higher limits on document versions or saved draft families
- additional artifact types inside a workspace
- compare-and-restore history for resumes and cover letters

These should be treated as depth-of-workflow levers, not as arbitrary nuisance caps.
