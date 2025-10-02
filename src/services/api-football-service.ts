import fetch from 'node-fetch'
import { IExternalApiService } from '../repositories/interfaces/IExternalApiService'

const PROVIDER = process.env.API_PROVIDER || 'official' // "official" ou "rapidapi"
const API_KEY = process.env.API_KEY as string

const API_URL =
  PROVIDER === 'rapidapi'
    ? 'https://api-football-v1.p.rapidapi.com/v3'
    : 'https://v3.football.api-sports.io'

async function getJson(url: string) {
  const headers: Record<string, string> = {}

  if (PROVIDER === 'rapidapi') {
    headers['X-RapidAPI-Key'] = API_KEY
    headers['X-RapidAPI-Host'] = 'api-football-v1.p.rapidapi.com'
  } else {
    headers['x-apisports-key'] = API_KEY
  }

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.response || []
}
export class ApiFootballService implements IExternalApiService {
  async getUpcomingMatches(limit: number) {
    return getJson(`${API_URL}/fixtures?next=${limit}`)
  }

  async getHeadToHead(homeId: number, awayId: number) {
    return getJson(`${API_URL}/fixtures/headtohead?h2h=${homeId}-${awayId}`)
  }

  async getRecentMatches(teamId: number, limit: number) {
    return getJson(`${API_URL}/fixtures?team=${teamId}&last=${limit}`)
  }

  async getOdds(matchId: number) {
    return getJson(`${API_URL}/odds?fixture=${matchId}`)
  }
}
