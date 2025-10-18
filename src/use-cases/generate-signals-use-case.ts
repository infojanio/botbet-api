import { prisma } from '../lib/prisma'

export class GenerateSignalsUseCase {
  async execute() {
    const matches = await prisma.match.findMany({
      where: { status: { not: 'finished' } },
      include: {
        homeTeam: { include: { stats: true } },
        awayTeam: { include: { stats: true } },
        league: true,
      },
    })

    const createdSignals = []

    for (const match of matches) {
      const homeStats = match.homeTeam.stats
      const awayStats = match.awayTeam.stats

      // 🔹 Substituímos goalsFor por expectedGoals ou shotsOnTarget
      const avgHomeAttack =
        homeStats.reduce(
          (sum, s) => sum + (s.expectedGoals ?? s.shotsOnTarget ?? 0),
          0,
        ) / (homeStats.length || 1)

      const avgAwayAttack =
        awayStats.reduce(
          (sum, s) => sum + (s.expectedGoals ?? s.shotsOnTarget ?? 0),
          0,
        ) / (awayStats.length || 1)

      const avgHomeCards =
        homeStats.reduce((sum, s) => sum + (s.yellowCards ?? 0), 0) /
        (homeStats.length || 1)

      const avgAwayCards =
        awayStats.reduce((sum, s) => sum + (s.yellowCards ?? 0), 0) /
        (awayStats.length || 1)

      const avgCorners =
        [...homeStats, ...awayStats].reduce(
          (sum, s) => sum + (s.corners ?? 0),
          0,
        ) / (homeStats.length + awayStats.length || 1)

      // 🔹 Regras simples de sinal
      const signals = []

      if (avgHomeAttack + avgAwayAttack >= 3.5) {
        signals.push({
          matchId: match.id,
          type: 'Over 2.5 Goals',
          confidence: 85,
          description: `Média ofensiva: ${(
            avgHomeAttack + avgAwayAttack
          ).toFixed(2)} — tendência Over 2.5`,
          status: 'active',
        })
      }

      if (avgHomeCards + avgAwayCards >= 4.5) {
        signals.push({
          matchId: match.id,
          type: 'Over 4.5 Cards',
          confidence: 80,
          description: `Média de cartões: ${(
            avgHomeCards + avgAwayCards
          ).toFixed(2)} — jogo com forte probabilidade de cartões`,
          status: 'active',
        })
      }

      if (avgCorners >= 8.5) {
        signals.push({
          matchId: match.id,
          type: 'Over 8.5 Corners',
          confidence: 75,
          description: `Média de escanteios: ${avgCorners.toFixed(
            2,
          )} — tendência de muitos escanteios`,
          status: 'active',
        })
      }

      // 🔹 Salva sinais no banco
      for (const s of signals) {
        const existing = await prisma.signal.findFirst({
          where: { matchId: match.id, type: s.type },
        })

        if (!existing) {
          const created = await prisma.signal.create({ data: s })
          createdSignals.push(created)
        }
      }
    }

    return createdSignals
  }
}
