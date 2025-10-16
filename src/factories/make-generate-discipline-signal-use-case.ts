// src/use-cases/factories/make-generate-discipline-signal-use-case.ts
import { GenerateDisciplineSignalUseCase } from '../use-cases/generate-discipline-signal-use-case'

export function makeGenerateDisciplineSignalUseCase() {
  return new GenerateDisciplineSignalUseCase()
}
