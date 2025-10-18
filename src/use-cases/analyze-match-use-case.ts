import { GetMatchDetailsUseCase } from './get-match-details-use-case'

export class AnalyzeMatchUseCase {
  constructor(private getMatchDetails: GetMatchDetailsUseCase) {}

  async execute(id: number) {
    const details = await this.getMatchDetails.execute(id)
    const { homeStats, awayStats } = details.analysis

    return {
      match: details,
      summary: {
        likelyOver25: homeStats.avgGoals + awayStats.avgGoals > 2.5,
        likelyOver95Corners: homeStats.avgCorners + awayStats.avgCorners > 9.5,
        likelyOver45Cards: homeStats.avgCards + awayStats.avgCards > 4.5,
      },
    }
  }
}
