import { FastifyInstance } from 'fastify'
import { runAnalysisController } from '../controllers/analyze-controller'


export async function analyzeRoutes(app: FastifyInstance) {
  app.get('/analyze', runAnalysisController)
}
