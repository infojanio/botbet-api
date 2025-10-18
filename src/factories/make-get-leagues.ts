import { PrismaLeagueRepository } from '../repositories/prisma/prisma-league-repository'
import { GetLeaguesUseCase } from '../use-cases/get-leagues-use-case'

export function makeGetLeaguesUseCase() {
  const repo = new PrismaLeagueRepository()
  return new GetLeaguesUseCase(repo)
}
