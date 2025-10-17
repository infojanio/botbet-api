import { ISignalRepository } from "../repositories/interfaces/ISignalRepository"

export class GetSignalsUseCase {
  constructor(private repo: ISignalRepository) {}

  async execute(params: any) {
    const signals = await this.repo.findMany(params)
    const total = await this.repo.count(params)

    return {
      total,
      signals: signals.map((s) => ({
        id: s.id,
        matchId: s.matchId,
        homeTeam: s.homeTeam,
        awayTeam: s.awayTeam,
        type: s.type,
        confidence: `${s.probability}%`,
        status: s.status,
        createdAt: s.createdAt,
      })),
    }
  }
}
