import { FastifyInstance } from 'fastify'
import { runAdvancedAnalysisController } from '../controllers/advanced-analysis-controller'

export async function advancedAnalysisRoutes(app: FastifyInstance) {
  app.get('/analysis/run', runAdvancedAnalysisController)
}
