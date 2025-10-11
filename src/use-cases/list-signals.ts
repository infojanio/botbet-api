import { prisma } from '../db/prisma'

export class ListSignalsUseCase {
  async execute() {
    const signals = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
      take: 30,
    })

    return signals.map((s) => ({
      id: s.id,
      match: `${s.match.homeTeam.name} x ${s.match.awayTeam.name}`,
      league: s.match.competition,
      market: s.market,
      line: s.line,
      selection: s.selection,
      modelProb: +(s.modelProb * 100).toFixed(1),
      confidence: s.confidence,
      reason: s.reason,
      createdAt: s.createdAt,
    }))
  }
}
