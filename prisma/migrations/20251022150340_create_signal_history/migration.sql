-- CreateTable
CREATE TABLE "SignalHistory" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "type" TEXT,
    "league" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalHistory_pkey" PRIMARY KEY ("id")
);
