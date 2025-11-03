import { FastifyInstance } from 'fastify'

import { getMatchesController } from '../controllers/get-matches-controller'
import { getMatchStatsController } from '../controllers/matches/get-match-stats-controller'
import { getMatchAnalysisController } from '../controllers/matches/get-match-analysis-controller'
import { getUpcomingMatchesAnalysisController } from '../controllers/matches/get-upcoming-analysis-controller'

export async function matchesRoutes(app: FastifyInstance) {
  app.get('/matches', getMatchesController)
  app.get('/matches/:id/analysis', getMatchAnalysisController)
  app.get('/matches/:id/stats', getMatchStatsController)
  app.get('/matches/analysis/upcoming', getUpcomingMatchesAnalysisController)
}
