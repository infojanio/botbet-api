import { FastifyInstance } from 'fastify'
import { getLeaguesController, getTeamsByLeagueController } from '../controllers/teams-controller'

export async function teamsRoutes(app: FastifyInstance) {
  app.get('/leagues', getLeaguesController)
  app.get('/teams/:leagueId', getTeamsByLeagueController)
}
