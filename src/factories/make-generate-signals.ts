import { GenerateSignalsUseCase } from '../use-cases/generate-signals-use-case'

export function makeGenerateSignals() {
  const useCase = new GenerateSignalsUseCase()
  return useCase
}
