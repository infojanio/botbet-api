// src/repositories/interfaces/IExternalApiService.ts
export interface IExternalApiService {
  /**
   * 🏆 Busca todas as ligas disponíveis
   * GET /football-get-all-leagues
   */
  getAllLeagues(): Promise<any>

  /**
   * ⚽ Busca partidas por data e, opcionalmente, por liga
   * GET /football-get-matches-by-date
   * GET /football-get-matches-by-date-and-league
   */
  getMatchesByDate(date: string, leagueId?: number): Promise<any>

  /**
   * 🔴 Busca partidas em andamento
   * GET /football-current-live
   */
  getCurrentLive(): Promise<any>

  /**
   * 📊 Retorna todas as estatísticas de uma partida
   * GET /football-get-match-all-stats?eventid={id}
   */
  getEventAllStats(eventId: number): Promise<any>

  /**
   * 🧮 Retorna o placar da partida
   * GET /football-get-match-score?eventid={id}
   */
  getEventScore(eventId: number): Promise<any>

  /**
   * ⚔️ Retorna confrontos diretos (head to head)
   * GET /football-get-head-to-head?eventid={id}
   */
  getHeadToHead(eventId: number): Promise<any>

  /**
   * 🧩 Busca dados de um time pelo nome
   * GET /football-teams-search?search={name}
   */
  searchTeamByName(name: string): Promise<any>

  /**
   * 📅 Retorna as últimas partidas de um time
   * GET /football-get-list-all-team?teamid={id}
   */
  getTeamMatches(teamId: number): Promise<any>
}
