import { FastifyInstance } from 'fastify'
import { getTodayMatches } from '../controllers/matches-controller'

export async function matchesRoutes(app: FastifyInstance) {
  app.get('/matches', getTodayMatches)
 // app.get("/matches/:id", details)
}
