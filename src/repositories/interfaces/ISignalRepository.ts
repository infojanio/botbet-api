import { Match, Signal, Team } from "@prisma/client";

export interface ISignalRepository {
  create(data: {
    matchId: string;
    market: string;
    line: number;
    selection: string;
    modelProb: number;
    impliedProb: number;
    edge: number;
    confidence: number;
    reason?: string;
  }): Promise<void>;

  findMany(params: any): Promise<(Signal & { match: Match & { homeTeam: Team; awayTeam: Team } })[]>;
  count(params: any): Promise<number>;
}
