import { AnalyzeMatchUseCase } from "../use-cases/analyze-match-use-case"
import { ApiFootballService } from "../services/external-api/api-football-service"

export function makeAnalyzeUseCase() {
  return new AnalyzeMatchUseCase(new ApiFootballService())
}