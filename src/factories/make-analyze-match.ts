import { makeGetMatchDetailsUseCase } from './make-get-match-details'
import { AnalyzeMatchUseCase } from '../use-cases/analyze-match-use-case'

export function makeAnalyzeMatchUseCase() {
  const getDetails = makeGetMatchDetailsUseCase()
  return new AnalyzeMatchUseCase(getDetails)
}
