import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'
import { GetMatchesUseCase } from '../use-cases/get-matches-use-case'

export function makeGetMatchesUseCase() {
  const repo = new PrismaMatchRepository()
  return new GetMatchesUseCase(repo)
}
