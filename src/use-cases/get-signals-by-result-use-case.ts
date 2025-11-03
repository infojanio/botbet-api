import { ISignalRepository } from '../repositories/interfaces/ISignalRepository'

export class GetSignalsByResultUseCase {
  constructor(private repo: ISignalRepository) {}

  async execute(result: string) {
    const signals = await this.repo.findByResult(result)
    return signals.map((s) => ({
      id: s.id,
      type: s.type,
      confidence: Number(s.confidence?.toFixed(1)),
      description: s.description,
      result: s.result,
      status: s.status,
      league: s.match?.league?.name ?? 'Desconhecida',
      match: `${s.match?.homeTeam?.name ?? 'N/A'} x ${
        s.match?.awayTeam?.name ?? 'N/A'
      }`,
      date: s.match?.date,
    }))
  }
}
