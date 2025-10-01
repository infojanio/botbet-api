import { PrismaSignalRepository } from "../repositories/prisma/prisma-signal-repository";
import { GetSignalsUseCase } from "../use-cases/get-signals";

export function makeGetSignals() {
  return new GetSignalsUseCase(new PrismaSignalRepository());
}
