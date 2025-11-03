import { AnalyzeMatchHistoryUseCase } from './analyze-match-history-use-case'
import { AnalyzeExtendedStatsUseCase } from './analyze-extended-stats-use-case'
import { ApiFootballService } from '../services/external-api/api-football-service'
import { IMatchRepository } from '../repositories/interfaces/IMatchRepository'

export class GetUpcomingMatchesAnalysisUseCase {
  constructor(
    private api: ApiFootballService,
    private matchRepository: IMatchRepository,
  ) {}

  async execute(fromDate?: Date) {
    console.log('🚀 Iniciando análise de partidas futuras com dados reais...')
    const historyAnalyzer = new AnalyzeMatchHistoryUseCase()
    const extendedAnalyzer = new AnalyzeExtendedStatsUseCase()

    // 🔹 Busca as partidas futuras do banco
    const matches = fromDate
      ? await this.matchRepository.findByDate(fromDate)
      : await this.matchRepository.findUpcoming()

    if (!matches.length) {
      console.log('⚠️ Nenhuma partida encontrada para análise.')
      return []
    }

    const results = []

    for (const match of matches) {
      const home = match.homeTeam.name
      const away = match.awayTeam.name
      const homeId = Number(match.homeTeam.externalId ?? match.homeTeam.id)
      const awayId = Number(match.awayTeam.externalId ?? match.awayTeam.id)

      console.log(`\n⚽ Analisando ${home} x ${away} (${match.league.name})...`)

      try {
        // 📊 Histórico de gols e confrontos diretos
        const homeHistory = await historyAnalyzer.executeByName(home)
        const awayHistory = await historyAnalyzer.executeByName(away)
        const h2h = await historyAnalyzer.getHeadToHeadByName(home, away)

        if (!homeHistory && !awayHistory) {
          console.warn(
            `⚠️ Nenhum dado de histórico real encontrado para ${home} x ${away}`,
          )
          continue
        }

        // 📈 Estatísticas estendidas reais (escanteios, cartões e 1º tempo)
        const extendedHome = await extendedAnalyzer.execute(homeId)
        const extendedAway = await extendedAnalyzer.execute(awayId)

        const avgCorners =
          ((extendedHome?.avgCorners ?? 0) + (extendedAway?.avgCorners ?? 0)) /
          2
        const avgCards =
          ((extendedHome?.avgCards ?? 0) + (extendedAway?.avgCards ?? 0)) / 2
        const firstHalfGoalRate =
          ((extendedHome?.firstHalfGoalRate ?? 0) +
            (extendedAway?.firstHalfGoalRate ?? 0)) /
          2

        // ⚽ Dados reais de gols
        const avgGoals =
          ((homeHistory?.avgGoals ?? 0) + (awayHistory?.avgGoals ?? 0)) / 2
        const over25Rate =
          ((homeHistory?.over25Rate ?? 0) + (awayHistory?.over25Rate ?? 0)) / 2
        const bttsRate =
          ((homeHistory?.bttsRate ?? 0) + (awayHistory?.bttsRate ?? 0)) / 2

        const h2hOver25 = h2h?.over25Rate ?? 0
        const h2hBTTS = h2h?.bttsRate ?? 0

        const stats = {
          avgGoals,
          avgCorners,
          avgCards,
          firstHalfGoalRate,
        }

        const signals: any[] = []

        // ⚽ +2.5 GOLS — média real
        if (avgGoals >= 2.2 || over25Rate > 55 || h2hOver25 > 55) {
          signals.push({
            type: 'GOLS_OVER_2_5',
            confidence: Math.min(
              100,
              (over25Rate + h2hOver25) / 2 + avgGoals * 10,
            ),
            description: `Alta probabilidade real de +2.5 gols — média ${avgGoals.toFixed(
              1,
            )} | over25 ${over25Rate.toFixed(1)}% | H2H ${h2hOver25.toFixed(
              1,
            )}%`,
            status: 'pending',
          })
        }

        // 🤝 Ambas marcam (BTTS)
        if (bttsRate > 50 || h2hBTTS > 55) {
          signals.push({
            type: 'BOTH_TEAMS_TO_SCORE',
            confidence: Math.min(100, (bttsRate + h2hBTTS) / 2),
            description: `Probabilidade real de ambas marcarem (${bttsRate.toFixed(
              1,
            )}%)`,
            status: 'pending',
          })
        }

        // 🟨 Cartões (dados reais)
        if (avgCards >= 4.5) {
          signals.push({
            type: 'CARDS_OVER_4_5',
            confidence: Math.min(100, avgCards * 12),
            description: `Alta tendência real de cartões — média ${avgCards.toFixed(
              1,
            )}`,
            status: 'pending',
          })
        }

        // 🥅 Escanteios (dados reais)
        if (avgCorners >= 9) {
          signals.push({
            type: 'CORNERS_OVER_8_5',
            confidence: Math.min(100, avgCorners * 10),
            description: `Alta tendência real de escanteios — média ${avgCorners.toFixed(
              1,
            )}`,
            status: 'pending',
          })
        }

        // ⏱️ Gol no 1º tempo (dados reais)
        if (firstHalfGoalRate >= 55) {
          signals.push({
            type: 'FIRST_HALF_GOAL',
            confidence: firstHalfGoalRate,
            description: `Alta chance de gol no 1º tempo — ${firstHalfGoalRate.toFixed(
              1,
            )}% dos jogos com gol antes do intervalo`,
            status: 'pending',
          })
        }

        // 🚀 Tendência ofensiva
        if (
          (homeHistory?.offensiveTrend ?? 0) > 70 ||
          (awayHistory?.offensiveTrend ?? 0) > 70
        ) {
          signals.push({
            type: 'OFFENSIVE_TREND',
            confidence: Math.max(
              homeHistory?.offensiveTrend ?? 0,
              awayHistory?.offensiveTrend ?? 0,
            ),
            description: `Alta tendência ofensiva real — volume elevado de gols e xG.`,
            status: 'pending',
          })
        }

        // 📊 Cálculo do score de tendência
        const trendScore = Math.min(
          100,
          avgGoals * 10 +
            over25Rate * 0.3 +
            bttsRate * 0.3 +
            avgCorners * 0.4 +
            avgCards * 0.3 +
            firstHalfGoalRate * 0.2 +
            (signals.length > 0 ? 5 : 0),
        )

        console.log(
          `✅ ${home} x ${away} — ${signals.length} sinais reais gerados.`,
        )

        results.push({
          match: {
            id: match.id,
            league: match.league.name,
            home,
            away,
          },
          trendScore,
          stats,
          signals,
        })
      } catch (error) {
        console.error(
          `❌ Erro ao analisar ${home} x ${away}:`,
          error instanceof Error ? error.message : error,
        )
      }
    }

    console.log(`🏁 Análise concluída. ${results.length} partidas válidas.`)
    return results.sort((a, b) => b.trendScore - a.trendScore)
  }
}
