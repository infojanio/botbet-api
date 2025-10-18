import { ApiFootballService } from '../services/external-api/api-football-service'

export class GetH2HHistoryUseCase {
  constructor(private api: ApiFootballService) {}

  async execute(homeId: number, awayId: number, limit = 5) {
    const matches = await this.api.getHeadToHead(homeId, awayId, limit)
    return matches.map((m: any) => ({
      homeGoals: m.home?.score ?? 0,
      awayGoals: m.away?.score ?? 0,
      corners: m.corners ?? 0,
      yellowHome: m.home?.yellow ?? 0,
      yellowAway: m.away?.yellow ?? 0,
      date: m.dateUtc,
    }))
  }
}
