import { PrismaStatsRepository } from '../repositories/prisma/prisma-stats-repository'
import { GetStatsUseCase } from '../use-cases/get-stats-use-case'

export function makeGetStatsUseCase() {
  const repo = new PrismaStatsRepository()
  return new GetStatsUseCase(repo)
}
