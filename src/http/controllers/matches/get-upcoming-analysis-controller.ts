import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetUpcomingMatchesAnalysis } from '../../../factories/make-get-upcoming-matches-analysis'

export async function getUpcomingMatchesAnalysisController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = makeGetUpcomingMatchesAnalysis()
    const result = await useCase.execute()

    if (!result.length) {
      return reply.status(200).send({
        message: 'Nenhuma análise disponível para hoje ou amanhã.',
        data: [],
      })
    }

    return reply.status(200).send({
      message: 'Análises de partidas futuras geradas com sucesso.',
      total: result.length,
      data: result,
    })
  } catch (err) {
    console.error('❌ Erro no getUpcomingMatchesAnalysisController:', err)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
