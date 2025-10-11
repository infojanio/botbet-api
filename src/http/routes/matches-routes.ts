import { FastifyInstance } from 'fastify'
import { MatchesController } from '../controllers/matches-controller'

export async function matchesRoutes(app: FastifyInstance) {
  const controller = new MatchesController()

  app.get('/matches', controller.list)
  app.get('/matches/:id', controller.details)
  app.get('/matches/filter', controller.filterMatches)
}
