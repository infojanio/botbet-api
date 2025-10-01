import { IMatchRepository } from "../repositories/interfaces/IMatchRepository";

export class GetMatchesUseCase {
  constructor(private repo: IMatchRepository) {}

  async execute(params: { from?: Date; to?: Date; market?: string; minProb?: number; limit?: number }) {
    const matches = await this.repo.findUpcoming(params);
    return matches.map((m) => ({
      id: m.id,
      date: m.dateUtc,
      competition: m.competition,
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      signals: m.signals.map((s) => ({
        market: s.market,
        line: s.line,
        selection: s.selection,
        prob: (s.modelProb * 100).toFixed(1) + "%",
        edge: (s.edge * 100).toFixed(1) + "%",
        confidence: s.confidence,
      })),
    }));
  }
}
