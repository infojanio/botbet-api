import { AnalyzeMatchUseCase } from "../use-cases/analyze-match-use-case"
import { ApiFootballService } from "../services/api-football-service"

export function makeAnalyzeUseCase() {
  return new AnalyzeMatchUseCase(new ApiFootballService())
}