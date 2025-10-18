import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'

export class GetMatchesUseCase {
  constructor(private matchesRepo: PrismaMatchRepository) {}

  async execute(date: Date) {
    return this.matchesRepo.findByDate(date)
  }
}
