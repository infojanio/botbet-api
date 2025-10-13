import { FastifyInstance } from 'fastify'
import { analyzeController } from '../controllers/analyze-controller'

export async function analyzeRoutes(app: FastifyInstance) {
  app.get('/analyze', analyzeController)
}
