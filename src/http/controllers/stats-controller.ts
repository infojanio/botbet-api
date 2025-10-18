import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetStatsUseCase } from '../../factories/make-get-stats'

export async function getTeamStatsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { teamId } = request.params as { teamId: string }
    const useCase = makeGetStatsUseCase()
    const data = await useCase.execute(Number(teamId))
    return reply.status(200).send(data)
  } catch (err) {
    request.log.error(err)
    return reply
      .status(500)
      .send({ message: 'Erro ao buscar estatísticas do time' })
  }
}
