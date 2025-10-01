import { ISignalRepository } from "../repositories/interfaces/ISignalRepository";

export class GetSignalsUseCase {
  constructor(private repo: ISignalRepository) {}

  async execute(params: any) {
    const signals = await this.repo.findMany(params);
    const total = await this.repo.count(params);

    return {
      total,
      signals: signals.map((s) => ({
        id: s.id,
        date: s.match.dateUtc,
        competition: s.match.competition,
        match: `${s.match.homeTeam.name} x ${s.match.awayTeam.name}`,
        market: s.market,
        line: s.line,
        selection: s.selection,
        prob: (s.modelProb * 100).toFixed(1) + "%",
        edge: (s.edge * 100).toFixed(1) + "%",
        confidence: s.confidence,
        reason: s.reason,
      })),
    };
  }
}
