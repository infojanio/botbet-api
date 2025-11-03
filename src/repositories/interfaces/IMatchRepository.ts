import { League, Match, MatchStat, Signal, Team } from '@prisma/client'

export interface IMatchRepository {
  findById(
    id: number,
  ): Promise<
    | (Match & {
        league: League
        homeTeam: Team
        awayTeam: Team
        stats: MatchStat[]
        signals: Signal[]
      })
    | null
  >

  findByDate(
    date: Date,
  ): Promise<
    (Match & {
      league: League
      homeTeam: Team
      awayTeam: Team
    })[]
  >

  findUpcoming(params?: {
    limit?: number
  }): Promise<
    (Match & {
      league: League
      homeTeam: Team
      awayTeam: Team
      signals?: Signal[]
    })[]
  >
}
