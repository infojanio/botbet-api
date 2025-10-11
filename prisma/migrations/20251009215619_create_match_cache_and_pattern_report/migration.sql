-- CreateTable
CREATE TABLE "MatchCache" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "league" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "oddHome" DOUBLE PRECISION,
    "oddAway" DOUBLE PRECISION,
    "lowestOdd" DOUBLE PRECISION,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternReport" (
    "id" TEXT NOT NULL,
    "teamId" TEXT,
    "teamName" TEXT,
    "reportJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatternReport_pkey" PRIMARY KEY ("id")
);
