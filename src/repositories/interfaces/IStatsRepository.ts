export interface IStatsRepository {
  getByTeam(
    teamId: number,
  ): Promise<{
    avgGoals: number
    avgCorners: number
    avgCards: number
    totalMatches: number
  }>
}
