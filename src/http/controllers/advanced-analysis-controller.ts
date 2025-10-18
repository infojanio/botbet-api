import { FastifyRequest, FastifyReply } from 'fastify'
import { makeRunAdvancedAnalysis } from '../../factories/make-run-advanced-analysis'

export async function runAdvancedAnalysisController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = makeRunAdvancedAnalysis()
  const result = await useCase.execute()
  return reply.send(result)
}
