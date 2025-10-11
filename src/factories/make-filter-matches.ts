import { FilterMatchesUseCase } from '../use-cases/filter-matches-use-case'
import { MatchFilterService } from '../services/MatchFilterService'
import { PrismaMatchCacheRepository } from '../repositories/prisma/prisma-match-cache-repository'
import { ApiFootballService } from '../services/api-football-service'

export function makeFilterMatchesUseCase() {
  const api = new ApiFootballService()
  const repo = new PrismaMatchCacheRepository()
  const service = new MatchFilterService(api, repo)
  return new FilterMatchesUseCase(service)
}
