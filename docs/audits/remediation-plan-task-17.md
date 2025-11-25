# Remediation Plan for Task 17 (Job Aggregation System)

**Date:** November 25, 2025
**Status:** In Progress
**Auditor:** Task Master Implementation Quality Auditor

## Executive Summary
This plan addresses the critical and major failures identified in the Audit Report for Task 17. The primary focus is on aligning the implementation with the task requirements (or updating requirements to match reality), fixing broken logic in deduplication, and replacing fragile regex scrapers with robust HTML parsing.

## 1. Critical Issues Remediation

### 1.1. "n8n Workflows" vs. TypeScript Scrapers
**Issue:** The file `src/lib/n8n-workflows.ts` is misnamed and implements manual scraping instead of n8n workflows.
**Plan:**
1.  **Rename File:** Rename `src/lib/n8n-workflows.ts` to `src/lib/job-scrapers.ts`.
2.  **Refactor Implementation:** Replace fragile Regex parsing with `cheerio` for robust HTML parsing.
3.  **Update Task Definition:** Update Task 17 in `tasks.json` to explicitly specify "TypeScript-based scraping using Cheerio" instead of "n8n workflows", reflecting the architectural decision to keep scraping in-app for now.
4.  **Update Tests:** Update `tests/unit/n8n-workflows.test.ts` to `tests/unit/job-scrapers.test.ts` and ensure it tests the Cheerio implementation.

### 1.2. Deduplication Logic Data Loss
**Issue:** `findDuplicates` marks all matching jobs as duplicates, leading to potential total data loss for those records.
**Plan:**
1.  **Rewrite Logic:** Modify `findDuplicates` to iterate through jobs and maintain a "seen" set.
    *   If a job matches a previously seen job (via fuzzy match), mark the *current* job as a duplicate.
    *   Preserve the *first* occurrence.
2.  **Rename/Refactor:** Consider renaming to `deduplicateJobs` which returns the *unique* list, or clarify the contract of `findDuplicates`.
3.  **Enhance Tests:** Add test cases specifically checking that one copy is preserved when duplicates exist.

## 2. Major Issues Remediation

### 2.1. Scheduler & Monitoring
**Issue:** Missing "monitoring dashboard", "error notifications", and "manual trigger API".
**Plan:**
1.  **Implement Manual Trigger:** Create a simple Next.js API route (`src/pages/api/jobs/trigger.ts` or `app/api/jobs/trigger/route.ts`) that invokes the aggregator.
2.  **Enhance Error Reporting:** Update `src/lib/scheduler.ts` to use a structured error reporting service (mocked for now, but structured) instead of just `console.error`.

## 3. Minor Issues Remediation

### 3.1. Unit Consistency
**Issue:** Task implied Miles, implementation uses Kilometers.
**Plan:**
1.  **Standardize:** Update `geographic-filter.ts` to support a `unit` parameter (km/miles) or standardize on one (likely Miles for US-centric job search, or Km for international). Given the audit comment, we will default to **Miles** or make it explicit.

## 4. Verification Steps
1.  Run `npm test` to ensure all unit tests pass.
2.  Verify `tasks.json` reflects the actual implementation.
3.  Generate a new Audit Report confirming compliance.
