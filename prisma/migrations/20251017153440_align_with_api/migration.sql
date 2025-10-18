/*
  Warnings:

  - The primary key for the `Match` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `competition` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `dateUtc` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `season` on the `Match` table. All the data in the column will be lost.
  - The `id` column on the `Match` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Signal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `edge` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `impliedProb` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `line` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `market` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `modelProb` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `selection` on the `Signal` table. All the data in the column will be lost.
  - The `id` column on the `Signal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Team` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `MatchCache` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Odds` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatternReport` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leagueId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `homeTeamId` on the `Match` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `awayTeamId` on the `Match` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `status` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `matchId` on the `Signal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_awayTeamId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_homeTeamId_fkey";

-- DropForeignKey
ALTER TABLE "Odds" DROP CONSTRAINT "Odds_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Signal" DROP CONSTRAINT "Signal_matchId_fkey";

-- DropIndex
DROP INDEX "Signal_market_line_createdAt_idx";

-- AlterTable
ALTER TABLE "Match" DROP CONSTRAINT "Match_pkey",
DROP COLUMN "competition",
DROP COLUMN "dateUtc",
DROP COLUMN "season",
ADD COLUMN     "awayScore" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "externalId" INTEGER,
ADD COLUMN     "homeScore" INTEGER,
ADD COLUMN     "leagueId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "homeTeamId",
ADD COLUMN     "homeTeamId" INTEGER NOT NULL,
DROP COLUMN "awayTeamId",
ADD COLUMN     "awayTeamId" INTEGER NOT NULL,
ADD CONSTRAINT "Match_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Signal" DROP CONSTRAINT "Signal_pkey",
DROP COLUMN "edge",
DROP COLUMN "impliedProb",
DROP COLUMN "line",
DROP COLUMN "market",
DROP COLUMN "modelProb",
DROP COLUMN "reason",
DROP COLUMN "selection",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "result" TEXT,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "matchId",
ADD COLUMN     "matchId" INTEGER NOT NULL,
ALTER COLUMN "confidence" SET DATA TYPE DOUBLE PRECISION,
ADD CONSTRAINT "Signal_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Team" DROP CONSTRAINT "Team_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "externalId" INTEGER,
ADD COLUMN     "leagueId" INTEGER,
ADD COLUMN     "logo" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "password",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "roleId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "MatchCache";

-- DropTable
DROP TABLE "Odds";

-- DropTable
DROP TABLE "PatternReport";

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" SERIAL NOT NULL,
    "externalId" INTEGER,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "logo" TEXT,
    "season" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchStat" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "possession" DOUBLE PRECISION,
    "expectedGoals" DOUBLE PRECISION,
    "shotsOnTarget" INTEGER,
    "corners" INTEGER,
    "yellowCards" INTEGER,
    "redCards" INTEGER,
    "fouls" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchHistory" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "opponentId" INTEGER NOT NULL,
    "result" TEXT,
    "goalsFor" INTEGER,
    "goalsAgainst" INTEGER,
    "home" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "League_externalId_key" ON "League"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_externalId_key" ON "Match"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_externalId_key" ON "Team"("externalId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchStat" ADD CONSTRAINT "MatchStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchStat" ADD CONSTRAINT "MatchStat_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchHistory" ADD CONSTRAINT "MatchHistory_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchHistory" ADD CONSTRAINT "MatchHistory_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
