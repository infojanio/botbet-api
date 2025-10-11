import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGenerateSignalsUseCase } from '../../factories/make-generate-signals'
import { makeListSignalsUseCase } from '../../factories/make-list-signals'

export class SignalsController {
  async generate(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { league, limit } = req.query as any
      const useCase = makeGenerateSignalsUseCase()
      const result = await useCase.execute({
        league,
        limit: Number(limit) || 5,
      })
      return reply.send(result)
    } catch (err) {
      console.error('❌ Erro ao gerar sinais:', err)
      return reply.status(500).send({ error: err.message })
    }
  }

  async list(req: FastifyRequest, reply: FastifyReply) {
    try {
      const useCase = makeListSignalsUseCase()
      const signals = await useCase.execute()
      return reply.send(signals)
    } catch (err) {
      console.error('❌ Erro ao listar sinais:', err)
      return reply.status(500).send({ error: err.message })
    }
  }
}
