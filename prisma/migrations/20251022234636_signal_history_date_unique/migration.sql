/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `SignalHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SignalHistory" ALTER COLUMN "date" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "SignalHistory_date_key" ON "SignalHistory"("date");
