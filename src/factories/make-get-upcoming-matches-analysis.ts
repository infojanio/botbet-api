import { ApiFootballService } from '../services/external-api/api-football-service'
import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'
import { GetUpcomingMatchesAnalysisUseCase } from '../use-cases/get-upcoming-matches-analysis-use-case'

export function makeGetUpcomingMatchesAnalysis() {
  const api = new ApiFootballService()
  const repo = new PrismaMatchRepository()

  return new GetUpcomingMatchesAnalysisUseCase(api, repo)
}
