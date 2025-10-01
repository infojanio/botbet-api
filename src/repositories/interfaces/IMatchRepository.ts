import { Match, Odds, Signal, Team } from "@prisma/client";

export interface IMatchRepository {
  findUpcoming(params: {
    from?: Date;
    to?: Date;
    market?: string;
    minProb?: number;
    limit?: number;
  }): Promise<(Match & { homeTeam: Team; awayTeam: Team; signals: Signal[] })[]>;

  findById(id: string): Promise<(Match & { homeTeam: Team; awayTeam: Team; signals: Signal[]; odds: Odds[] }) | null>;

  upsert(data: {
    id: string;
    dateUtc: Date;
    competition: string;
    season?: string;
    status: string;
    homeTeam: { id: string; name: string; country?: string };
    awayTeam: { id: string; name: string; country?: string };
  }): Promise<Match & { homeTeam: Team; awayTeam: Team }>;
}
