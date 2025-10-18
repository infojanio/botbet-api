import { FastifyInstance } from 'fastify'
import { getLeaguesController } from '../controllers/leagues-controller'

export async function leaguesRoutes(app: FastifyInstance) {
  app.get('/leagues', getLeaguesController)
}
