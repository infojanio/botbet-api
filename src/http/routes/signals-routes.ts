import { FastifyInstance } from 'fastify'
import { SignalsController } from '../controllers/signals-controller'
import { getTopSignalsController } from '../controllers/get-top-signals-controller'
import { getDailySignals } from '../controllers/signals/get-daily-signals'

export async function signalsRoutes(app: FastifyInstance) {
  const controller = new SignalsController()
  app.get('/signals/top', getTopSignalsController)
  app.get('/signals', (req, reply) => controller.index(req, reply))
  app.get('/signals/daily', getDailySignals)
}
