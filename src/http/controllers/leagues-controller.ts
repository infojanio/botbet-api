import { FastifyReply, FastifyRequest } from 'fastify'
import { ApiFootballService } from '../../services/external-api/api-football-service'

export async function getLeagues(_: FastifyRequest, reply: FastifyReply) {
  const api = new ApiFootballService()
  const leagues = await api.getLeagues()
  return reply.send({ status: 'success', data: leagues })
}
