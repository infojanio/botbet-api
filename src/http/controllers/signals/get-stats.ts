import { FastifyInstance } from 'fastify'
import { GetSignalsStatsUseCase } from '../../../use-cases/get-signals-stats-use-case'

export async function signalsStatsRoutes(app: FastifyInstance) {
  app.get('/signals/stats', async (req, reply) => {
    try {
      const useCase = new GetSignalsStatsUseCase()
      const stats = await useCase.execute()
      return reply.status(200).send(stats)
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error)
      return reply.status(500).send({ error: 'Erro ao calcular estatísticas' })
    }
  })
}
