import { prisma } from '../../lib/prisma'

export class PrismaMatchRepository {
  async upsert(data: {
    externalId: string | number
    date: Date
    leagueId: number
    homeTeamId: number
    awayTeamId: number
    status: string
    homeScore?: number | null
    awayScore?: number | null
  }) {
    return prisma.match.upsert({
      where: { externalId: Number(data.externalId) },
      update: {
        date: data.date,
        leagueId: data.leagueId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        status: data.status,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
      },
      create: {
        externalId: Number(data.externalId),
        date: data.date,
        leagueId: data.leagueId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        status: data.status,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
      },
    })
  }

  async findById(id: number) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        signals: true,
      },
    })
  }

  async findUpcoming(params: { from?: Date; to?: Date; limit?: number }) {
    return prisma.match.findMany({
      where: {
        date: {
          gte: params.from ?? new Date(),
          lte: params.to ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'scheduled',
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        signals: true,
      },
      orderBy: { date: 'asc' },
      take: params.limit ?? 50,
    })
  }
}
