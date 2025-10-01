import fetch from 'node-fetch'
import { IExternalApiService } from '../repositories/interfaces/IExternalApiService'

const API_URL = 'https://api-football-v1.p.rapidapi.com/v3'
const API_KEY = process.env.API_KEY as string

async function getJson(url: string) {
  const res = await fetch(url, {
    headers: { 'X-RapidAPI-Key': API_KEY },
  })
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
