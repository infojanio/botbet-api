import { prisma } from '../../lib/prisma'
import { ISignalRepository } from '../interfaces/ISignalRepository'

export class PrismaSignalRepository implements ISignalRepository {
  async findMany() {
    return prisma.signal.findMany({
      include: {
        match: { include: { homeTeam: true, awayTeam: true, league: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
