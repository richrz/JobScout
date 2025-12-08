# Bug Report: 001 - Rate Limiting Blocking Auto-Save

**Date:** 2025-12-05
**Status:** In Progress
**Severity:** High (Blocks Core Functionality)

## Description
User reports seeing `Error: 429 Too Many Requests` when using the Profile Builder.

## Root Cause Analysis
The `middleware.ts` was configured with a strict rate limit of **100 requests per IP per hour**.
The Profile Builder component uses an **Auto-Save** mechanism that triggers a `POST` request to `/api/profile` every 2 seconds when changes are detected.
During a typical editing session (or automated testing), it is very easy to exceed 100 requests in a short period, triggering the Edge-compatible rate limiter.

## Remediation Plan
1. Increase the rate limit window or count significantly.
2. Since this is currently a single-user application run locally or on a private VPS, strict rate limiting is less critical than usability.
3. **Proposed Change:** Increase limit to **10,000 requests per hour**.

## Verification
User will manually test the Profile Builder to ensure no further 429 errors occur.
