import { IMatchRepository } from "../repositories/interfaces/IMatchRepository";

export class GetMatchesUseCase {
  constructor(private repo: IMatchRepository) {}

  async execute(params: { from?: Date; to?: Date; limit?: number }) {
    const matches = await this.repo.findUpcoming(params);

    return matches.map((m) => ({
      id: m.id,
      date: m.date,
      competition: m.league.name,
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      status: m.status,
      signals: m.signals.map((s) => ({
        type: s.type,
        confidence: s.confidence,
        status: s.status,
        description: s.description,
      })),
    }));
  }
}
