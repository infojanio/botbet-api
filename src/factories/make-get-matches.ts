import { PrismaMatchRepository } from "../repositories/prisma/prisma-match-repository";
import { GetMatchesUseCase } from "../use-cases/get-matches";

export function makeGetMatches() {
  const repo = new PrismaMatchRepository();
  return new GetMatchesUseCase(repo);
}
