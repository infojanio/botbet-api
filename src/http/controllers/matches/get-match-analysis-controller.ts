import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetMatchAnalysis } from '../../../factories/make-get-match-analysis'

interface GetMatchAnalysisParams {
  id: string
}

export async function getMatchAnalysisController(
  request: FastifyRequest<{ Params: GetMatchAnalysisParams }>,
  reply: FastifyReply,
) {
  try {
    const matchId = Number(request.params.id)
    if (!matchId) {
      return reply.status(400).send({ message: 'ID da partida inválido.' })
    }

    const useCase = makeGetMatchAnalysis()
    const result = await useCase.execute(matchId)

    return reply.status(200).send(result)
  } catch (err) {
    console.error('❌ Erro no getMatchAnalysisController:', err)
    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }
}
