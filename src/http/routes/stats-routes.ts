import { FastifyInstance } from 'fastify'
import { getTeamStatsController } from '../controllers/stats-controller'

export async function statsRoutes(app: FastifyInstance) {
  // Estatísticas agregadas por time
  app.get('/stats/:teamId', getTeamStatsController)
}
