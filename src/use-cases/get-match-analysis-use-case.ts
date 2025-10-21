import { prisma } from '../lib/prisma'
import { ApiFootballService } from '../services/external-api/api-football-service'

export class GetMatchAnalysisUseCase {
  constructor(private api: ApiFootballService) {}

  async execute(matchId: number) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
    })

    if (!match) throw new Error('Partida não encontrada.')

    console.log(
      `📊 Analisando ${match.homeTeam.name} x ${match.awayTeam.name}...`,
    )

    const statsData = await this.api.getMatchStatistics(match.externalId!)
    if (!statsData || !statsData.response?.stats) {
      return { match, message: 'Nenhuma estatística disponível.' }
    }

    const stats = statsData.response.stats
    const find = (key: string) => {
      for (const group of stats) {
        const item = group.stats.find((s: any) => s.key === key)
        if (item) return item.stats
      }
      return [0, 0]
    }

    const [posHome, posAway] = find('BallPossesion')
    const [xgHome, xgAway] = find('expected_goals')
    const [cornersHome, cornersAway] = find('corners')
    const [yellowHome, yellowAway] = find('yellow_cards')

    // 🔹 Cálculo básico de padrões
    const totalXG = parseFloat(xgHome) + parseFloat(xgAway)
    const totalCorners = Number(cornersHome) + Number(cornersAway)
    const totalCards = Number(yellowHome) + Number(yellowAway)

    const suggestions = []

    if (totalXG > 2.2) {
      suggestions.push({
        type: 'GOLS',
        tip: 'Over 2.5',
        confidence: Math.min(95, totalXG * 40),
        reason: `xG total alto (${totalXG.toFixed(
          2,
        )}) indica tendência de gols.`,
      })
    }

    if (totalCorners >= 9) {
      suggestions.push({
        type: 'ESCANTEIOS',
        tip: 'Over 8.5',
        confidence: 80,
        reason: `Alta média de escanteios (${totalCorners}).`,
      })
    }

    if (totalCards >= 5) {
      suggestions.push({
        type: 'CARTÕES',
        tip: 'Over 4.5 cartões',
        confidence: 70,
        reason: `Partida com alta incidência de cartões (${totalCards}).`,
      })
    }

    if (posHome > 60) {
      suggestions.push({
        type: 'POSSE',
        tip: `${match.homeTeam.name} dominante`,
        confidence: 75,
        reason: `Posse de bola de ${posHome}% sugere domínio do mandante.`,
      })
    }

    return {
      match: {
        id: match.id,
        league: match.league.name,
        home: match.homeTeam.name,
        away: match.awayTeam.name,
        date: match.date,
      },
      stats: {
        xgHome,
        xgAway,
        cornersHome,
        cornersAway,
        yellowHome,
        yellowAway,
      },
      suggestions,
    }
  }
}
