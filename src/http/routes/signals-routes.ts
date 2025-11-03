import { FastifyInstance } from 'fastify'
import { SignalsController } from '../controllers/signals-controller'
import { getTopSignalsController } from '../controllers/get-top-signals-controller'
import { getDailySignals } from '../controllers/signals/get-daily-signals'
import { getSignalsByResultController } from '../controllers/get-signals-by-result-controller'
import { getSignalsByStatusController } from '../controllers/get-signals-by-status-controller'

export async function signalsRoutes(app: FastifyInstance) {
  const controller = new SignalsController()
  app.get('/signals/top', getTopSignalsController)
  app.get('/signals', (req, reply) => controller.index(req, reply))
  app.get('/signals/daily', getDailySignals)
  app.get('/signals/by-result', getSignalsByResultController)
  app.get('/signals/by-status', getSignalsByStatusController)
}
