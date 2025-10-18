import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetMatchesUseCase } from '../../factories/make-get-matches'

export async function getMatchesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeGetMatchesUseCase()
  const date = request.query?.date
    ? new Date(String(request.query.date))
    : new Date()
  const matches = await useCase.execute(date)
  return reply.send(matches)
}
