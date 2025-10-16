// src/http/controllers/signals-hot-controller.ts

import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'

export async function getHotSignals(request: FastifyRequest, reply: FastifyReply) {
  const { type, limit, cursor } = request.query as {
    type?: string
    limit?: string
    cursor?: string
  }

  const filters: any = {
    confidence: { gte: 75 },
  }

  if (type) filters.type = type.toLowerCase()
  const take = limit ? Math.min(Number(limit), 50) : 20

  const signals = await prisma.signal.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
    take: take + 1, // busca 1 extra pra saber se há próxima página
    ...(cursor && { skip: 1, cursor: { id: Number(cursor) } }),
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
        },
      },
    },
  })

  const hasNextPage = signals.length > take
  if (hasNextPage) signals.pop()

  const formatted = signals.map((s) => ({
    id: s.id,
    type: s.type,
    confidence: s.confidence,
    description: s.description,
    createdAt: s.createdAt,
    league: s.match?.league?.name || 'Desconhecida',
    match: {
      id: s.match?.id,
      home: s.match?.homeTeam?.name,
      away: s.match?.awayTeam?.name,
      score: `${s.match?.homeScore ?? '-'} - ${s.match?.awayScore ?? '-'}`,
    },
  }))

  return reply.send({
    status: 'success',
    total: formatted.length,
    filters: { type: type || 'all', limit: take },
    nextCursor: hasNextPage ? formatted.at(-1)?.id : null,
    signals: formatted,
  })
}