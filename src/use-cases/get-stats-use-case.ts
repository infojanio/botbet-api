import { PrismaStatsRepository } from '../repositories/prisma/prisma-stats-repository'

export class GetStatsUseCase {
  constructor(private statsRepo: PrismaStatsRepository) {}

  async execute(teamId: number) {
    return this.statsRepo.getByTeam(teamId)
  }
}
