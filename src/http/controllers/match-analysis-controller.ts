import { FastifyRequest, FastifyReply } from 'fastify'
import { makeAnalyzeMatchUseCase } from '../../factories/make-analyze-match'

export async function runAnalysisController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string }
  const useCase = makeAnalyzeMatchUseCase()
  const analysis = await useCase.execute(Number(id))
  return reply.send(analysis)
}
