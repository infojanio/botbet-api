import { prisma } from '../lib/prisma'

interface MatchHistoryAnalysis {
  teamName: string
  avgGoalsFor: number
  avgGoalsAgainst: number
  winRate: number
  over25Rate: number
}

export class AnalyzeMatchHistoryUseCase {
  // 🔹 Últimas 5 partidas de um time
  async execute(teamId: number): Promise<MatchHistoryAnalysis | null> {
    const matches = await prisma.matchHistory.findMany({
      where: { opponentId: teamId },
      include: { opponent: true }, // ✅ inclui nome do time oponente
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    if (!matches.length) return null

    const totalGames = matches.length
    const goalsFor = matches.reduce((acc, m) => acc + (m.goalsFor || 0), 0)
    const goalsAgainst = matches.reduce(
      (acc, m) => acc + (m.goalsAgainst || 0),
      0,
    )
    const wins = matches.filter((m) => m.result === 'win').length
    const over25 = matches.filter(
      (m) => (m.goalsFor || 0) + (m.goalsAgainst || 0) > 2.5,
    ).length

    return {
      teamName: matches[0]?.opponent?.name || 'Desconhecido',
      avgGoalsFor: goalsFor / totalGames,
      avgGoalsAgainst: goalsAgainst / totalGames,
      winRate: (wins / totalGames) * 100,
      over25Rate: (over25 / totalGames) * 100,
    }
  }

  // 🔹 Confrontos diretos (head-to-head)
  async getHeadToHead(homeId: number, awayId: number) {
    const h2h = await prisma.matchHistory.findMany({
      where: {
        OR: [
          { match: { homeTeamId: homeId, awayTeamId: awayId } },
          { match: { homeTeamId: awayId, awayTeamId: homeId } },
        ],
      },
      include: { match: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    if (!h2h.length) return null

    const totalGames = h2h.length
    const over25 = h2h.filter(
      (m) => (m.goalsFor || 0) + (m.goalsAgainst || 0) > 2.5,
    ).length
    const draw = h2h.filter((m) => m.result === 'draw').length
    const winHome = h2h.filter((m) => m.home && m.result === 'win').length

    return {
      totalGames,
      over25Rate: (over25 / totalGames) * 100,
      drawRate: (draw / totalGames) * 100,
      winHomeRate: (winHome / totalGames) * 100,
    }
  }
}
