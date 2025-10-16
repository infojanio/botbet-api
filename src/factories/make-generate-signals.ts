// src/use-cases/factories/make-generate-signal-use-case.ts

import { GenerateSignal } from '../use-cases/generate-signals'

export function makeGenerateSignalUseCase() {
  return new GenerateSignal()
}
