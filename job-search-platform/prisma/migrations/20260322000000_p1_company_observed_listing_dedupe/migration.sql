-- P1: Company entity table + ObservedListing provenance table + DedupeDecision audit log
--
-- Design principles:
--   1. Additive-only. Job.companyId is nullable — existing rows keep NULL.
--   2. ObservedListing.jobId is nullable — a listing may exist before dedup resolves it.
--   3. DedupeDecision has no FKs to ObservedListing — it uses plain IDs to avoid
--      cascade complexity. The dedup worker is responsible for referential sanity.
--   4. skillsTags DEFAULT '' dropped — Prisma manages defaults at the client layer.
--      Existing rows with '{}' are unaffected.
--   5. OnDelete behavior:
--      - Job → Company: SET NULL (company entity survives job deletion)
--      - ObservedListing → Job: SET NULL (listing survives if canonical job is deleted;
--        allows re-linking to a different canonical job after manual review)

-- ── Company table ─────────────────────────────────────────────────────────────

CREATE TABLE "Company" (
    "id"            TEXT        NOT NULL,
    "canonicalName" TEXT        NOT NULL,
    "displayName"   TEXT        NOT NULL,
    "domain"        TEXT,
    "careerPageUrl" TEXT,
    "atsSystem"     TEXT,
    "logoUrl"       TEXT,
    "linkedinUrl"   TEXT,
    "employeeCount" INTEGER,
    "industry"      TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Company_canonicalName_key" ON "Company"("canonicalName");
CREATE INDEX "Company_domain_idx"     ON "Company"("domain");
CREATE INDEX "Company_atsSystem_idx"  ON "Company"("atsSystem");

-- ── Job: add companyId FK column ─────────────────────────────────────────────

ALTER TABLE "Job"
  ADD COLUMN "companyId" TEXT,
  ALTER COLUMN "skillsTags" DROP DEFAULT;

CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");

ALTER TABLE "Job"
  ADD CONSTRAINT "Job_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ── ObservedListing table ─────────────────────────────────────────────────────
--
-- One row per raw source occurrence. Multiple listings may resolve to one Job.
-- rawContent is TEXT not JSONB so it can hold HTML or JSON without schema coupling.

CREATE TABLE "ObservedListing" (
    "id"                   TEXT        NOT NULL,
    "jobId"                TEXT,                        -- resolved canonical job (nullable until dedup)
    "source"               TEXT        NOT NULL,        -- "jsearch"|"greenhouse"|"lever"|"company"|...
    "sourceUrl"            TEXT        NOT NULL,        -- original URL found at
    "canonicalUrl"         TEXT,                        -- resolved ATS URL after redirect
    "sourceType"           TEXT        NOT NULL,        -- "api"|"scraped"|"manual"
    "rawContent"           TEXT,                        -- original HTML or JSON payload
    "extractedAt"          TIMESTAMP(3) NOT NULL,       -- when scraper fetched this
    "extractedTitle"       TEXT,
    "extractedCompany"     TEXT,
    "extractedLocation"    TEXT,
    "extractedSalary"      TEXT,
    "extractedPostedAt"    TIMESTAMP(3),
    "normalizationVersion" TEXT,
    "normalizationError"   TEXT,
    "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObservedListing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ObservedListing_jobId_idx"              ON "ObservedListing"("jobId");
CREATE INDEX "ObservedListing_source_sourceUrl_idx"   ON "ObservedListing"("source", "sourceUrl");
CREATE INDEX "ObservedListing_canonicalUrl_idx"       ON "ObservedListing"("canonicalUrl");
CREATE INDEX "ObservedListing_extractedAt_idx"        ON "ObservedListing"("extractedAt");
CREATE INDEX "ObservedListing_source_extractedAt_idx" ON "ObservedListing"("source", "extractedAt");

ALTER TABLE "ObservedListing"
  ADD CONSTRAINT "ObservedListing_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ── DedupeDecision table ──────────────────────────────────────────────────────
--
-- Audit log for every pair comparison regardless of outcome.
-- No FK constraints to ObservedListing — plain IDs for loose coupling.
-- The dedup worker owns referential sanity; the log survives listing deletion.

CREATE TABLE "DedupeDecision" (
    "id"              TEXT        NOT NULL,
    "listingAId"      TEXT        NOT NULL,
    "listingBId"      TEXT        NOT NULL,
    "method"          TEXT        NOT NULL,   -- "exact_url"|"fingerprint"|"embedding"|"llm"
    "outcome"         TEXT        NOT NULL,   -- "same"|"different"|"uncertain"
    "similarity"      DOUBLE PRECISION,       -- embedding cosine score if applicable
    "mergedIntoJobId" TEXT,                   -- canonical Job.id when outcome="same"
    "llmReasoning"    TEXT,                   -- LLM explanation when method="llm"
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DedupeDecision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DedupeDecision_listingAId_idx"          ON "DedupeDecision"("listingAId");
CREATE INDEX "DedupeDecision_listingBId_idx"          ON "DedupeDecision"("listingBId");
CREATE INDEX "DedupeDecision_outcome_createdAt_idx"   ON "DedupeDecision"("outcome", "createdAt");
CREATE INDEX "DedupeDecision_mergedIntoJobId_idx"     ON "DedupeDecision"("mergedIntoJobId");
