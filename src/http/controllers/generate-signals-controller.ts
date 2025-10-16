import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGenerateSignalUseCase } from '../../factories/make-generate-signals'

export class GenerateSignalsController {
  async handle(_: FastifyRequest, reply: FastifyReply) {
    try {
      const useCase = makeGenerateSignalUseCase()
      const result = await useCase.execute()

      return reply.send({
        status: 'success',
        message: 'Sinais gerados com sucesso.',
        data: result,
      })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({
        status: 'error',
        message: 'Erro ao gerar sinais.',
        error: (error as Error).message,
      })
    }
  }
}
