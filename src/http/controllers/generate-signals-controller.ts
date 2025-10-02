import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGenerateSignals } from '../../factories/make-generate-signals'

export class GenerateSignalsController {
  async run(req: FastifyRequest, reply: FastifyReply) {
    try {
      const job = makeGenerateSignals()
      await job.execute()
      return reply.send({ message: '✅ Sinais gerados e salvos com sucesso!' })
    } catch (error) {
      console.error('Erro ao gerar sinais:', error)
      return reply.status(500).send({ error: 'Erro ao gerar sinais' })
    }
  }
}
