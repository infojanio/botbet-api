import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetLeaguesUseCase } from '../../factories/make-get-leagues'

export async function getLeaguesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeGetLeaguesUseCase()
  const leagues = await useCase.execute()
  return reply.send(leagues)
}
