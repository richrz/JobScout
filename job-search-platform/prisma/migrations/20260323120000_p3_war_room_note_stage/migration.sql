-- AddColumn: Tag WarRoomNotes with the workspace stage they were written in
-- Additive only — nullable, existing rows get NULL (pre-stage tracking)
ALTER TABLE "WarRoomNote" ADD COLUMN "stage" "ApplicationStatus";
