// src/use-cases/matches/list-today-matches-use-case.ts
import { ApiFootballService } from '../services/external-api/api-football-service'

export class ListTodayMatchesUseCase {
  constructor(private apiFootballService: ApiFootballService) {}

  async execute() {
    const data = await this.apiFootballService.getTodayMatches()
    const matches = data.response?.matches || data.response || []

    return matches.map((m: any) => ({
      id: m.id,
      leagueId: m.leagueId,
      date: m.time,
      home: {
        id: m.home.id,
        name: m.home.name,
        score: m.home.score,
      },
      away: {
        id: m.away.id,
        name: m.away.name,
        score: m.away.score,
      },
      status: m.status?.liveTime?.short || '-',
    }))
  }
}
