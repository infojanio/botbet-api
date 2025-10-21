import { prisma } from '../../lib/prisma'

export class PrismaMatchAnalysisRepository {
  async findByMatchId(matchId: number) {
    return prisma.matchAnalysis.findUnique({
      where: { matchId },
    })
  }

  async save(matchId: number, data: any) {
    return prisma.matchAnalysis.upsert({
      where: { matchId },
      update: { data },
      create: { matchId, data },
    })
  }

  async deleteOld(days = 2) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    await prisma.matchAnalysis.deleteMany({
      where: { updatedAt: { lt: cutoff } },
    })
  }
}
