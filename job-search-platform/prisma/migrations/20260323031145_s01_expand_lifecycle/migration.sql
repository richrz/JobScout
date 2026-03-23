-- AddValue: Expand ApplicationStatus enum with SCREENING, INTERVIEW, OFFER
-- Additive only — no DROP, no ALTER COLUMN TYPE, no data transform
ALTER TYPE "ApplicationStatus" ADD VALUE 'SCREENING' AFTER 'APPLIED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW' AFTER 'SCREENING';
ALTER TYPE "ApplicationStatus" ADD VALUE 'OFFER' AFTER 'INTERVIEW';

-- AddColumn: Add statusHistory to Workspace (defaults to empty JSONB array)
ALTER TABLE "Workspace" ADD COLUMN "statusHistory" JSONB NOT NULL DEFAULT '[]'::jsonb;
