import { PrismaMatchRepository } from "../repositories/prisma/prisma-match-repository";
import { PrismaSignalRepository } from "../repositories/prisma/prisma-signal-repository";
import { ApiFootballService } from "../services/api-football-service";
import { GenerateSignalsUseCase } from "../use-cases/generate-signals";

export function makeGenerateSignals() {
  return new GenerateSignalsUseCase(
    new PrismaMatchRepository(),
    new PrismaSignalRepository(),
    new ApiFootballService()
  );
}
