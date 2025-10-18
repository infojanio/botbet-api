import { prisma } from '../../lib/prisma'
import { IStatsRepository } from '../interfaces/IStatsRepository'

export class PrismaStatsRepository implements IStatsRepository {
  async getByTeam(teamId: number) {
    const stats = await prisma.matchStat.findMany({
      where: { teamId },
      include: { match: true },
    })

    const total = stats.length || 1

    return {
      avgGoals: stats.reduce((a, s) => a + (s.expectedGoals || 0), 0) / total,
      avgCorners: stats.reduce((a, s) => a + (s.corners || 0), 0) / total,
      avgCards:
        stats.reduce(
          (a, s) => a + (s.yellowCards || 0) + (s.redCards || 0),
          0,
        ) / total,
      totalMatches: total,
    }
  }
}
