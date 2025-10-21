import { ApiFootballService } from '../services/external-api/api-football-service'
import { GetMatchAnalysisUseCase } from '../use-cases/get-match-analysis-use-case'

export function makeGetMatchAnalysis() {
  const api = new ApiFootballService()
  return new GetMatchAnalysisUseCase(api)
}
