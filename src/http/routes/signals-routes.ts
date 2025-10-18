import { FastifyInstance } from 'fastify'
import { SignalsController } from '../controllers/signals-controller'

export async function signalsRoutes(app: FastifyInstance) {
  const controller = new SignalsController()

  app.get('/signals', (req, reply) => controller.index(req, reply))
}
