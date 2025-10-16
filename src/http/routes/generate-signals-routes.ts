import { FastifyInstance } from 'fastify'
import { GenerateSignalsController } from '../controllers/generate-signals-controller'

const controller = new GenerateSignalsController()

export async function generateSignalsRoutes(app: FastifyInstance) {
  app.post('/signals/generate', (req, reply) => controller.handle(req, reply))
}
