-- CreateEnum
CREATE TYPE "DocumentState" AS ENUM ('REFERENCE', 'WORKING_DRAFT', 'SAVED_VARIANT', 'SUBMITTED_SNAPSHOT');

-- Replace DISMISSED with PASSED in the workspace status enum while preserving existing values.
ALTER TABLE "Workspace" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "ApplicationStatus_new" AS ENUM ('INTERESTED', 'APPLIED', 'FOLLOW_UP', 'DORMANT', 'ARCHIVED', 'PASSED');

ALTER TABLE "Workspace"
ALTER COLUMN "status" TYPE "ApplicationStatus_new"
USING (
  CASE
    WHEN "status"::text = 'DISMISSED' THEN 'PASSED'
    ELSE "status"::text
  END
)::"ApplicationStatus_new";

DROP TYPE "ApplicationStatus";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
ALTER TABLE "Workspace" ALTER COLUMN "status" SET DEFAULT 'INTERESTED';

-- Bridge Workspace back to Application without unifying lifecycle truth.
ALTER TABLE "Workspace" ADD COLUMN "applicationId" TEXT;

UPDATE "Workspace" AS "w"
SET "applicationId" = "a"."id"
FROM "Application" AS "a"
WHERE "w"."applicationId" IS NULL
  AND "w"."userId" = "a"."userId"
  AND "w"."jobId" = "a"."jobId";

-- Move resume ownership onto Workspace and make document state explicit.
ALTER TABLE "Resume" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "Resume" ADD COLUMN "documentState" "DocumentState" NOT NULL DEFAULT 'WORKING_DRAFT';

UPDATE "Resume"
SET "documentState" = CASE
  WHEN "applicationId" IS NOT NULL THEN 'SUBMITTED_SNAPSHOT'::"DocumentState"
  ELSE 'WORKING_DRAFT'::"DocumentState"
END;

UPDATE "Resume" AS "r"
SET "workspaceId" = "w"."id"
FROM "Workspace" AS "w"
WHERE "r"."workspaceId" IS NULL
  AND "r"."userId" = "w"."userId"
  AND "r"."jobId" = "w"."jobId";

DROP INDEX IF EXISTS "Resume_applicationId_key";

CREATE UNIQUE INDEX "Workspace_applicationId_key" ON "Workspace"("applicationId");
CREATE INDEX "Resume_workspaceId_documentState_idx" ON "Resume"("workspaceId", "documentState");

ALTER TABLE "Workspace"
ADD CONSTRAINT "Workspace_applicationId_fkey"
FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Resume"
ADD CONSTRAINT "Resume_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Submitted snapshots become immutable once created.
CREATE OR REPLACE FUNCTION prevent_submitted_snapshot_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."documentState" = 'SUBMITTED_SNAPSHOT'
    AND (
      NEW."content" IS DISTINCT FROM OLD."content"
      OR NEW."pdfSnapshot" IS DISTINCT FROM OLD."pdfSnapshot"
      OR NEW."atsScore" IS DISTINCT FROM OLD."atsScore"
    ) THEN
    RAISE EXCEPTION 'Submitted snapshots are immutable';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "resume_submitted_snapshot_immutable" ON "Resume";

CREATE TRIGGER "resume_submitted_snapshot_immutable"
BEFORE UPDATE ON "Resume"
FOR EACH ROW
EXECUTE FUNCTION prevent_submitted_snapshot_mutation();
