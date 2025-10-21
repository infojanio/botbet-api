import { AnalyzeMatchHistoryUseCase } from './analyze-match-history-use-case'
import { ApiFootballService } from '../services/external-api/api-football-service'
import { prisma } from '../lib/prisma'
import dayjs from 'dayjs'

export class GetUpcomingMatchesAnalysisUseCase {
  constructor(private api: ApiFootballService) {}

  async execute() {
    const historyAnalyzer = new AnalyzeMatchHistoryUseCase()
    const today = dayjs().startOf('day')
    const tomorrow = dayjs().add(1, 'day').endOf('day')

    const matches = await prisma.match.findMany({
      where: { date: { gte: today.toDate(), lte: tomorrow.toDate() } },
      include: { homeTeam: true, awayTeam: true, league: true },
    })

    const results = []

    for (const match of matches) {
      console.log(
        `📊 Analisando ${match.homeTeam.name} x ${match.awayTeam.name}...`,
      )

      try {
        // Histórico e H2H
        const homeHistory = await historyAnalyzer.execute(match.homeTeam.id)
        const awayHistory = await historyAnalyzer.execute(match.awayTeam.id)
        const h2h = await historyAnalyzer.getHeadToHead(
          match.homeTeam.id,
          match.awayTeam.id,
        )

        // Estatísticas da API
        const statsData = await this.api.getMatchStatistics(match.externalId!)
        const stats = statsData?.response?.stats || []

        const find = (key: string) => {
          for (const group of stats) {
            const item = group.stats.find((s: any) => s.key === key)
            if (item) return item.stats
          }
          return [0, 0]
        }

        const [xgHome, xgAway] = find('expected_goals')
        const [cornersHome, cornersAway] = find('corners')
        const [yellowHome, yellowAway] = find('yellow_cards')

        const totalXG = parseFloat(xgHome) + parseFloat(xgAway)
        const totalCorners = Number(cornersHome) + Number(cornersAway)
        const totalCards = Number(yellowHome) + Number(yellowAway)

        // Sinais
        const signals = []

        const historicalOver25 =
          ((homeHistory?.over25Rate || 0) + (awayHistory?.over25Rate || 0)) / 2
        const confirmH2H = h2h?.over25Rate || 0

        if (totalXG > 2.2 || historicalOver25 > 60 || confirmH2H > 60) {
          signals.push({
            type: 'GOLS_OVER_2_5',
            confidence: Math.min(100, (historicalOver25 + confirmH2H) / 2),
            description: `Alta probabilidade de +2.5 gols — histórico ${historicalOver25.toFixed(
              1,
            )}% | H2H ${confirmH2H.toFixed(1)}%`,
            status: 'pending',
          })
        }

        if (totalCorners >= 9) {
          signals.push({
            type: 'CORNERS_OVER_8_5',
            confidence: 80,
            description: `Alta frequência de escanteios (${totalCorners})`,
            status: 'pending',
          })
        }

        if (totalCards >= 5) {
          signals.push({
            type: 'CARDS_OVER_4_5',
            confidence: 70,
            description: `Média de cartões: ${totalCards}`,
            status: 'pending',
          })
        }

        // Calcula TrendScore
        const trendScore = this.calculateTrendScore({
          xg: totalXG,
          over25Rate: historicalOver25,
          h2hOver25: confirmH2H,
          corners: totalCorners,
          cards: totalCards,
          signals,
        })

        // Salva no banco (Match + Signals)
        await prisma.match.update({
          where: { id: match.id },
          data: { trendScore },
        })

        for (const s of signals) {
          await prisma.signal.upsert({
            where: {
              matchId_type: {
                matchId: match.id,
                type: s.type,
              },
            },
            update: {
              confidence: s.confidence,
              description: s.description,
              status: s.status,
            },
            create: {
              matchId: match.id,
              type: s.type,
              confidence: s.confidence,
              description: s.description,
              status: s.status,
            },
          })
        }

        results.push({
          match: {
            id: match.id,
            league: match.league.name,
            home: match.homeTeam.name,
            away: match.awayTeam.name,
          },
          trendScore,
          stats: { totalXG, totalCorners, totalCards },
          signals,
        })
      } catch (err) {
        console.log(
          `⚠️ Erro ao analisar ${match.homeTeam.name} x ${match.awayTeam.name}:`,
          err instanceof Error ? err.message : err,
        )
      }
    }

    // Ordena por potencial de green
    return results.sort((a, b) => b.trendScore - a.trendScore)
  }

  private calculateTrendScore(data: {
    xg: number
    over25Rate: number
    h2hOver25: number
    corners: number
    cards: number
    signals: any[]
  }): number {
    const { xg, over25Rate, h2hOver25, corners, cards, signals } = data

    const baseScore =
      xg * 10 +
      over25Rate * 0.3 +
      h2hOver25 * 0.3 +
      (corners >= 9 ? 10 : 0) +
      (cards >= 5 ? 5 : 0)

    const signalBoost =
      signals.length > 0
        ? signals.reduce((acc, s) => acc + (s.confidence || 0), 0) /
          signals.length /
          2
        : 0

    return Math.min(100, baseScore + signalBoost)
  }
}
