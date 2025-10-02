import { GenerateSignalsUseCase } from '../use-cases/generate-signals'
import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'
import { PrismaSignalRepository } from '../repositories/prisma/prisma-signal-repository'
import { PrismaStatsRepository } from '../repositories/prisma/prisma-stats-repository'
import { ApiFootballService } from '../services/api-football-service'

export function makeGenerateSignals() {
  const api = new ApiFootballService()
  const matchRepo = new PrismaMatchRepository()
  const signalRepo = new PrismaSignalRepository()
  const statsRepo = new PrismaStatsRepository()

  return new GenerateSignalsUseCase(api, matchRepo, signalRepo, statsRepo)
}
