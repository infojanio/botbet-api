import fetch from 'node-fetch'
import { remove as removeAccents } from 'diacritics'
import { IExternalApiService } from '../repositories/interfaces/IExternalApiService'

// ==========================================================
// 🔹 Configuração
// ==========================================================
const API_KEY =
  process.env.API_KEY || '0cee265affmsh557488f6346f236p126052jsn76a73bb76ced'
const API_HOST =
  process.env.API_HOST || 'free-api-live-football-data.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}`

// ==========================================================
// 🔹 Cache simples (TTL 5min)
// ==========================================================
const cache = new Map<string, { data: any[]; expires: number }>()
function getCache(key: string) {
  const c = cache.get(key)
  if (c && c.expires > Date.now()) {
    console.log(`⚡ Cache HIT → ${key}`)
    return c.data
  }
  if (c) cache.delete(key)
  return null
}
function setCache(key: string, data: any[], ttl = 5 * 60 * 1000) {
  cache.set(key, { data, expires: Date.now() + ttl })
}

// ==========================================================
// 🔹 Serviço principal
// ==========================================================
export class ApiFootballService implements IExternalApiService {
  private baseUrl = BASE_URL

  constructor(
    private apiKey: string = API_KEY,
    private apiHost: string = API_HOST,
  ) {
    console.log(`⚙️ Usando RapidAPI: ${this.apiHost}`)
  }
  getUpcomingMatches(
    leagueId: string,
    season: number,
    limit: number,
  ): Promise<any[]> {
    throw new Error('Method not implemented.')
  }
  getAllCompetitions(): Promise<any[]> {
    throw new Error('Method not implemented.')
  }
  getMatchDetails(fixtureId: number): Promise<any> {
    throw new Error('Method not implemented.')
  }

  // 🔎 Busca jogos por texto (retorna event_id para usar nas rotas de Events)
  async searchMatches(query: string) {
    const url = `${
      this.baseUrl
    }/football-search-matches?query=${encodeURIComponent(query)}`
    console.log(`🔎 [RapidAPI] Search matches: ${url}`)
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    const data = JSON.parse(text)
    // normaliza uma lista de matches com event_id
    const list: any[] =
      data?.response?.matches ||
      data?.response?.results ||
      data?.results ||
      data?.data ||
      []
    return list.map((m: any) => ({
      event_id: m.event_id ?? m.id,
      date: m.match_start ?? m.date ?? m.utcDate,
      league_name: m.league_name ?? m.league?.name,
      home_name: m.home_name ?? m.home_team ?? m.home?.name,
      away_name: m.away_name ?? m.away_team ?? m.away?.name,
      status: m.status ?? m.match_status ?? m.state ?? '',
      home_score: m.home_score ?? m.homeGoals ?? m.goals?.home ?? 0,
      away_score: m.away_score ?? m.awayGoals ?? m.goals?.away ?? 0,
    }))
  }

  // ⚽ Detalhe de um evento por ID
  async getEventDetail(eventId: number | string) {
    const url = `${this.baseUrl}/get-match-event-detail-by-event-id?event_id=${eventId}`
    console.log(`🧾 [RapidAPI] Event detail: ${url}`)
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    return JSON.parse(text)
  }

  // 🧮 Placar do evento
  async getEventScore(eventId: number | string) {
    const url = `${this.baseUrl}/get-match-event-score-by-event-id?event_id=${eventId}`
    console.log(`📈 [RapidAPI] Event score: ${url}`)
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    return JSON.parse(text)
  }

  // 🟢 Status do evento
  async getEventStatus(eventId: number | string) {
    const url = `${this.baseUrl}/get-match-event-status-by-event-id?event_id=${eventId}`
    console.log(`⏱️ [RapidAPI] Event status: ${url}`)
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    return JSON.parse(text)
  }

  // 📊 Estatísticas (todas / 1ºT / 2ºT)
  async getEventAllStats(eventId: number | string) {
    const url = `${this.baseUrl}/get-match-event-all-stats-by-event-id?event_id=${eventId}`
    console.log(`📊 [RapidAPI] Event all stats: ${url}`)
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    return JSON.parse(text)
  }

  async getEventFirstHalfStats(eventId: number | string) {
    const url = `${this.baseUrl}/get-match-event-firsthalf-stats-by-event-id?event_id=${eventId}`
    console.log(`📊 [RapidAPI] Event 1st-half stats: ${url}`)
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    return JSON.parse(text)
  }

  async getEventSecondHalfStats(eventId: number | string) {
    const url = `${this.baseUrl}/get-match-event-secondhalf-stats-by-event-id?event_id=${eventId}`
    console.log(`📊 [RapidAPI] Event 2nd-half stats: ${url}`)
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    return JSON.parse(text)
  }

  // ----------------------------------------------------------
  // ✅ Buscar time por nome (com variações automáticas e fallback seguro)
  // ----------------------------------------------------------
  async searchTeamByName(name: string) {
    const cleanName = removeAccents(name.trim()).replace(/\s+/g, ' ')
    const variations = [
      cleanName,
      cleanName.toUpperCase(),
      cleanName.toLowerCase(),
      cleanName.replace('FC', '').trim(),
    ]

    for (const query of variations) {
      const url = `${
        this.baseUrl
      }/football-teams-search?search=${encodeURIComponent(query)}`
      console.log(`🔎 [RapidAPI] Buscando ID do time: ${url}`)

      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': this.apiKey!,
          'x-rapidapi-host': this.apiHost!,
        },
      })

      const text = await res.text()
      if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)

      const data = JSON.parse(text)

      // ✅ Formato correto de retorno conforme seu exemplo real:
      // {
      //   "status": "success",
      //   "response": {
      //     "suggestions": [
      //       { "type": "team", "id": "10283", "name": "Palmeiras", "leagueId": 268, "leagueName": "Serie A" }
      //     ]
      //   }
      // }

      const suggestions = data?.response?.suggestions || []
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        const team = suggestions.find((s: any) => s.type === 'team')
        if (team) {
          console.log(`✅ Time encontrado: ${team.name} (ID: ${team.id})`)
          return {
            team_id: team.id,
            team_name: team.name,
            league_id: team.leagueId,
            league_name: team.leagueName,
          }
        }
      }
    }

    throw new Error(`❌ Não foi possível encontrar o time ${name} na API.`)
  }

  // ----------------------------------------------------------
  // ✅ Buscar partidas por data
  // ----------------------------------------------------------
  async getFixturesByDate(date: string, leagueId?: string) {
    const cleanDate = date.replace(/\D/g, '')
    const endpoint = leagueId
      ? 'get-league-matches-by-date'
      : 'get-matches-by-date'

    const url = new URL(`${this.baseUrl}/${endpoint}`)
    url.searchParams.append('date', cleanDate)
    if (leagueId) url.searchParams.append('league_id', leagueId)

    console.log(`📅 [RapidAPI] Buscando jogos: ${url}`)

    const res = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })

    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    const data = JSON.parse(text)
    const list = data.response || data.data || []

    return list.map((m: any) => ({
      event_id: m.event_id ?? m.id,
      date: m.match_date ?? m.date ?? m.start_time,
      league_name: m.league_name ?? 'Desconhecida',
      home_name: m.home_name ?? m.home_team ?? 'Casa',
      away_name: m.away_name ?? m.away_team ?? 'Fora',
      status: m.status ?? 'SCHEDULED',
    }))
  }

  // ----------------------------------------------------------
  // ✅ Buscar odds (endpoint real: /get-odds-match-by-event-id)
  // ----------------------------------------------------------
  async getOdds(eventId: number) {
    if (!eventId) return []
    const url = `${this.baseUrl}/get-odds-match-by-event-id?event_id=${eventId}`
    console.log(`💰 [RapidAPI] Buscando odds: ${url}`)

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })

    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    const data = JSON.parse(text)

    const odds =
      data.response?.odds?.odds?.resolvedOddsMarket?.selections ??
      data.odds?.odds?.resolvedOddsMarket?.selections ??
      []

    if (!odds.length) {
      console.warn(`⚠️ Nenhuma odd retornada para ${eventId}`)
      return []
    }

    return odds.map((o: any) => ({
      name: o.name,
      odd: parseFloat(o.oddsDecimal),
    }))
  }

  // ----------------------------------------------------------
  // ✅ Buscar últimos jogos (histórico)
  // ----------------------------------------------------------
  // ----------------------------------------------------------
  // ✅ Últimos jogos do time via busca textual (sem endpoints por time/por liga)
  async getRecentMatches(
    teamId: number, // mantemos assinatura por compatibilidade
    limit: number = 5,
    opts?: { teamName?: string }, // só precisamos do nome agora
  ) {
    const teamName = opts?.teamName
    if (!teamName) throw new Error('getRecentMatches requer opts.teamName')

    // Busca partidas que contenham o nome do time
    const results = await this.searchMatches(teamName)

    // Filtra apenas jogos finalizados do time
    const target = removeAccents(teamName).toLowerCase()
    const finished = results.filter((m) => {
      const home = removeAccents(m.home_name || '').toLowerCase()
      const away = removeAccents(m.away_name || '').toLowerCase()
      const st = (m.status || '').toUpperCase()
      const isFinished =
        st.includes('FT') ||
        st.includes('FINISHED') ||
        st.includes('FULL') ||
        (typeof m.home_score === 'number' && typeof m.away_score === 'number')
      return (home.includes(target) || away.includes(target)) && isFinished
    })

    if (!finished.length) {
      throw new Error(
        `Sem partidas finalizadas encontradas para "${teamName}" via busca`,
      )
    }

    // Ordena por data crescente e pega os últimos N
    const sorted = finished
      .filter((m) => m.date)
      .sort(
        (a, b) =>
          new Date(a.date as any).getTime() - new Date(b.date as any).getTime(),
      )
      .slice(-limit)

    return sorted
  }

  // ----------------------------------------------------------
  // ✅ Head to head
  // ----------------------------------------------------------
  async getHeadToHead(eventId: number) {
    const url = `${this.baseUrl}/get-head-to-head-by-event-id?event_id=${eventId}`
    return this.fetchJson(url)
  }

  // ----------------------------------------------------------
  // ✅ Estatísticas
  // ----------------------------------------------------------
  async getMatchStats(eventId: number) {
    const url = `${this.baseUrl}/get-statistics-event-by-event-id?event_id=${eventId}`
    return this.fetchJson(url)
  }

  // ----------------------------------------------------------
  // 🔧 Helper genérico
  // ----------------------------------------------------------
  private async fetchJson(url: string) {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': this.apiHost,
      },
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Erro API ${res.status}: ${text}`)
    return JSON.parse(text)
  }
}
