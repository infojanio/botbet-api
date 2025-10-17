import { FastifyRequest, FastifyReply } from 'fastify'
import { ApiFootballService } from '../../services/external-api/api-football-service'


export async function getLeaguesController(req: FastifyRequest, reply: FastifyReply) {
  try {
    const api = new ApiFootballService()
    const data = await api.getLeagues()
    return reply.status(200).send(data)
  } catch (err: any) {
    console.error(err)
    return reply.status(500).send({ message: err.message })
  }
}

export async function getTeamsByLeagueController(req: FastifyRequest, reply: FastifyReply) {
  const { leagueId } = req.params as { leagueid: number }

  try {
    const api = new ApiFootballService()
    const data = await api.getTeamsByLeague(Number(leagueId))
    return reply.status(200).send(data)
  } catch (err: any) {
    console.error(err)
    return reply.status(500).send({ message: err.message })
  }
}
