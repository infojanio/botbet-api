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

  /** 🆕 Obter últimas 5 partidas de um time (a partir de todas da liga) */
  async getTeamLastMatches(teamId: number, leagueId: number) {
    const matches = await this.getMatchesByLeague(leagueId)
    const teamMatches = matches.filter(
      (m: any) => m.home?.id == teamId || m.away?.id == teamId,
    )
    return teamMatches.slice(0, 5)
  }

  /**
   * 🔹 Obtém todas as estatísticas detalhadas de uma partida
   * Endpoint: /football-get-match-all-stats?eventid={id}
   */
  async getMatchStatistics(matchId: number | string) {
    if (!matchId) {
      console.warn('⚠️ getMatchStatistics chamado sem matchId válido')
      return null
    }

    const endpoint = `/football-get-match-all-stats?eventid=${matchId}`

    try {
      const response = await this.getJson(endpoint)

      if (response?.status === 'success' && response?.response?.stats) {
        // Normaliza estrutura para facilitar o uso no use-case
        return {
          status: 'success',
          response: {
            stats: response.response.stats.map((group: any) => ({
              title: group.title,
              key: group.key,
              stats: Array.isArray(group.stats)
                ? group.stats.map((s: any) => ({
                    title: s.title,
                    key: s.key,
                    stats: s.stats,
                    format: s.format,
                    type: s.type,
                  }))
                : [],
            })),
          },
        }
      } else {
        console.warn(
          `⚠️ Nenhuma estatística encontrada para matchId=${matchId}`,
        )
        return null
      }
    } catch (err) {
      if (err instanceof Error)
        console.error(
          `❌ Erro ao obter estatísticas do jogo ${matchId}:`,
          err.message,
        )
      return null
    }
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

  /**
   * 🔹 Confrontos diretos (head-to-head)
   */
  async getHeadToHead(homeTeamName: string, awayTeamName: string, limit = 5) {
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
