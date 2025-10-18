import 'dotenv/config'
import { ApiFootballService } from '../services/external-api/api-football-service'
import { prisma } from '../lib/prisma'

async function run() {
  const api = new ApiFootballService()

  console.log('📊 Iniciando sincronização de estatísticas de partidas...')

  const matches = await prisma.match.findMany({
    where: { status: 'finished' },
    include: { homeTeam: true, awayTeam: true },
  })

  for (const match of matches) {
    try {
      console.log(`⚽ Buscando estatísticas do jogo ${match.externalId}...`)

      const statsResponse = await api.getMatchStatistics(match.externalId!)
      if (!statsResponse?.length) continue

      const extract = (key: string) => {
        const section = statsResponse.flatMap((s: any) => s.stats || [])
        const item = section.find((s: any) => s.key === key)
        return item?.stats || [null, null]
      }

      const [homePoss, awayPoss] = extract('BallPossesion')
      const [homeXG, awayXG] = extract('expected_goals')
      const [homeShots, awayShots] = extract('ShotsOnTarget')
      const [homeCorners, awayCorners] = extract('corners')
      const [homeFouls, awayFouls] = extract('fouls')
      const [homeYellows, awayYellows] = extract('yellow_cards')
      const [homeReds, awayReds] = extract('red_cards')

      // Salvar estatísticas no banco
      await prisma.matchStat.upsert({
        where: {
          matchId_teamId: { matchId: match.id, teamId: match.homeTeamId },
        },
        update: {
          possession: Number(homePoss) || null,
          expectedGoals: Number(homeXG) || null,
          shotsOnTarget: Number(homeShots) || null,
          corners: Number(homeCorners) || null,
          yellowCards: Number(homeYellows) || null,
          redCards: Number(homeReds) || null,
          fouls: Number(homeFouls) || null,
        },
        create: {
          matchId: match.id,
          teamId: match.homeTeamId,
          possession: Number(homePoss) || null,
          expectedGoals: Number(homeXG) || null,
          shotsOnTarget: Number(homeShots) || null,
          corners: Number(homeCorners) || null,
          yellowCards: Number(homeYellows) || null,
          redCards: Number(homeReds) || null,
          fouls: Number(homeFouls) || null,
        },
      })

      await prisma.matchStat.upsert({
        where: {
          matchId_teamId: { matchId: match.id, teamId: match.awayTeamId },
        },
        update: {
          possession: Number(awayPoss) || null,
          expectedGoals: Number(awayXG) || null,
          shotsOnTarget: Number(awayShots) || null,
          corners: Number(awayCorners) || null,
          yellowCards: Number(awayYellows) || null,
          redCards: Number(awayReds) || null,
          fouls: Number(awayFouls) || null,
        },
        create: {
          matchId: match.id,
          teamId: match.awayTeamId,
          possession: Number(awayPoss) || null,
          expectedGoals: Number(awayXG) || null,
          shotsOnTarget: Number(awayShots) || null,
          corners: Number(awayCorners) || null,
          yellowCards: Number(awayYellows) || null,
          redCards: Number(awayReds) || null,
          fouls: Number(awayFouls) || null,
        },
      })

      console.log(
        `✅ Estatísticas sincronizadas para ${match.homeTeam.name} x ${match.awayTeam.name}`,
      )
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `❌ Erro ao processar jogo ${match.externalId}:`,
          error.message,
        )
      }
    }
  }

  console.log('🏁 Sincronização concluída.')
  await prisma.$disconnect()
}

run()
