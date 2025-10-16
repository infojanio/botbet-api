// src/http/controllers/signal-detail-controller.ts

import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'

export async function getSignalDetail(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }

  const signal = await prisma.signal.findUnique({
    where: { id: Number(id) },
    include: {
      match: {
        include: {
          homeTeam: { include: { stats: true } },
          awayTeam: { include: { stats: true } },
          league: true,
          stats: true,
        },
      },
    },
  })

  if (!signal) {
    return reply.status(404).send({ status: 'error', message: 'Sinal não encontrado' })
  }

  const match = signal.match

  const summary = {
    league: match?.league?.name,
    home: match?.homeTeam?.name,
    away: match?.awayTeam?.name,
    score: `${match?.homeScore ?? '-'} - ${match?.awayScore ?? '-'}`,
    date: match?.date,
    status: match?.status,
  }

  const stats = match?.stats?.map((st) => ({
    teamId: st.teamId,
    possession: st.possession,
    shotsOnTarget: st.shotsOnTarget,
    corners: st.corners,
    yellowCards: st.yellowCards,
    redCards: st.redCards,
  }))

  return reply.send({
    status: 'success',
    signal: {
      id: signal.id,
      type: signal.type,
      confidence: signal.confidence,
      description: signal.description,
      createdAt: signal.createdAt,
    },
    match: summary,
    statistics: stats,
  })
}
