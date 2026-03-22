-- P0: Job Pipeline Provenance + Structured Fields
--
-- Design principles:
--   1. Additive-only. Zero existing columns modified or removed.
--   2. All new columns are nullable. Old rows get NULL, not fake values.
--   3. The existing sourceUrl @unique upsert path is untouched.
--   4. fingerprint @unique is the new cross-source dedup key alongside canonicalUrl.
--   5. The stale-overwrite trigger treats NULL lastExtractedAt as "always accept"
--      so pre-existing rows are never blocked.
--
-- Blast-radius notes:
--   - No FK changes. No cascade changes. No existing index modifications.
--   - skillsTags is TEXT[] with no GIN index yet — add when filtering by skills is wired up.
--   - salaryCurrency defaults to 'USD' for new rows; NULL for old rows is intentional.

-- ── Additive columns on Job ──────────────────────────────────────────────────

ALTER TABLE "Job"
  -- Pipeline provenance
  ADD COLUMN "sourceType"          TEXT,          -- "api" | "scraped" | "manual"
  ADD COLUMN "canonicalUrl"        TEXT,          -- unrolled terminal ATS URL (post-redirect)
  ADD COLUMN "fingerprint"         TEXT,          -- SHA256(normalize(company|title|location))
  ADD COLUMN "lastExtractedAt"     TIMESTAMP(3),  -- set by scraper worker at fetch time
  ADD COLUMN "recordConfidence"    DOUBLE PRECISION,  -- 0.0–1.0 normalization confidence
  ADD COLUMN "normalizationVersion" TEXT,         -- e.g. "1.0" stamps contract version

  -- Structured extraction fields
  ADD COLUMN "salaryMin"      DOUBLE PRECISION,
  ADD COLUMN "salaryMax"      DOUBLE PRECISION,
  ADD COLUMN "salaryCurrency" TEXT DEFAULT 'USD',
  ADD COLUMN "workMode"       TEXT,              -- "remote"|"hybrid"|"onsite"|"unknown"
  ADD COLUMN "seniority"      TEXT,              -- "entry"|"mid"|"senior"|"staff_plus"|"unknown"
  ADD COLUMN "skillsTags"     TEXT[] NOT NULL DEFAULT '{}';

-- ── Unique constraint: fingerprint ──────────────────────────────────────────
-- Nullable unique: two NULL values are NOT considered equal in Postgres,
-- so multiple unfingerprinted rows coexist safely. Only populated rows
-- are constrained to uniqueness.

CREATE UNIQUE INDEX "Job_fingerprint_key" ON "Job"("fingerprint");

-- ── Supporting indexes ───────────────────────────────────────────────────────

CREATE INDEX "Job_sourceType_idx"      ON "Job"("sourceType");
CREATE INDEX "Job_canonicalUrl_idx"    ON "Job"("canonicalUrl");
CREATE INDEX "Job_workMode_idx"        ON "Job"("workMode");
CREATE INDEX "Job_seniority_idx"       ON "Job"("seniority");
CREATE INDEX "Job_lastExtractedAt_idx" ON "Job"("lastExtractedAt");

-- ── Stale-overwrite protection trigger ───────────────────────────────────────
--
-- Problem: concurrent scraper workers can process the same job HTML in different
-- orders due to network jitter or queue retries. A delayed worker carrying a
-- stale extraction can overwrite a fresh record.
--
-- Solution: reject any UPDATE where the incoming lastExtractedAt is older than
-- the value already stored. Only fires when both old and new have a non-NULL
-- lastExtractedAt — rows without timestamps are always accepted (covers all
-- pre-existing rows and any update that doesn't set the field).

CREATE OR REPLACE FUNCTION prevent_stale_job_overwrite()
RETURNS TRIGGER AS $$
BEGIN
  -- Only guard when both sides have a timestamp to compare
  IF OLD."lastExtractedAt" IS NOT NULL
     AND NEW."lastExtractedAt" IS NOT NULL
     AND NEW."lastExtractedAt" < OLD."lastExtractedAt"
  THEN
    -- Silently skip the stale update rather than raising an error,
    -- so worker retries don't surface exceptions to the caller.
    -- Return OLD to leave the row unchanged.
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "job_stale_overwrite_guard" ON "Job";

CREATE TRIGGER "job_stale_overwrite_guard"
BEFORE UPDATE ON "Job"
FOR EACH ROW
EXECUTE FUNCTION prevent_stale_job_overwrite();
