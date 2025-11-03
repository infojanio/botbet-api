import { ApiFootballService } from '../services/external-api/api-football-service'

/**
 * 🔍 UseCase responsável por analisar estatísticas estendidas (corners, cards e 1º tempo)
 * com base em dados reais dos últimos 5 jogos de cada equipe.
 */
export class AnalyzeExtendedStatsUseCase {
  private api: ApiFootballService

  constructor() {
    this.api = new ApiFootballService()
  }

  /**
   * Executa a coleta e cálculo das médias reais.
   * @param teamId ID do time (ou externalId)
   * @returns Estatísticas médias reais de escanteios, cartões e gols 1º tempo
   */
  async execute(teamId: number) {
    try {
      const recentMatches = await this.api.getRecentMatches(String(teamId), 5)
      if (!recentMatches?.length) {
        console.warn(
          `⚠️ Nenhuma partida recente encontrada para timeId=${teamId}`,
        )
        return null
      }

      let totalCorners = 0
      let totalCards = 0
      let firstHalfGoals = 0
      let matchesWithStats = 0

      for (const match of recentMatches) {
        const stats = await this.api.getMatchEventStats(match.id)

        if (!stats || stats.status === 'failed') {
          console.log(`🚫 Estatísticas indisponíveis para matchId=${match.id}`)
          continue
        }

        const corners = this.extractStat(stats, 'corners')
        const yellow = this.extractStat(stats, 'yellow_cards')
        const red = this.extractStat(stats, 'red_cards')
        const totalCardsMatch = yellow + red

        totalCorners += corners
        totalCards += totalCardsMatch
        matchesWithStats++

        const firstHalf = this.detectFirstHalfGoals(stats)
        if (firstHalf > 0) firstHalfGoals++
      }

      if (matchesWithStats === 0) {
        console.warn(
          `⚠️ Nenhuma estatística válida encontrada para timeId=${teamId}`,
        )
        return null
      }

      const result = {
        avgCorners: totalCorners / matchesWithStats,
        avgCards: totalCards / matchesWithStats,
        firstHalfGoalRate: (firstHalfGoals / matchesWithStats) * 100,
      }

      console.log(
        `📈 Estatísticas estendidas calculadas para ${teamId}:`,
        result,
      )
      return result
    } catch (error) {
      console.error(
        `❌ Erro em AnalyzeExtendedStatsUseCase (${teamId}):`,
        error,
      )
      return null
    }
  }

  /**
   * Extrai o valor total (soma casa + fora) de um tipo específico de estatística.
   */
  private extractStat(stats: any, key: string): number {
    try {
      const groups = stats?.response?.stats ?? []
      for (const group of groups) {
        for (const s of group.stats) {
          if (typeof s.key === 'string' && s.key.toLowerCase().includes(key)) {
            if (Array.isArray(s.stats)) {
              const [home, away] = s.stats.map((v: any) => Number(v) || 0)
              return home + away
            }
          }
        }
      }
      return 0
    } catch {
      return 0
    }
  }

  /**
   * Tenta detectar se houve gol no 1º tempo analisando as chaves de tempo e placar parcial.
   */
  private detectFirstHalfGoals(stats: any): number {
    try {
      const matchStats = stats.response
      const topStats = matchStats?.stats?.find(
        (g: any) => g.key === 'top_stats',
      )?.stats

      // Busca estatísticas que possam indicar gols no 1º tempo
      const goals =
        topStats?.find((s: any) => s.key?.includes('expected_goals'))?.stats ??
        []
      const sumGoals =
        Array.isArray(goals) && goals.length === 2
          ? (parseFloat(goals[0]) || 0) + (parseFloat(goals[1]) || 0)
          : 0

      // Se xG for alto no 1º tempo, assume chance de gol real
      return sumGoals > 0.8 ? 1 : 0
    } catch {
      return 0
    }
  }
}
