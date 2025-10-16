// src/factories/make-generate-signals.ts
import { ApiFootballService } from '../services/external-api/api-football-service'
import { PrismaSignalRepository } from '../repositories/prisma/prisma-signal-repository'
import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'
import { GenerateSignalsUseCase } from '../use-cases/generate-signals'

export function makeGenerateSignalUseCase() {
  const api = new ApiFootballService()
  const signalRepo = new PrismaSignalRepository()
  const matchRepo = new PrismaMatchRepository()
  return new GenerateSignalsUseCase(api, signalRepo, matchRepo)
}
