import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'
import { PrismaStatsRepository } from '../repositories/prisma/prisma-stats-repository'

export class GetMatchDetailsUseCase {
  constructor(
    private matchRepo: PrismaMatchRepository,
    private statsRepo: PrismaStatsRepository,
  ) {}

  async execute(id: number) {
    const match = await this.matchRepo.findById(id)
    if (!match) throw new Error('Match not found')

    const homeStats = await this.statsRepo.getByTeam(match.homeTeamId)
    const awayStats = await this.statsRepo.getByTeam(match.awayTeamId)

    return {
      ...match,
      analysis: {
        homeStats,
        awayStats,
      },
    }
  }
}
