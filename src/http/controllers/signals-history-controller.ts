// src/http/controllers/signals-history-controller.ts

import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'


interface Query {
  type?: string
  result?: string
  startDate?: string
  endDate?: string
  limit?: string
}

export async function getSignalsHistory(request: FastifyRequest, reply: FastifyReply) {
  const { type, result, startDate, endDate, limit } = request.query as Query

  const filters: any = {}

  if (type) filters.type = type.toLowerCase()
  if (result) filters.result = result.toLowerCase()

  if (startDate || endDate) {
    filters.createdAt = {}
    if (startDate) filters.createdAt.gte = new Date(startDate)
    if (endDate) filters.createdAt.lte = new Date(endDate)
  }

  const take = limit ? Math.min(Number(limit), 100) : 30

  const signals = await prisma.signal.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      match: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  })

  if (signals.length === 0) {
    return reply.send({
      status: 'success',
      message: 'Nenhum sinal encontrado para o filtro aplicado.',
      total: 0,
      averageConfidence: '0%',
      greenRate: '0%',
      signals: [],
    })
  }

  // 🔹 Cálculos agregados
  const total = signals.length
  const greens = signals.filter((s) => s.result === 'green').length
  const avgConfidence =
    signals.reduce((sum, s) => sum + (s.confidence || 0), 0) / total
  const greenRate = ((greens / total) * 100).toFixed(1)

  const formatted = signals.map((s) => ({
    id: s.id,
    type: s.type,
    confidence: s.confidence,
    result: s.result,
    description: s.description,
    createdAt: s.createdAt,
    match: {
      id: s.match?.id,
      league: s.match?.league?.name,
      home: s.match?.homeTeam?.name,
      away: s.match?.awayTeam?.name,
      score: `${s.match?.homeScore ?? '-'} - ${s.match?.awayScore ?? '-'}`,
    },
  }))

  return reply.send({
    status: 'success',
    total,
    averageConfidence: avgConfidence.toFixed(1) + '%',
    greenRate: greenRate + '%',
    filters: { type, result, startDate, endDate },
    signals: formatted,
  })
}
