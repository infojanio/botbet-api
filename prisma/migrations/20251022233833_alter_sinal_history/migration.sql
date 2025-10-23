/*
  Warnings:

  - You are about to drop the column `league` on the `SignalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `SignalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `SignalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `wins` on the `SignalHistory` table. All the data in the column will be lost.
  - Added the required column `greens` to the `SignalHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reds` to the `SignalHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSignals` to the `SignalHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voids` to the `SignalHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SignalHistory" DROP COLUMN "league",
DROP COLUMN "total",
DROP COLUMN "type",
DROP COLUMN "wins",
ADD COLUMN     "greens" INTEGER NOT NULL,
ADD COLUMN     "reds" INTEGER NOT NULL,
ADD COLUMN     "totalSignals" INTEGER NOT NULL,
ADD COLUMN     "voids" INTEGER NOT NULL;
