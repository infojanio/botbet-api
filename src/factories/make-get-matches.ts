import { PrismaMatchRepository } from "../repositories/prisma/prisma-match-repository";
import { GetMatchesUseCase } from "../use-cases/get-matches";

export function makeGetMatches() {
  return new GetMatchesUseCase(new PrismaMatchRepository());
}
