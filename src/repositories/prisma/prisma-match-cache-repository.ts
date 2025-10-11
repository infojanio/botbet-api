import { prisma } from '../../db/prisma'
import { IMatchCacheRepository } from '../interfaces/IMatchCacheRepository'

export class PrismaMatchCacheRepository implements IMatchCacheRepository {
  async findByDate(date: Date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('⚠️ Data inválida passada para findByDate:', date)
      return []
    }

    const start = new Date(date)
    start.setUTCHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setUTCHours(23, 59, 59, 999)

    return prisma.matchCache.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    })
  }

  async createMany(matches: any[]) {
    if (!matches.length) return
    await prisma.matchCache.createMany({
      data: matches.map((m) => ({
        eventId: String(m.eventId || m.fixture?.id),
        date: new Date(m.date),
        league: m.league,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        status: m.status || 'SCHEDULED',
        rawData: m.rawData || {},
      })),
      skipDuplicates: true,
    })
  }
}
