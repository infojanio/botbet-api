import { Match, Signal, Team, League } from "@prisma/client";

export interface IMatchRepository {
  findUpcoming(params: {
    from?: Date;
    to?: Date;
    limit?: number;
  }): Promise<
    (Match & {
      league: League;
      homeTeam: Team;
      awayTeam: Team;
      signals: Signal[];
    })[]
  >;

  findById(id: number): Promise<
    | (Match & {
        league: League;
        homeTeam: Team;
        awayTeam: Team;
        signals: Signal[];
        stats: any[];
      })
    | null
  >;

  upsert(data: {
    externalId: number;
    date: Date;
    status: string;
    leagueId: number;
    homeTeamId: number;
    awayTeamId: number;
  }): Promise<Match>;
}
