/*
  Warnings:

  - A unique constraint covering the columns `[sourceUrl]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Job_sourceUrl_key" ON "Job"("sourceUrl");
