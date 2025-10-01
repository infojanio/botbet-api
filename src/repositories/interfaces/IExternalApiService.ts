export interface IExternalApiService {
  getUpcomingMatches(limit: number): Promise<any[]>;
  getHeadToHead(homeId: number, awayId: number): Promise<any[]>;
  getRecentMatches(teamId: number, limit: number): Promise<any[]>;
  getOdds(matchId: number): Promise<any[]>;
}
