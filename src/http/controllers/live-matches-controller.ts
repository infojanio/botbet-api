// src/http/controllers/live-matches-controller.ts

import { FastifyReply, FastifyRequest } from 'fastify'
import { ApiFootballService } from '../../services/external-api/api-football-service'

export async function getLiveMatches(_: FastifyRequest, reply: FastifyReply) {
  const api = new ApiFootballService()
  const data = await api.getLiveMatches()

  // estrutura amigável para o painel
  const matches = data.response.live.map((m: any) => ({
    id: m.id,
    leagueId: m.leagueId,
    date: m.time,
    home: {
      id: m.home.id,
      name: m.home.name,
      score: m.home.score,
    },
    away: {
      id: m.away.id,
      name: m.away.name,
      score: m.away.score,
    },
    status: {
      time: m.status.liveTime.short,
      description: m.status.liveTime.long,
      score: m.status.scoreStr,
      finished: m.status.finished,
      ongoing: m.status.ongoing,
    },
  }))

  return reply.send({ status: 'success', total: matches.length, matches })
}
