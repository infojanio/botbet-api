export interface IExternalApiService {
  getUpcomingMatches(leagueId: any, season: number, limit: number): Promise<any[]>
  getRecentMatches(teamid: number, limit: number): Promise<any[]>

  getOdds(fixtureId: number): Promise<any[]>

  // NOVOS p/ ao vivo
  getLiveMatches(): Promise<any[]>
  getLiveOdds(fixtureId: number): Promise<any[]>

    getFixturesByDate(date: string): Promise<any[]>
  getTeamStatistics(teamid: number | number): Promise<any>
  getHeadToHead(homeid: number | number, awayid: number | number): Promise<any>
  
}
