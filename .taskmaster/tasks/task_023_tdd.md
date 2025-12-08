# Task ID: 23

**Title:** Audit Process Reform and Runtime Verification Protocols

**Status:** pending

**Dependencies:** 22 ✓

**Priority:** medium

**Description:** Update project documentation to mandate runtime verification for all future task audits, ensuring the application builds, starts, and serves valid responses before approval.

**Details:**

1. Modify `AUDITOR.md` to explicitly state: 'No task shall be marked as completed based solely on static code analysis.'
2. Define the 'Runtime Verification Standard' in the documentation:
   - Clean dependency install (`npm ci`).
   - Successful production build (`npm run build`).
   - Dev server startup (`npm run dev`) without immediate crash.
   - Manual or automated check that core routes (/, /pipeline, /settings, /map) return HTTP 200.
3. Create a convenience script `scripts/pre-audit-check.sh` that runs linting, type checking, and a build test.
4. Update `CONTRIBUTING.md` to reflect that broken builds or runtime errors will result in immediate task rejection.

**Test Strategy:**

1. Review `AUDITOR.md` for the new mandatory runtime checks.
2. Run the `scripts/pre-audit-check.sh` on the current main branch to ensure the current state passes.
3. Manually verify `npm run dev` starts successfully.
4. Navigate to the Dashboard, Kanban, and Settings pages to verify they load (HTTP 200).
5. Introduce a deliberate syntax error and verify the audit check script fails.
