import { FastifyRequest, FastifyReply } from 'fastify'
import { makeAnalyzeUseCase } from '../../factories/make-analyze-use-case'
import { z } from 'zod'

export async function analyzeController(req: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    homeTeamId: z.coerce.number(),
    awayTeamId: z.coerce.number(),
  })

  try {
    const { homeTeamId, awayTeamId } = querySchema.parse(req.query)
    const useCase = makeAnalyzeUseCase()
    const result = await useCase.execute(homeTeamId, awayTeamId)
    return reply.status(200).send(result)
  } catch (err: any) {
    console.error(err)
    return reply.status(400).send({ message: err.message })
  }
}
