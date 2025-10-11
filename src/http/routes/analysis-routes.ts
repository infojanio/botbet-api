import { FastifyInstance } from 'fastify'
import { AnalysisController } from '../controllers/analysis-controller'

export async function analysisRoutes(app: FastifyInstance) {
  const controller = new AnalysisController()
  app.get('/analysis/patterns', controller.patterns.bind(controller))
}
