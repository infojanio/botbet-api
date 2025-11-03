import { ApiFootballService } from '../services/external-api/api-football-service'

/**
 * Analisa histórico real de times por NOME (sem simulações).
 * Requer que a API externa retorne partidas finalizadas contendo placar.
 */
export class AnalyzeMatchHistoryUseCase {
  private api: ApiFootballService

  constructor() {
    this.api = new ApiFootballService()
  }

  /**
   * Analisa as últimas partidas de um time pelo NOME do time.
   * Retorna somente métricas derivadas de dados realmente existentes
   * (placares finais). Não inventa/estima escanteios, cartões ou 1º tempo.
   */
  async executeByName(
    teamName: string,
    opts?: { limit?: number; minGames?: number },
  ) {
    const limit = opts?.limit ?? 10
    const minGames = opts?.minGames ?? 3

    if (!teamName || !teamName.trim()) return null

    // 🔎 Busca jogos finalizados envolvendo o time pelo nome
    const recent = await this.api.getRecentMatches(teamName, limit)
    // getRecentMatches já filtra finished e já confere o nome no mapeamento
    if (!recent || recent.length < minGames) {
      console.warn(
        `⚠️ Histórico insuficiente para "${teamName}" (${
          recent?.length ?? 0
        }/${minGames})`,
      )
      return null
    }

    let totalGoals = 0
    let over25Count = 0
    let bttsCount = 0
    let wins = 0
    let losses = 0
    let draws = 0
    let homeWins = 0
    let awayWins = 0
    let homeLosses = 0
    let awayLosses = 0

    // Nota: o shape vindo de getRecentMatches():
    // { id, league, date, homeTeam, awayTeam, homeScore, awayScore }
    for (const m of recent) {
      const home = (m as any).homeTeam
      const away = (m as any).awayTeam
      const hg = Number((m as any).homeScore ?? 0)
      const ag = Number((m as any).awayScore ?? 0)
      const total = hg + ag

      totalGoals += total
      if (total >= 3) over25Count++
      if (hg > 0 && ag > 0) bttsCount++

      // Resultado do ponto de vista do time analisado
      const isHome =
        typeof home === 'string'
          ? home.toLowerCase() === teamName.toLowerCase()
          : false

      const teamGoals = isHome ? hg : ag
      const oppGoals = isHome ? ag : hg

      if (teamGoals > oppGoals) {
        wins++
        if (isHome) homeWins++
        else awayWins++
      } else if (teamGoals < oppGoals) {
        losses++
        if (isHome) homeLosses++
        else awayLosses++
      } else {
        draws++
      }

      // ⚠️ Campos como escanteios, cartões e gols no 1º tempo NÃO estão presentes
      // aqui — não simulamos. Se quiser enriquecer:
      // const stats = await this.api.getMatchStatistics(m.id)
      // ... extrair "corners", "yellow_cards"/"red_cards" e acumular
      // (cuidado com limite de rate da API)
    }

    const games = recent.length
    const avgGoals = totalGoals / games
    const over25Rate = (over25Count / games) * 100
    const bttsRate = (bttsCount / games) * 100

    const winRate = (wins / games) * 100
    const lossRate = (losses / games) * 100
    const homeWinRate = (homeWins / games) * 100
    const awayWinRate = (awayWins / games) * 100
    const homeLossRate = (homeLosses / games) * 100
    const awayLossRate = (awayLosses / games) * 100

    // Tendência ofensiva sem simulação: baseada no que existe (gols + BTTS + over25)
    const offensiveTrend = Math.min(
      100,
      avgGoals * 20 + bttsRate * 0.3 + over25Rate * 0.4,
    )

    return {
      team: teamName,
      games,
      avgGoals,
      over25Rate,
      bttsRate,
      winRate,
      lossRate,
      homeWinRate,
      awayWinRate,
      homeLossRate,
      awayLossRate,
      offensiveTrend,

      // Campos intencionalmente omitidos por não existirem nesses endpoints:
      // avgCorners: undefined,
      // avgCards: undefined,
      // firstHalfGoalRate: undefined,
    }
  }

  /**
   * Confrontos diretos por NOME dos times.
   * Usa somente placar final para métricas (sem simulações).
   */
  async getHeadToHeadByName(
    homeTeamName: string,
    awayTeamName: string,
    limit = 5,
  ) {
    if (!homeTeamName || !awayTeamName) return null

    const h2h = await this.api.getHeadToHead(homeTeamName, awayTeamName, limit)
    if (!h2h || h2h.length === 0) {
      console.warn(
        `⚠️ Nenhum H2H encontrado entre "${homeTeamName}" e "${awayTeamName}"`,
      )
      return null
    }

    let totalGoals = 0
    let over25Count = 0
    let bttsCount = 0

    // shape mapeado em ApiFootballService.getHeadToHead():
    // { id, league, date, homeTeam, awayTeam, homeScore, awayScore }
    for (const m of h2h) {
      const hg = Number((m as any).homeScore ?? 0)
      const ag = Number((m as any).awayScore ?? 0)
      const total = hg + ag

      totalGoals += total
      if (total >= 3) over25Count++
      if (hg > 0 && ag > 0) bttsCount++
    }

    const games = h2h.length
    return {
      games,
      avgGoals: totalGoals / games,
      over25Rate: (over25Count / games) * 100,
      bttsRate: (bttsCount / games) * 100,
    }
  }
}
