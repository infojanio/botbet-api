import fetch from 'node-fetch'
import { prisma } from '../../lib/prisma'

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

  // 🔹 Busca todas as ligas disponíveis
  async getAllLeagues() {
    try {
      const res = await this.getJson('/football-get-all-leagues')

      if (!res?.response?.leagues || !Array.isArray(res.response.leagues)) {
        console.warn('⚠️ Estrutura inesperada em getAllLeagues:', res)
        return []
      }

      const leagues = res.response.leagues.map((l: any) => ({
        id: Number(l.leagueId || l.id || l.ID),
        name: l.leagueName || l.name || 'Desconhecida',
        country: l.countryName || l.country || 'N/A',
      }))

      console.log(`✅ ${leagues.length} ligas carregadas com sucesso.`)
      return leagues
    } catch (err) {
      console.error('❌ Erro ao buscar todas as ligas:', (err as Error).message)
      return []
    }
  }

  async getMatchesByDate(date: string) {
    return this.getJson(`/football-matches?date=${date}`)
  }

  async getMatchStats(matchId: string) {
    return this.getJson(`/football-statistics?match_id=${matchId}`)
  }

  async getMatchEventStats(matchId: string) {
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

  /** 🆕 Obter últimas 5 partidas de um time (a partir de todas da liga) */
  async getTeamLastMatches(teamId: number, leagueId: number) {
    const matches = await this.getMatchesByLeague(leagueId)
    const teamMatches = matches.filter(
      (m: any) => m.home?.id == teamId || m.away?.id == teamId,
    )
    return teamMatches.slice(0, 5)
  }

  /**
   * 🔹 Obtém estatísticas detalhadas e reais de uma partida (xG, cartões, escanteios, etc.)
   * Endpoint: /football-get-match-event-all-stats?eventid={id}
   */
  async getMatchStatistics(matchId: number | string) {
    if (!matchId) {
      console.warn('⚠️ getMatchStatistics chamado sem matchId válido')
      return null
    }

    const endpoint = `/football-get-match-event-all-stats?eventid=${matchId}`

    try {
      const response = await this.getJson(endpoint)

      // 🚫 Caso a API retorne falha
      if (response?.status === 'failed') {
        console.warn(`🚫 Estatísticas indisponíveis para matchId=${matchId}`)
        return null
      }

      // ✅ Estrutura esperada
      if (
        response?.status === 'success' &&
        Array.isArray(response?.response?.stats)
      ) {
        const statsGroups = response.response.stats
        const extracted = this.extractCoreStats(statsGroups)
        return {
          status: 'success',
          response: {
            stats: statsGroups,
            summary: extracted,
          },
        }
      }

      // ⚠️ Estrutura inesperada
      console.warn(`⚠️ Estrutura inesperada em getMatchStatistics:`, response)
      return null
    } catch (err) {
      console.error(
        `❌ Erro ao obter estatísticas da partida ${matchId}:`,
        (err as Error).message,
      )
      return null
    }
  }

  /**
   * 🧠 Extrai dados principais de escanteios e cartões do objeto completo da API
   */
  private extractCoreStats(
    statsGroups: any[],
  ): {
    corners: number
    yellowCards: number
    redCards: number
    cards: number
  } {
    let corners = 0
    let yellowCards = 0
    let redCards = 0

    for (const group of statsGroups) {
      if (!Array.isArray(group.stats)) continue

      for (const s of group.stats) {
        const key = (s.key || '').toLowerCase()

        // 🟨 Cartões amarelos
        if (key.includes('yellow_cards')) {
          const values = this.getValuesAsNumbers(s.stats)
          yellowCards += values[0] + values[1]
        }

        // 🟥 Cartões vermelhos
        if (key.includes('red_cards')) {
          const values = this.getValuesAsNumbers(s.stats)
          redCards += values[0] + values[1]
        }

        // 🥅 Escanteios
        if (key.includes('corner')) {
          const values = this.getValuesAsNumbers(s.stats)
          corners += values[0] + values[1]
        }
      }
    }

    const cards = yellowCards + redCards
    return { corners, yellowCards, redCards, cards }
  }

  /** 🔢 Converte um array da API ([home, away]) em números */
  private getValuesAsNumbers(values: any[]): number[] {
    if (!Array.isArray(values)) return [0, 0]
    return values.map((v) => (isNaN(Number(v)) ? 0 : Number(v)))
  }

  // ✅ helper: normaliza data (pode vir como string ISO ou timeTS)
  private parseDate(m: any): Date {
    const iso = m?.status?.utcTime || m?.time || m?.utcTime
    if (iso) {
      const d = new Date(iso)
      if (!Number.isNaN(d.getTime())) return d
    }
    if (m?.timeTS) {
      const d = new Date(Number(m.timeTS))
      if (!Number.isNaN(d.getTime())) return d
    }
    return new Date(0) // fallback
  }

  // ✅ helper: normaliza um registro de partida do endpoint
  private normalizeMatch(raw: any) {
    return {
      id: Number(raw?.id ?? raw?.eventid ?? raw?.matchId ?? 0),
      date: this.parseDate(raw),
      finished:
        !!raw?.status?.finished ||
        raw?.status?.reason?.short === 'FT' ||
        raw?.status?.long === 'Full-Time',
      status: {
        ...raw?.status,
        short: raw?.status?.reason?.short || raw?.status?.short || '',
      },
      home: {
        id: Number(raw?.home?.id ?? raw?.homeTeamId ?? raw?.homeTeam?.id ?? 0),
        name: raw?.home?.name ?? raw?.homeTeam?.name ?? '',
        score: Number(raw?.home?.score ?? raw?.goals?.home ?? 0),
      },
      away: {
        id: Number(raw?.away?.id ?? raw?.awayTeamId ?? raw?.awayTeam?.id ?? 0),
        name: raw?.away?.name ?? raw?.awayTeam?.name ?? '',
        score: Number(raw?.away?.score ?? raw?.goals?.away ?? 0),
      },
      goals: {
        home: Number(raw?.home?.score ?? raw?.goals?.home ?? 0),
        away: Number(raw?.away?.score ?? raw?.goals?.away ?? 0),
      },
    }
  }

  // 🔍 Busca confrontos por nome (fallback para times sem ID)
  async getHeadToHeadByName(homeName: string, awayName: string) {
    const data = await this.getJson(
      `/football-matches-search?home_name=${encodeURIComponent(
        homeName,
      )}&away_name=${encodeURIComponent(awayName)}`,
    )
    if (!data || data.status === 'failed') return null
    return data.response || []
  }

  // 📊 Estatísticas médias do time (fallback para escanteios e cartões)
  async getAverageTeamStats(teamId: number, limit = 5) {
    try {
      const recent = await this.getRecentMatches(String(teamId), limit)
      const finished = recent.filter((m: any) => m.status === 'finished')

      let totalCorners = 0
      let totalCards = 0
      let totalFirstHalfGoals = 0
      let count = 0

      for (const match of finished) {
        const stats = await this.getMatchStatistics(match.id)
        if (!stats?.response?.stats) continue

        const matchStats = stats.response.stats

        const corners = matchStats.find((s: any) => s.key === 'corners')?.stats
        const cardsYellow = matchStats.find(
          (s: any) => s.key === 'yellow_cards',
        )?.stats
        const cardsRed = matchStats.find((s: any) => s.key === 'red_cards')
          ?.stats
        const goalsFirstHalf = matchStats.find(
          (s: any) => s.key === 'first_half_goals',
        )?.stats

        if (corners) totalCorners += corners[0] + corners[1]
        if (cardsYellow) totalCards += cardsYellow[0] + cardsYellow[1]
        if (cardsRed) totalCards += cardsRed[0] + cardsRed[1]
        if (goalsFirstHalf)
          totalFirstHalfGoals += goalsFirstHalf[0] + goalsFirstHalf[1]

        count++
      }

      if (count === 0) return null

      return {
        avgCorners: totalCorners / count,
        avgCards: totalCards / count,
        firstHalfGoalRate: (totalFirstHalfGoals / count) * 100,
      }
    } catch (err) {
      console.warn(`⚠️ Falha ao calcular médias do time ${teamId}:`, err)
      return null
    }
  }

  // 🧠 Probabilidades de vitória, empate ou derrota (se disponível no plano)
  async getMatchOdds(matchId: number) {
    const data = await this.getJson(`/football-match-odds?match_id=${matchId}`)
    if (!data || data.status === 'failed') return null

    const home = data.response?.home_win_prob ?? 0
    const draw = data.response?.draw_prob ?? 0
    const away = data.response?.away_win_prob ?? 0

    return { home, draw, away }
  }

  // ⚡ Partidas ao vivo (para viradas ou gols precoces)
  async getLiveMatches() {
    const data = await this.getJson(`/football-live-matches`)
    if (!data || data.status === 'failed') return []
    return data.response || []
  }

  /**
   * 🔹 Busca os últimos jogos (finalizados) de um time pelo nome
   */
  async getRecentMatches(teamName: string, limit = 5) {
    try {
      const query = encodeURIComponent(teamName)
      const res = await this.getJson(`/football-matches-search?search=${query}`)
      const suggestions = res?.response?.suggestions || []

      // 🔹 Filtra apenas os jogos finalizados
      const finished = suggestions
        .filter((m: any) => m.status?.finished)
        .filter(
          (m: any) =>
            m.homeTeamName?.toLowerCase().includes(teamName.toLowerCase()) ||
            m.awayTeamName?.toLowerCase().includes(teamName.toLowerCase()),
        )
        .map((m: any) => ({
          id: Number(m.id),
          league: m.leagueName,
          date: new Date(m.matchDate),
          homeTeam: m.homeTeamName,
          awayTeam: m.awayTeamName,
          homeScore: m.homeTeamScore ?? 0,
          awayScore: m.awayTeamScore ?? 0,
        }))
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())

      return finished.slice(0, limit)
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar partidas de ${teamName}:`, error)
      return []
    }
  }

  // ⚽ Informações gerais da partida
  async getMatchDetails(matchId: number) {
    const data = await this.getJson(`/football-match-info?match_id=${matchId}`)
    if (!data || data.status === 'failed') return null
    return data
  }

  // 📅 Partidas agendadas (futuras)
  async getUpcomingMatches(leagueId: string, season: number, limit = 30) {
    return this.getJson(
      `/football-league-matches?league_id=${leagueId}&season=${season}&status=scheduled&limit=${limit}`,
    )
  }

  /**
   * 🔹 Confrontos diretos (head-to-head)
   */
  async getHeadToHead(homeTeamName: string, awayTeamName: string, limit = 10) {
    const query = encodeURIComponent(homeTeamName)
    const res = await this.getJson(`/football-matches-search?search=${query}`)
    const suggestions = res?.response?.suggestions || []

    const h2h = suggestions
      .filter(
        (m: any) =>
          m.status?.finished &&
          ((m.homeTeamName?.toLowerCase() === homeTeamName.toLowerCase() &&
            m.awayTeamName?.toLowerCase() === awayTeamName.toLowerCase()) ||
            (m.homeTeamName?.toLowerCase() === awayTeamName.toLowerCase() &&
              m.awayTeamName?.toLowerCase() === homeTeamName.toLowerCase())),
      )
      .map((m: any) => ({
        id: Number(m.id),
        league: m.leagueName,
        date: new Date(m.matchDate),
        homeTeam: m.homeTeamName,
        awayTeam: m.awayTeamName,
        homeScore: m.homeTeamScore ?? 0,
        awayScore: m.awayTeamScore ?? 0,
      }))
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())

    return h2h.slice(0, limit)
  }
}
