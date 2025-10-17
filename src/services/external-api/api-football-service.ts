// src/services/external-api/api-football-service.ts
import fetch from 'node-fetch'
import { env } from '../../env'

import { IExternalApiService } from '../../repositories/interfaces/IExternalApiService'

export class ApiFootballService implements IExternalApiService {
  getUpcomingMatches(leagueId: any, season: number, limit: number): Promise<any[]> {
    throw new Error('Method not implemented.')
  }
  getOdds(fixtureId: number): Promise<any[]> {
    throw new Error('Method not implemented.')
  }
  getLiveOdds(fixtureId: number): Promise<any[]> {
    throw new Error('Method not implemented.')
  }
  getFixturesByDate(date: string): Promise<any[]> {
    throw new Error('Method not implemented.')
  }
  getTeamStatistics(teamid: number ): Promise<any> {
    throw new Error('Method not implemented.')
  }
  private baseUrl = 'https://free-api-live-football-data.p.rapidapi.com'
  private headers = {
    'X-RapidAPI-Key': env.API_KEY,
    'X-RapidAPI-Host': env.API_HOST,
  }

  // 🏆 Ligas populares
  async getLeagues() {
    return this.getJson('/football-popular-leagues')
  }

  // ⚽ Partidas do dia
  async getTodayMatches() {
    const today = new Date().toISOString().split('T')[0]
    return this.getJson(`/football-matches-by-date?date=${today}`)
  }

  // 🔴 Partidas ao vivo
  async getLiveMatches() {
    return this.getJson('/football-current-live')
  }

  // 📋 Detalhes de uma partida
  async getMatchDetails(matchId: number) {
    return this.getJson(`/football-match-detail?match_id=${matchId}`)
  }

  // 🧩 Estatísticas de uma partida
  async getMatchStatistics(matchId: number | number) {
    return this.getJson(`/football-match-statistics?match_id=${matchId}`)
  }

  // 🔙 Confrontos diretos (Head to Head)
async getHeadToHead(homeid: number | number, awayid: number | number) {
  return this.getJson(`/football-head-to-head?team1_id=${homeid}&team2_id=${awayid}`)
}

  // 🧠 Últimos jogos de um time
  async getRecentMatches(teamid: number, limit = 5) {
    return this.getJson(`/football-team-last-matches?team_id=${teamid}&limit=${limit}`)
  }

  // 🏟️ ✅ Times de uma liga

  async getTeamsByLeague(leagueid: number | number) {
  return this.getJson(`/football-teams-by-league?league_id=${leagueid}`)
}

  // 🔹 Função genérica interna para requisições
  private async getJson(endpoint: string) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`API error ${res.status}: ${text}`)
    }

    return res.json()
  }
}
