import { ApiFootballService } from '../services/external-api/api-football-service'
import { GetUpcomingMatchesAnalysisUseCase } from '../use-cases/get-upcoming-matches-analysis-use-case'

export function makeGetUpcomingMatchesAnalysis() {
  const api = new ApiFootballService()
  return new GetUpcomingMatchesAnalysisUseCase(api)
}
