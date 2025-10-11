export interface IExternalApiService {
  getUpcomingMatches(
    leagueId: string,
    season: number,
    limit: number,
  ): Promise<any[]>
  getRecentMatches(teamId: number, limit: number): Promise<any[]>
  getOdds(matchId: number): Promise<any[]>
  getAllCompetitions(): Promise<any[]>
  getHeadToHead(homeId: number, awayId: number): Promise<any[]>
  getMatchDetails(fixtureId: number): Promise<any>
}
