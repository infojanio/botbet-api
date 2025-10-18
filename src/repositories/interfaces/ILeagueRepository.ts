import { League, Match, Team } from '@prisma/client'

export interface ILeagueRepository {
  findAll(): Promise<
    (League & {
      matches: Match[]
      teams: Team[]
    })[]
  >
}
