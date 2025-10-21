import { ApiFootballService } from '../services/external-api/api-football-service'
import { prisma } from '../lib/prisma'

export class GetMatchStatsUseCase {
  constructor(private api: ApiFootballService) {}

  async execute(matchId: number) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
    })

    if (!match) {
      throw new Error('Partida não encontrada.')
    }

    console.log(
      `📊 Coletando estatísticas de ${match.homeTeam.name} x ${match.awayTeam.name}...`,
    )

    const stats = await this.api.getMatchStatistics(match.externalId!)
    if (!stats || !stats.response?.stats) {
      return null
    }

    // ✅ Retorna as informações combinadas (times + estatísticas)
    return {
      match: {
        id: match.id,
        home: match.homeTeam.name,
        away: match.awayTeam.name,
        league: match.league.name,
        date: match.date,
      },
      stats: stats.response.stats,
    }
  }
}
