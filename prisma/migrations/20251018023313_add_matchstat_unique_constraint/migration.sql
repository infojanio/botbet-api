/*
  Warnings:

  - A unique constraint covering the columns `[matchId,teamId]` on the table `MatchStat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MatchStat_matchId_teamId_key" ON "MatchStat"("matchId", "teamId");
