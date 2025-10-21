import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetMatchStats } from '../../../factories/make-get-match-stats'

interface GetMatchStatsParams {
  id: string
}

interface GetMatchStatsQuery {
  limit?: string
}

export async function getMatchStatsController(
  request: FastifyRequest<{
    Params: GetMatchStatsParams
    Querystring: GetMatchStatsQuery
  }>,
  reply: FastifyReply,
) {
  try {
    const matchId = Number(request.params.id)
    const limit = request.query.limit ? Number(request.query.limit) : 5

    if (!matchId) {
      return reply.status(400).send({ message: 'ID da partida inválido.' })
    }

    const useCase = makeGetMatchStats()
    const result = await useCase.execute(matchId)

    if (!result) {
      return reply
        .status(404)
        .send({ message: 'Estatísticas não encontradas.' })
    }

    return reply.status(200).send(result)
  } catch (error) {
    console.error('❌ Erro no getMatchStatsController:', error)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
