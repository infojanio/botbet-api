import { AnalyzePatternsUseCase } from '../use-cases/analyze-patterns-use-case'

export function makePatternAnalysisUseCase() {
  return new AnalyzePatternsUseCase()
}
