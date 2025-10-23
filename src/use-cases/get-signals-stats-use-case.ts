import { prisma } from '../lib/prisma'

export class GetSignalsStatsUseCase {
  async execute() {
    // Busca todos os sinais finalizados
    const allSignals = await prisma.signal.findMany({
      where: { status: { in: ['win', 'lose'] } },
    })

    if (allSignals.length === 0) {
      return { total: 0, accuracy: 0, byType: [], byLeague: [] }
    }

    // ✅ Totais globais
    const total = allSignals.length
    const wins = allSignals.filter((s) => s.status === 'win').length
    const accuracy = Number(((wins / total) * 100).toFixed(1))

    // 🎯 Média de assertividade por tipo
    const groupedByType = Object.values(
      allSignals.reduce((acc: any, s) => {
        if (!acc[s.type]) acc[s.type] = { type: s.type, total: 0, wins: 0 }
        acc[s.type].total++
        if (s.status === 'win') acc[s.type].wins++
        return acc
      }, {}),
    ).map((g: any) => ({
      type: g.type,
      total: g.total,
      wins: g.wins,
      accuracy: Number(((g.wins / g.total) * 100).toFixed(1)),
    }))

    // 🏆 Assertividade por liga
    const groupedByLeague = Object.values(
      allSignals.reduce((acc: any, s) => {
        const key = s.league || 'Desconhecida'
        if (!acc[key]) acc[key] = { league: key, total: 0, wins: 0 }
        acc[key].total++
        if (s.status === 'win') acc[key].wins++
        return acc
      }, {}),
    ).map((g: any) => ({
      league: g.league,
      total: g.total,
      wins: g.wins,
      accuracy: Number(((g.wins / g.total) * 100).toFixed(1)),
    }))

    return {
      total,
      wins,
      accuracy,
      byType: groupedByType,
      byLeague: groupedByLeague,
    }
  }
}
