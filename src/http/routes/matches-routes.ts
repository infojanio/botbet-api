import { FastifyInstance } from 'fastify'

import { runAnalysisController } from '../controllers/match-analysis-controller'
import { getMatchesController } from '../controllers/matches-controller'

export async function matchesRoutes(app: FastifyInstance) {
  app.get('/matches', getMatchesController)
  app.get('/matches/:id/analysis', runAnalysisController)
}
