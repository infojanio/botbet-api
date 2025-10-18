import { prisma } from '../../lib/prisma'

export class PrismaTeamRepository {
  async upsert(data: any) {
    return prisma.team.upsert({
      where: { externalId: data.externalId },
      update: { name: data.name, logo: data.logo, country: data.country },
      create: {
        externalId: data.externalId,
        name: data.name,
        logo: data.logo,
        country: data.country,
        leagueId: data.leagueId,
      },
    })
  }
}
