export interface IExternalApiService {
  getUpcomingMatches(leagueId: any, season: number, limit: number): Promise<any[]>
  getRecentMatches(teamId: string, limit: number): Promise<any[]>

  getOdds(fixtureId: number): Promise<any[]>

  // NOVOS p/ ao vivo
  getLiveMatches(): Promise<any[]>
  getLiveOdds(fixtureId: number): Promise<any[]>

    getFixturesByDate(date: string): Promise<any[]>
  getTeamStatistics(teamId: string | number): Promise<any>
  getHeadToHead(homeId: string | number, awayId: string | number): Promise<any>
  
}
