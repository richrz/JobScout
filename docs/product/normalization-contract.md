# Job Ingestion Normalization Contract

**Status:** Accepted  
**Date:** 2026-03-06  
**Owner:** Product + Engineering

Accepted via:
- [ADR 003](../decisions/003-normalization-contract-and-provider-policy.md)

## Purpose

Define the minimum required structure and quality for opportunities entering Inbox so filtering, triage, pipeline movement, and resume workflow are reliable.

## Non-Negotiable Provider Policy

- Production LLM calls must go directly to approved first-party providers.
- Approved providers for normalization:
  - Google (Gemini API)
  - OpenAI (OpenAI API)
- Disallowed in production normalization path:
  - OpenRouter
  - Free-tier models from third-party routers
  - Preview models as the only production default

## Scope

Applies to every `refresh sources` run and every ingestion source:
- API feeds
- Direct scrape feeds
- Future source connectors

No opportunity enters Inbox without passing this contract.

## Ingestion Stages

### Stage 1: Source Intake

- Capture raw record from source.
- Persist source metadata and fetch timestamp.
- Preserve raw text payload for audit/debug.

### Stage 2: Deterministic Normalization (Required)

These run before LLM usage:
- Title cleanup
- Company cleanup
- City/state normalization (no geocoding required)
- Salary parsing into structured min/max when possible
- Basic job type parsing (full-time, part-time, contract, temp, intern)
- Source URL canonicalization
- Fingerprint generation for dedupe

### Stage 3: Deduplication (Required)

- Exact dedupe by canonical URL + fingerprint.
- Near-duplicate comparison by normalized title/company/location.
- Dedupe outcome must be logged (`new`, `updated`, `duplicate_skipped`, `merged`).

### Stage 4: LLM Enrichment (Selective)

LLM runs only when needed, not always:
- Run for new records and materially changed records.
- Skip records with complete structured fields and high deterministic confidence.
- Escalate uncertain records to LLM extraction/classification.

Primary LLM tasks:
- Work mode classification (`remote`, `hybrid`, `onsite`, `unknown`)
- Seniority classification (`entry`, `mid`, `senior`, `staff_plus`, `unknown`)
- Role family classification
- Skills extraction (top normalized skills)
- Description cleanup for search quality

### Stage 5: Contract Validation Gate (Required)

Records must pass required field checks before Inbox visibility.
If validation fails:
- keep record in staging/quarantine
- log failure reason
- do not surface in Inbox

## Required Output Schema (Minimum)

Every Inbox-visible opportunity must include:
- `job_id` (internal stable id)
- `source`
- `source_type` (`api` | `scraped` | `manual`)
- `source_url_canonical`
- `title_normalized`
- `company_normalized`
- `city_normalized`
- `state_normalized`
- `location_display`
- `work_mode` (`remote` | `hybrid` | `onsite` | `unknown`)
- `job_type` (`full_time` | `part_time` | `contract` | `temporary` | `intern` | `unknown`)
- `seniority` (`entry` | `mid` | `senior` | `staff_plus` | `unknown`)
- `salary_min` (nullable)
- `salary_max` (nullable)
- `salary_currency` (nullable)
- `description_normalized`
- `skills_normalized` (array, can be empty)
- `posted_at` (or inferred posting date confidence)
- `ingested_at`
- `record_confidence` (0-1)
- `normalization_version`

## Field Quality Rules

- `work_mode` cannot be inferred from city string alone.
- `unknown` is valid; fake certainty is not valid.
- Salary fields must not be populated from weak guesses.
- `title_normalized` should remove source noise but preserve role meaning.
- City/state normalization must be consistent across sources.

## Confidence + Escalation Rules

- Deterministic high confidence: no LLM call needed.
- Deterministic low confidence: run primary LLM.
- If primary LLM confidence is below threshold:
  - either mark as `unknown` safely
  - or route to secondary model pass
- Never block the full refresh due to a small number of low-confidence records.

## Cost and Throughput Guardrails

- Default strategy: deterministic first, selective LLM second.
- LLM budget is controlled by:
  - % of records eligible for enrichment
  - token cap per record
  - retry cap
  - batch processing windows
- Suggested first production target:
  - enrich no more than 30% of records until quality baseline is measured
  - gradually reduce toward 10-20% once deterministic parser improves

## Operational Rules

- Every refresh run must emit:
  - total records ingested
  - total normalized
  - total deduped
  - total quarantined
  - total LLM-enriched
  - token and cost summary by provider/model
  - top failure reasons
- Contract version must be stamped on each normalized record.
- Contract changes require a version bump and migration plan.

## Acceptance Criteria

Contract is considered healthy when:
- Inbox location filters return expected non-zero results for known datasets.
- Work mode filter precision is acceptable on sampled audit set.
- Duplicate visible cards stay below agreed threshold.
- Pipeline/search behavior is consistent regardless of source.
- Failed records are observable and recoverable.

## Explicitly Out of Scope (Current Phase)

- Geocoding-based distance ranking
- Map visualization coordinates
- Real-time location radius scoring

These are deferred to v.next.
