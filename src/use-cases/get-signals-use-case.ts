import { prisma } from '../lib/prisma'

export class GetSignalsUseCase {
  async execute() {
    const signals = await prisma.signal.findMany({
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            league: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // limite para não sobrecarregar
    })

    return signals.map((s) => ({
      id: s.id,
      league: s.match.league.name,
      match: `${s.match.homeTeam.name} x ${s.match.awayTeam.name}`,
      type: s.type,
      confidence: s.confidence,
      description: s.description,
      status: s.status,
      date: s.match.date,
    }))
  }
}
