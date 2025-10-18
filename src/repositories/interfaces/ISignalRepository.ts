import { League, Match, Signal, Team } from '@prisma/client'

export interface ISignalRepository {
  findMany(): Promise<
    (Signal & {
      match: Match & { homeTeam: Team; awayTeam: Team; league: League }
    })[]
  >
}
