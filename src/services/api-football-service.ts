import fetch from 'node-fetch'
import { IExternalApiService } from '../repositories/interfaces/IExternalApiService'

// 🔹 Configurações do ambiente

const API_KEY = process.env.API_KEY!
const API_HOST =
  process.env.API_HOST || 'free-api-live-football-data.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}`

async function getJson(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}/${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, val),
    )
  }

  const res = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST,
    },
  })

  const text = await res.text()
  if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)

  const data = JSON.parse(text)
  return data.response || data.data || data
}

// 🔹 Serviço adaptado para a RapidAPI
export class ApiFootballService implements IExternalApiService {
  constructor() {
    console.log(`⚙️ Usando RapidAPI: ${BASE_URL}`)
  }

  // ✅ Buscar partidas por data
  async getFixturesByDate(date: string, leagueId?: string) {
    const cleanDate = date.replace(/\D/g, '')
    const endpoint = leagueId
      ? 'football-get-matches-by-date-and-league'
      : 'football-get-matches-by-date'

    const url = new URL(`https://${API_HOST}/${endpoint}`)
    url.searchParams.append('date', cleanDate)
    if (leagueId) url.searchParams.append('league_id', leagueId)

    console.log(`🔎 [RapidAPI] Buscando jogos: ${url.toString()}`)

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    })

    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)

    const data = JSON.parse(text)
    const list = data.response || data.data || []

    console.log(`📅 ${list.length} jogos encontrados na RapidAPI`)

    // 🔹 Normaliza o formato para o padrão usado no projeto
    return list.map((m: any) => ({
      event_id: m.event_key ?? m.event_id ?? m.id,
      date: m.match_start ?? m.date ?? m.start_time,
      league_name: m.league_name ?? m.league?.name ?? 'Unknown',
      home_name: m.home_name ?? m.home_team ?? m.home?.name ?? 'Desconhecido',
      away_name: m.away_name ?? m.away_team ?? m.away?.name ?? 'Desconhecido',
      status: m.status ?? 'SCHEDULED',
    }))
  }

  // ✅ Buscar jogos ao vivo
  async getLiveMatches() {
    const data = await getJson('livescores')
    return data
  }

  // ✅ Buscar competições
  async getAllCompetitions() {
    return getJson('leagues')
  }

  // ✅ Buscar detalhes de uma partida
  async getMatchDetails(eventId: number) {
    return getJson('events', { event_id: String(eventId) })
  }

  // ✅ Buscar estatísticas do jogo
  async getMatchStats(eventId: number) {
    return getJson('statistics', { event_id: String(eventId) })
  }

  // ✅ Buscar odds (disponível no plano free)
  async getOdds(eventId: number) {
    if (!eventId) {
      console.warn('⚠️ Event ID ausente, pulando busca de odds')
      return []
    }

    const endpoint = 'football-event-odds'
    const url = `https://${API_HOST}/${endpoint}?eventid=${eventId}&countrycode=BR`

    console.log(`💰 [RapidAPI] Buscando odds: ${url}`)

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    })

    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)

    const data = JSON.parse(text)

    // ✅ Normaliza o formato retornado (de acordo com seu exemplo)
    const odds =
      data.response?.odds?.odds?.resolvedOddsMarket?.selections ??
      data.odds?.odds?.resolvedOddsMarket?.selections ??
      []

    if (!odds.length) {
      console.warn('⚠️ Nenhuma odd retornada para o evento', eventId)
      return []
    }

    return odds.map((o: any) => ({
      name: o.name,
      odd: parseFloat(o.oddsDecimal),
      link: o.link,
    }))
  }

  /**
   * 🔍 Busca time por nome (para obter o ID)
   */
  async searchTeamByName(name: string) {
    const url = `https://free-api-live-football-data.p.rapidapi.com/football-teams-search?search=${encodeURIComponent(
      name,
    )}`

    console.log(`🔎 [RapidAPI] Buscando ID do time: ${url}`)

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': process.env.API_KEY!,
        'x-rapidapi-host': process.env.API_HOST!,
      },
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Erro API ${res.status}: ${err}`)
    }

    const data = await res.json()
    return data.response?.[0] || data.teams?.[0] || null
  }

  /**
   * 📈 Retorna últimos jogos (últimos 5 eventos finalizados)
   */
  async getRecentMatches(teamId: number, limit: number = 5) {
    const url = `https://free-api-live-football-data.p.rapidapi.com/football-team-matches?team_id=${teamId}`
    console.log(`📊 [RapidAPI] Histórico do time ${teamId}: ${url}`)

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': process.env.API_KEY!,
        'x-rapidapi-host': process.env.API_HOST!,
      },
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Erro API ${res.status}: ${err}`)
    }

    const data = await res.json()
    const matches = data.response || data.matches || []

    // Retorna apenas os últimos "limit" jogos finalizados
    return matches
      .filter((m: any) => m.status === 'FT' || m.status === 'Match Finished')
      .slice(-limit)
  }

  // Mantém compatibilidade com chamadas antigas
  async getUpcomingMatches(leagueId?: string, season?: number, limit?: number) {
    const today = new Date().toISOString().split('T')[0]
    return this.getFixturesByDate(today, leagueId)
  }

  async getHeadToHead(homeId: number, awayId: number) {
    return getJson('head-to-head', {
      home_id: String(homeId),
      away_id: String(awayId),
    })
  }
}
