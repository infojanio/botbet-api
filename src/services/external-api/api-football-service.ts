// src/services/external-api/api-football-service.ts
import fetch from 'node-fetch'
import { env } from '../../env'

export class ApiFootballService {
  private baseUrl = 'https://free-api-live-football-data.p.rapidapi.com'
  private headers = {
    'X-RapidAPI-Key': env.API_KEY,
    'X-RapidAPI-Host': env.API_HOST,
  }

  // ✅ Buscar ligas populares
  async getLeagues() {
    return this.getJson('/football-popular-leagues')
  }

  // ✅ Buscar partidas do dia
  async getTodayMatches() {
    const today = new Date().toISOString().split('T')[0]
    return this.getJson(`/football-matches-by-date?date=${today}`)
  }

  // ✅ Buscar partidas ao vivo
  async getLiveMatches() {
    return this.getJson('/football-current-live')
  }

  // ✅ Buscar detalhes de uma partida específica
  async getMatchDetails(matchId: string) {
    return this.getJson(`/football-match-detail?match_id=${matchId}`)
  }

  // ✅ Confrontos diretos (head-to-head)
  async getHeadToHead(homeId: string, awayId: string) {
    return this.getJson(`/football-head-to-head?team1_id=${homeId}&team2_id=${awayId}`)
  }

  // ✅ Últimos jogos de um time
  async getRecentMatches(teamId: string, limit = 5) {
    return this.getJson(`/football-team-last-matches?team_id=${teamId}&limit=${limit}`)
  }

  // ✅ Estatísticas completas de uma partida
  async getMatchStatistics(matchId: string) {
    return this.getJson(`/football-match-statistics?match_id=${matchId}`)
  }

  // 🔹 Função genérica interna
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
