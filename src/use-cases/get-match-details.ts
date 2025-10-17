import { IMatchRepository } from "../repositories/interfaces/IMatchRepository";

export class GetMatchDetailsUseCase {
  constructor(private repo: IMatchRepository) {}

  async execute(id: number) {
    const match = await this.repo.findById(id);
    if (!match) throw new Error("Match not found");

    return {
      id: match.id,
      date: match.date,
      league: match.league.name,
      home: match.homeTeam.name,
      away: match.awayTeam.name,
      status: match.status,
      signals: match.signals,
      stats: match.stats,
    };
  }
}
