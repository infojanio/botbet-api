import { PrismaLeagueRepository } from '../repositories/prisma/prisma-league-repository'

export class GetLeaguesUseCase {
  constructor(private leaguesRepo: PrismaLeagueRepository) {}

  async execute() {
    return this.leaguesRepo.findAll()
  }
}
