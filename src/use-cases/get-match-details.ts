import { IMatchRepository } from "../repositories/interfaces/IMatchRepository";

export class GetMatchDetailsUseCase {
  constructor(private repo: IMatchRepository) {}

  async execute(id: string) {
    const match = await this.repo.findById(id);
    if (!match) return null;

    return {
      id: match.id,
      date: match.dateUtc,
      competition: match.competition,
      home: match.homeTeam.name,
      away: match.awayTeam.name,
      status: match.status,
      signals: match.signals,
      odds: match.odds,
    };
    }
}
