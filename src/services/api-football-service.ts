import fetch from "node-fetch";
import { IExternalApiService } from "../repositories/interfaces/IExternalApiService";

export class ApiFootballService implements IExternalApiService {
  private baseUrl = "https://free-api-live-football-data.p.rapidapi.com";
  private apiKey: string;
  private apiHost: string;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY!;
    this.apiHost = process.env.RAPIDAPI_HOST!;
  }

  private async getJson(endpoint: string, params?: Record<string, any>) {
    let url = `${this.baseUrl}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": this.apiKey,
        "X-RapidAPI-Host": this.apiHost,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    return res.json();
  }

  // 🔸 Buscar ligas
  async getLeagues() {
    console.log('🏆 Buscando ligas disponíveis...')
    const res = await this.getJson('/football-leagues')
    return res
  }

  // 🔸 Buscar times por liga
  async getTeamsByLeague(leagueId: number) {
    console.log(`⚽ Buscando times da liga ${leagueId}...`)
    const res = await this.getJson('/football-teams', { league_id: leagueId })
    return res
  }

  // 🔸 Buscar partidas por data
  async getFixturesByDate(date: string) {
    console.log(`📅 Buscando partidas na data ${date}...`)
    const res = await this.getJson('/football-fixtures', { date })
    return res
  }

  // 🔸 Buscar estatísticas de um time
  async getTeamStatistics(teamId: number) {
    console.log(`📊 Buscando estatísticas do time ${teamId}...`)
    const res = await this.getJson('/football-team-statistics', { team_id: teamId })
    return res
  }

  // 🔸 Buscar confrontos diretos (Head-to-Head)
  async getHeadToHead(teamAId: number, teamBId: number) {
    console.log(`🤜🤛 Buscando confrontos diretos entre ${teamAId} e ${teamBId}...`)
    const res = await this.getJson('/football-head-to-head', {
      team1_id: teamAId,
      team2_id: teamBId,
    })
    return res
  }

  // 🔸 Buscar jogos ao vivo
  async getLiveMatches() {
    console.log('📺 Buscando jogos AO VIVO...')
    const res = await this.getJson('/matches/live')

    if (!res?.matches) {
      console.warn('⚠️ Nenhum jogo ao vivo encontrado.')
      return []
    }

    return res.matches.map((m: any) => ({
      id: m.id,
      competition: m.competition?.name,
      home: m.homeTeam?.name,
      away: m.awayTeam?.name,
      score: `${m.score?.fullTime?.home ?? 0} - ${m.score?.fullTime?.away ?? 0}`,
      elapsed: m.minute ?? 0,
      status: m.status,
    }))
  }

  // 🔸 Buscar jogos futuros
  async getUpcomingMatches() {
    console.log('📆 Buscando jogos futuros...')
    const res = await this.getJson('/matches/upcoming')

    if (!res?.matches) {
      console.warn('⚠️ Nenhum jogo futuro encontrado.')
      return []
    }

    return res.matches.map((m: any) => ({
      id: m.id,
      dateUtc: m.utcDate,
      competition: m.competition?.name,
      home: m.homeTeam?.name,
      away: m.awayTeam?.name,
      status: m.status,
    }))
  }

  // 🔸 Buscar estatísticas de um jogo específico
  async getMatchStats(matchId: string) {
    console.log(`📈 Buscando estatísticas do jogo ${matchId}...`)
    const res = await this.getJson(`/matches/${matchId}/statistics`)
    return res.statistics || []
  }

  // 🔸 Métodos de placeholder (podem ser implementados depois)
  async getRecentMatches(teamId: number, limit: number): Promise<any[]> {
    console.log(`🕒 Placeholder: getRecentMatches(${teamId}, ${limit})`)
    return []
  }

  async getOdds(fixtureId: number): Promise<any[]> {
    console.log(`💰 Placeholder: getOdds(${fixtureId})`)
    return []
  }

  async getLiveOdds(fixtureId: number): Promise<any[]> {
    console.log(`📡 Placeholder: getLiveOdds(${fixtureId})`)
    return []
  }
}
