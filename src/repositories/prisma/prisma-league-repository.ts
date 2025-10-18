import { prisma } from '../../lib/prisma'
import { ILeagueRepository } from '../interfaces/ILeagueRepository'

export class PrismaLeagueRepository implements ILeagueRepository {
  async findAll() {
    return prisma.league.findMany({
      include: { matches: true, teams: true },
    })
  }

  async upsert(data: {
    externalId: string | number
    name: string
    country?: string
    logo?: string
    season?: number
  }) {
    return prisma.league.upsert({
      where: { externalId: Number(data.externalId) },
      update: {
        name: data.name,
        country: data.country,
        logo: data.logo,
        season: data.season,
      },
      create: {
        externalId: Number(data.externalId),
        name: data.name,
        country: data.country,
        logo: data.logo,
        season: data.season,
      },
    })
  }
}
