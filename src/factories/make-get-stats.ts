import { PrismaStatsRepository } from "../repositories/prisma/prisma-stats-repository";
import { GetStatsUseCase } from "../use-cases/get-stats";

export function makeGetStats() {
  return new GetStatsUseCase(new PrismaStatsRepository());
}
