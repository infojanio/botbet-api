import { AnalyzeMatchUseCase } from "../use-cases/analyze-match-use-case"

export function makeAnalyzeUseCase() {
  return new AnalyzeMatchUseCase()
}