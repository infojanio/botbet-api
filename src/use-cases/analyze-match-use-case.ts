import { ApiFootballService } from '../services/api-football-service'
import { detectPatterns } from '../utils/pattern-detector'

export class AnalyzeMatchUseCase {
  private api = new ApiFootballService()

  async execute(homeTeamId: number, awayTeamId: number) {
    const [homeStats, awayStats, h2h] = await Promise.all([
      this.api.getTeamStatistics(homeTeamId),
      this.api.getTeamStatistics(awayTeamId),
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
