import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetSignals } from '../../factories/make-get-signals'

export class SignalsController {
  async index(req: FastifyRequest, reply: FastifyReply) {
    try {
      const getSignals = makeGetSignals()
      const result = await getSignals.execute()

      return reply.status(200).send({
        count: result.length,
        signals: result,
      })
    } catch (err) {
      console.error('❌ Erro ao listar sinais:', err)
      return reply.status(500).send({ error: 'Erro ao buscar sinais' })
    }
  }
}
