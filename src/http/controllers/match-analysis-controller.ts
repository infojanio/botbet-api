import { FastifyRequest, FastifyReply } from 'fastify'
import { GenerateSignalsUseCase } from '../../use-cases/generate-signals-use-case'

export async function runAnalysisController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string }
  const useCase = new GenerateSignalsUseCase()
  const result = await useCase.execute(Number(id))
  reply.send(result)
}
