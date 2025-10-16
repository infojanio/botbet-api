import { FastifyInstance } from 'fastify'
import { getTeamsByLeagueController } from '../controllers/teams-controller'

export async function teamsRoutes(app: FastifyInstance) {
 
  app.get('/teams/:leagueId', getTeamsByLeagueController)
}
