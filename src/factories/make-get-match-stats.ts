import { ApiFootballService } from '../services/external-api/api-football-service'
import { GetMatchStatsUseCase } from '../use-cases/get-match-stats-use-case'

export function makeGetMatchStats() {
  const apiService = new ApiFootballService()
  const useCase = new GetMatchStatsUseCase(apiService)
  return useCase
}
