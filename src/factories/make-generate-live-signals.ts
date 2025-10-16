import { ApiFootballService } from "../services/external-api/api-football-service"
import { PrismaMatchRepository } from "../repositories/prisma/prisma-match-repository"
import { PrismaSignalRepository } from "../repositories/prisma/prisma-signal-repository"
import { GenerateLiveSignalsUseCase } from "../use-cases/generate-live-signals"

export function makeGenerateLiveSignals() {
  const api = new ApiFootballService()
  const matchRepo = new PrismaMatchRepository()
  const signalRepo = new PrismaSignalRepository()
  return new GenerateLiveSignalsUseCase(api, signalRepo, matchRepo)
}
