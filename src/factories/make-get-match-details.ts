import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'
import { PrismaStatsRepository } from '../repositories/prisma/prisma-stats-repository'
import { GetMatchDetailsUseCase } from '../use-cases/get-match-details-use-case'

export function makeGetMatchDetailsUseCase() {
  const matchRepo = new PrismaMatchRepository()
  const statsRepo = new PrismaStatsRepository()
  return new GetMatchDetailsUseCase(matchRepo, statsRepo)
}
