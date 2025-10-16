import { ApiFootballService } from '../services/external-api/api-football-service'
import { getFromCache, saveToCache } from '../cache/local-cache'

interface FilterParams {
  type: string
  min: number
  max?: number
  page?: number
  limit?: number
}

export class FiltersUseCase {
  private api = new ApiFootballService()

  async execute({ type, min, max, page = 1, limit = 10 }: FilterParams) {
    const cacheKey = `filter:${type}:${min}:${max}:${page}:${limit}`
    const cached = getFromCache(cacheKey)
    if (cached) return cached

    const leagues = await this.api.getLeagues()
    const results: any[] = []

    for (const league of leagues.leagues.slice(0, 10)) {
      const teamsData = await this.api.getTeamsByLeague(league.id)
      for (const team of teamsData.teams) {
        const stats = await this.api.getTeamStatistics(team.id)
        const avgGoals = stats.avg_goals_scored ?? 0
        const avgCorners = stats.avg_corners ?? 0
        const avgCards = stats.avg_cards ?? 0

        let value = 0
        if (type === 'goals') value = avgGoals
        if (type === 'corners') value = avgCorners
        if (type === 'cards') value = avgCards

        if (value >= min && (!max || value <= max)) {
          results.push({ team: team.name, league: league.name, value })
        }
      }
    }

    const sorted = results.sort((a, b) => b.value - a.value)
    const start = (page - 1) * limit
    const end = start + limit
    const paginated = sorted.slice(start, end)

    const payload = {
      page,
      limit,
      total: results.length,
      totalPages: Math.ceil(results.length / limit),
      data: paginated,
    }

    saveToCache(cacheKey, payload)
    return payload
  }
}
