/*
  Warnings:

  - A unique constraint covering the columns `[matchId,type]` on the table `Signal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Signal_matchId_type_key" ON "Signal"("matchId", "type");
