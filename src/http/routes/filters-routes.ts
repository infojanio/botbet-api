import { FastifyInstance } from 'fastify'
import { filtersController } from '../controllers/filters-controller'

export async function filtersRoutes(app: FastifyInstance) {
  app.get('/filters', filtersController)
}
