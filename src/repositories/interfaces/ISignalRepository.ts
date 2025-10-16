import { Match, Signal, Team } from "@prisma/client";

export interface ISignalRepository {
  create(data: {
    matchId: string | number;
    homeTeam: string;
    awayTeam: string;
    type: string;
    probability: number;
    status: string;
  }): Promise<Signal>;

  findById(id: string): Promise<Signal | null>;

  findMany(params?: any): Promise<
    (Signal & {
      match?: Match & { homeTeam?: Team; awayTeam?: Team };
    })[]
  >;

  findByMatchAndType(matchId: number, type: string): Promise<Signal | null>;

  updateStatus(id: string, status: string): Promise<Signal>;

  delete(id: string): Promise<Signal>;

  count(params?: any): Promise<number>;
}
