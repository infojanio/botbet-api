import { GetSignalsUseCase } from '../use-cases/get-signals-use-case'

export function makeGetSignals() {
  const useCase = new GetSignalsUseCase()
  return useCase
}
