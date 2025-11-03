import { AnalyzeMatchHistoryUseCase } from './analyze-match-history-use-case'
import { ApiFootballService } from '../services/external-api/api-football-service'
import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'

/**
 * Analisa partidas futuras (hoje e amanhã) com base em padrões históricos
 * e gera previsões com probabilidade de green.
 */
export class GetUpcomingMatchesAnalysisUseCase {
  constructor(
    private api: ApiFootballService,
    private matchRepository = new PrismaMatchRepository(),
  ) {}

  async execute(fromDate?: Date) {
    const historyAnalyzer = new AnalyzeMatchHistoryUseCase()

    // Se passar uma data, gera análise apenas desse dia
    const matches = fromDate
      ? await this.matchRepository.findByDate(fromDate)
      : await this.matchRepository.findUpcoming()

    if (!matches.length) {
      console.log('⚠️ Nenhuma partida encontrada para o período solicitado.')
      return []
    }

    const results = []

    for (const match of matches) {
      console.log(
        `📊 Analisando ${match.homeTeam.name} x ${match.awayTeam.name}...`,
      )

      try {
        const homeHistory = await historyAnalyzer.execute(
          Number(match.homeTeam.externalId ?? match.homeTeam.id),
        )
        const awayHistory = await historyAnalyzer.execute(
          Number(match.awayTeam.externalId ?? match.awayTeam.id),
        )
        const h2h = await historyAnalyzer.getHeadToHead(
          Number(match.homeTeam.externalId ?? match.homeTeam.id),
          Number(match.awayTeam.externalId ?? match.awayTeam.id),
        )

        if (!homeHistory || !awayHistory) continue

        const totalAvgGoals = homeHistory.avgGoals + awayHistory.avgGoals
        const totalAvgCorners = homeHistory.avgCorners + awayHistory.avgCorners
        const totalAvgCards = homeHistory.avgCards + awayHistory.avgCards
        const over25Rate = (homeHistory.over25Rate + awayHistory.over25Rate) / 2
        const h2hOver25 = h2h?.over25Rate || 0

        const signals = []

        // ⚽ +2.5 GOLS
        if (totalAvgGoals >= 2.6 || over25Rate > 60 || h2hOver25 > 60) {
          signals.push({
            type: 'GOLS_OVER_2_5',
            confidence: Math.min(
              100,
              (over25Rate + h2hOver25) / 2 + totalAvgGoals * 10,
            ),
            description: `Alta probabilidade de +2.5 gols — média ${totalAvgGoals.toFixed(
              1,
            )} | histórico ${over25Rate.toFixed(1)}% | H2H ${h2hOver25.toFixed(
              1,
            )}%`,
            status: 'pending',
          })
        }

        // 🤝 Ambas marcam (BTTS)
        const combinedBtts = (homeHistory.bttsRate + awayHistory.bttsRate) / 2
        const h2hBtts = h2h?.bttsRate || 0
        if (combinedBtts > 55 || h2hBtts > 55) {
          const confidence = Math.min(100, (combinedBtts + h2hBtts) / 2)
          signals.push({
            type: 'BOTH_TEAMS_TO_SCORE',
            confidence,
            description: `Alta probabilidade de ambas marcarem — times ${combinedBtts.toFixed(
              1,
            )}% | H2H ${h2hBtts.toFixed(1)}%`,
            status: 'pending',
          })
        }

        // ⏱️ Gol no 1º tempo
        const firstHalfProb =
          (homeHistory.firstHalfGoalRate + awayHistory.firstHalfGoalRate) / 2
        if (firstHalfProb > 55) {
          signals.push({
            type: 'FIRST_HALF_GOAL',
            confidence: firstHalfProb,
            description: `Alta probabilidade de gol no 1º tempo — ${firstHalfProb.toFixed(
              1,
            )}% dos jogos`,
            status: 'pending',
          })
        }

        // 🟨 Cartões
        if (totalAvgCards >= 4.5) {
          signals.push({
            type: 'CARDS_OVER_4_5',
            confidence: Math.min(100, totalAvgCards * 12),
            description: `Alta tendência de cartões — média ${totalAvgCards.toFixed(
              1,
            )}`,
            status: 'pending',
          })
        }

        // 🥅 Escanteios
        if (totalAvgCorners >= 9) {
          signals.push({
            type: 'CORNERS_OVER_8_5',
            confidence: Math.min(100, totalAvgCorners * 10),
            description: `Alta tendência de escanteios — média ${totalAvgCorners.toFixed(
              1,
            )}`,
            status: 'pending',
          })
        }

        // 🏠 Casa/Empate (1X)
        if (homeHistory.homeWinRate >= 60 || awayHistory.awayLossRate >= 60) {
          const confidence =
            homeHistory.homeWinRate * 0.7 + awayHistory.awayLossRate * 0.3
          signals.push({
            type: 'HOME_OR_DRAW',
            confidence,
            description: `Boa consistência mandante — aproveitamento ${homeHistory.homeWinRate.toFixed(
              1,
            )}%`,
            status: 'pending',
          })
        }

        // ✈️ Fora/Empate (X2)
        if (awayHistory.awayWinRate >= 60 || homeHistory.homeLossRate >= 60) {
          const confidence =
            awayHistory.awayWinRate * 0.7 + homeHistory.homeLossRate * 0.3
          signals.push({
            type: 'AWAY_OR_DRAW',
            confidence,
            description: `Boa consistência visitante — aproveitamento ${awayHistory.awayWinRate.toFixed(
              1,
            )}%`,
            status: 'pending',
          })
        }

        // 🚀 Tendência ofensiva
        if (
          homeHistory.offensiveTrend > 70 ||
          awayHistory.offensiveTrend > 70
        ) {
          signals.push({
            type: 'OFFENSIVE_TREND',
            confidence: Math.max(
              homeHistory.offensiveTrend,
              awayHistory.offensiveTrend,
            ),
            description: `Alta tendência ofensiva — média de finalizações e xG elevados`,
            status: 'pending',
          })
        }

        const trendScore = this.calculateTrendScore({
          xg: totalAvgGoals,
          over25Rate,
          h2hOver25,
          corners: totalAvgCorners,
          cards: totalAvgCards,
          signals,
        })

        results.push({
          match: {
            id: match.id,
            league: match.league.name,
            home: match.homeTeam.name,
            away: match.awayTeam.name,
          },
          trendScore,
          stats: {
            avgGoals: totalAvgGoals,
            avgCorners: totalAvgCorners,
            avgCards: totalAvgCards,
          },
          signals,
        })
      } catch (err) {
        console.log(
          `⚠️ Erro ao analisar ${match.homeTeam.name} x ${match.awayTeam.name}:`,
          err instanceof Error ? err.message : err,
        )
      }
    }

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
