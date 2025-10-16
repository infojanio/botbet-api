import { prisma } from '../../lib/prisma'

export class PrismaSignalRepository {
  async create(data: {
    matchId: number
    homeTeam: string
    awayTeam: string
    type: string
    probability: number
    status: string
  }) {
    return await prisma.signal.create({ data })
  }

  async findById(id: string) {
    return await prisma.signal.findUnique({ where: { id } })
  }

  async findMany() {
    return await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  // ✅ Novo método: encontra sinal por partida + tipo
  async findByMatchAndType(matchId: string | number, type: string) {
    return await prisma.signal.findFirst({
 where: {
      matchId: String(matchId), // ✅ força tipo correto
      type,
    },
    })
  }

  async updateStatus(id: string, status: string) {
    return await prisma.signal.update({
      where: { id },
      data: { status },
    })
  }

  async delete(id: string) {
    return await prisma.signal.delete({ where: { id } })
  }
}
