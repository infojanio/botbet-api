import { ApiFootballService } from "../services/external-api/api-football-service"
import { PrismaMatchRepository } from "../repositories/prisma/prisma-match-repository"
import { PrismaSignalRepository } from "../repositories/prisma/prisma-signal-repository"
import { GenerateLiveEarlyGoalsSignalsUseCase } from "../use-cases/generate-live-early-goals-signals"

export function makeGenerateLiveEarlyGoals() {
  const api = new ApiFootballService()
  const matchRepo = new PrismaMatchRepository()
  const signalRepo = new PrismaSignalRepository()
  return new GenerateLiveEarlyGoalsSignalsUseCase(api, signalRepo, matchRepo)
}
