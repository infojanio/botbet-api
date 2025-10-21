-- CreateTable
CREATE TABLE "MatchAnalysis" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchAnalysis_matchId_key" ON "MatchAnalysis"("matchId");

-- AddForeignKey
ALTER TABLE "MatchAnalysis" ADD CONSTRAINT "MatchAnalysis_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
