import { prisma } from '../../lib/prisma'

export async function generateSignalsFromStats(
  matchId: number,
  patterns: any[],
) {
  const savedSignals = []

  for (const p of patterns) {
    const existing = await prisma.signal.findFirst({
      where: { matchId, type: p.type },
    })

    if (existing) continue

    const signal = await prisma.signal.create({
      data: {
        matchId,
        type: p.type,
        confidence: p.probability,
        description: p.description,
        status: 'active',
      },
    })

    savedSignals.push(signal)
  }

  console.log(`🧩 ${savedSignals.length} sinais gerados para o jogo ${matchId}`)
  return savedSignals
}
