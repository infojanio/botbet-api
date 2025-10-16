import { ApiFootballService } from '../services/external-api/api-football-service'
import { detectPatterns } from '../utils/pattern-detector'

export class AnalyzeMatchUseCase {
  private api = new ApiFootballService()

  async execute(homeTeamId: number | string, awayTeamId: number | string) {
    const [homeStats, awayStats, h2h] = await Promise.all([
      this.api.getTeamStatistics(String(homeTeamId)),
      this.api.getTeamStatistics(String(awayTeamId)),
      this.api.getHeadToHead(homeTeamId, awayTeamId),
    ])

    const homePatterns = detectPatterns(homeStats)
    const awayPatterns = detectPatterns(awayStats)

    return {
      homeTeam: { id: homeTeamId, patterns: homePatterns },
      awayTeam: { id: awayTeamId, patterns: awayPatterns },
      headToHead: h2h,
    }
  }
}
