import { PrismaMatchRepository } from "../repositories/prisma/prisma-match-repository";
import { GetMatchDetailsUseCase } from "../use-cases/get-match-details";

export function makeGetMatchDetails() {
  const repo = new PrismaMatchRepository();
  return new GetMatchDetailsUseCase(repo);
}
