import fetch from 'node-fetch'

export class ApiFootballService {
  private baseUrl = 'https://free-api-live-football-data.p.rapidapi.com'
  private apiKey = process.env.API_KEY!
  private apiHost = process.env.API_HOST!

  private async getJson(endpoint: string) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': this.apiHost,
      },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`API error ${res.status}: ${text}`)
    }
    return res.json()
  }

  async getPopularLeagues() {
    const res = await this.getJson('/football-popular-leagues')

    if (Array.isArray(res)) return res
    if (Array.isArray(res.data)) return res.data
    if (Array.isArray(res.response)) return res.response
    if (Array.isArray(res.response?.popular)) return res.response.popular

    console.warn('⚠️ Estrutura inesperada de ligas recebida:', res)
    return []
  }

  async getMatchesByDate(date: string) {
    return this.getJson(`/football-matches?date=${date}`)
  }

  async getMatchStats(matchId: string) {
    return this.getJson(`/football-statistics?match_id=${matchId}`)
  }

  async getMatchesByLeague(leagueId: number | string) {
    // ✅ Endpoint correto no plano gratuito da Free API Live Football Data
    const data = await this.getJson(
      `/football-get-all-matches-by-league?leagueid=${leagueId}`,
    )

    // Estrutura esperada de resposta
    if (Array.isArray(data.response)) return data.response
    if (Array.isArray(data.data)) return data.data
    if (Array.isArray(data.response?.matches)) return data.response.matches

    console.warn('⚠️ Estrutura inesperada de partidas recebida:', data)
    return []
  }

  async getHeadToHead(homeId: string, awayId: string) {
    return this.getJson(`/football-h2h?home_id=${homeId}&away_id=${awayId}`)
  }
}
