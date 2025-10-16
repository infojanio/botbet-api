// src/http/controllers/signals-stats-controller.ts
import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'


export async function getSignalsStats(_: FastifyRequest, reply: FastifyReply) {
  // 🔹 Busca todos os sinais (já com o status da partida)
  const signals = await prisma.signal.findMany({
    include: {
      match: {
        include: {
          stats: true,
        },
      },
    },
  })

  if (signals.length === 0) {
    return reply.send({
      status: 'success',
      message: 'Nenhum sinal encontrado ainda.',
      summary: {
        totalSignals: 0,
        averageConfidence: 0,
        greenRate: 0,
        typesDistribution: [],
      },
    })
  }

  // 🔹 Calcula resultados reais
  let greenCount = 0
  const total = signals.length
  const typeCount: Record<string, number> = {}
  const confidences: number[] = []

  for (const signal of signals) {
    confidences.push(signal.confidence)
    typeCount[signal.type] = (typeCount[signal.type] || 0) + 1

    const matchStats = signal.match?.stats
    if (!matchStats || matchStats.length === 0) continue

    // soma de métricas da partida
    const totalCorners = matchStats.reduce((sum, s) => sum + (s.corners ?? 0), 0)
    const totalCards = matchStats.reduce((sum, s) => sum + (s.yellowCards ?? 0), 0)
    const totalGoals = (signal.match.homeScore ?? 0) + (signal.match.awayScore ?? 0)

    let isGreen = false

    // regras reais por tipo
    if (signal.type === 'goals') {
      if (signal.description?.includes('over 2.5') && totalGoals >= 3) isGreen = true
      else if (signal.description?.includes('over 1.5') && totalGoals >= 2) isGreen = true
    } else if (signal.type === 'corners') {
      if (totalCorners >= 10) isGreen = true
    } else if (signal.type === 'cards') {
      if (totalCards >= 6) isGreen = true
    }

    // atualiza no banco, se ainda estiver pendente
    if (signal.result !== (isGreen ? 'green' : 'red')) {
      await prisma.signal.update({
        where: { id: signal.id },
        data: { result: isGreen ? 'green' : 'red' },
      })
    }

    if (isGreen) greenCount++
  }

  // 🔹 cálculo das médias
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length
  const greenRate = ((greenCount / total) * 100).toFixed(1)

  // 🔹 distribuição por tipo
  const typesDistribution = Object.entries(typeCount).map(([type, count]) => ({
    type,
    count,
    percentage: ((count / total) * 100).toFixed(1) + '%',
  }))

  return reply.send({
    status: 'success',
    summary: {
      totalSignals: total,
      averageConfidence: avgConfidence.toFixed(1) + '%',
      greenRate: greenRate + '%',
      greens: greenCount,
      reds: total - greenCount,
      typesDistribution,
    },
  })
}
