import { FastifyReply, FastifyRequest } from 'fastify'
import { ApiFootballService } from '../../services/external-api/api-football-service'

export async function getTodayMatches(_: FastifyRequest, reply: FastifyReply) {
  const api = new ApiFootballService()
  const matches = await api.getTodayMatches()
  return reply.send({ status: 'success', data: matches })
}
