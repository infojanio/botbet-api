import { RunAdvancedAnalysisUseCase } from '../use-cases/advanced-analysis/run-advanced-analysis-use-case'
import { ApiFootballService } from '../services/external-api/api-football-service'

export function makeRunAdvancedAnalysis() {
  const api = new ApiFootballService()
  return new RunAdvancedAnalysisUseCase(api)
}
