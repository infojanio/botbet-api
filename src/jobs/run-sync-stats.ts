import 'dotenv/config'
import { ApiFootballService } from '../services/external-api/api-football-service'
import { prisma } from '../lib/prisma'

async function run() {
  const api = new ApiFootballService()
  console.log(
    '📊 Iniciando sincronização de estatísticas de partidas finalizadas (últimos 3 dias)...',
  )

  // Considera apenas partidas finalizadas nos últimos 3 dias
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const matches = await prisma.match.findMany({
    where: {
      status: { in: ['finished', 'FT', 'Full-Time', 'ended'] },
      date: { gte: threeDaysAgo },
    },
    include: { homeTeam: true, awayTeam: true },
  })

  console.log(
    `🔍 ${matches.length} partidas encontradas finalizadas nos últimos 3 dias.`,
  )

  for (const match of matches) {
    try {
      console.log(`⚽ Buscando estatísticas do jogo ${match.externalId}...`)

      const statsResponse = await api.getMatchStatistics(match.externalId!)
      const statsArray = statsResponse?.response?.stats

      if (!Array.isArray(statsArray) || statsArray.length === 0) {
        console.warn(
          `⚠️ Nenhuma estatística encontrada para ${match.externalId}`,
        )
        continue
      }

      /**
       * 🔍 Função genérica para buscar estatísticas por key
       * Varre todas as seções (Top stats, Attack, Discipline, etc.)
       */
      const extract = (key: string): [number | null, number | null] => {
        for (const section of statsArray) {
          const statItem = section.stats?.find(
            (s: any) => s.key?.toLowerCase() === key.toLowerCase(),
          )
          if (statItem?.stats && Array.isArray(statItem.stats)) {
            const normalize = (v: any) => {
              const n = parseFloat(String(v).replace('%', '').trim())
              return isNaN(n) ? null : n
            }
            const [home, away] = statItem.stats
            return [normalize(home), normalize(away)]
          }
        }
        return [null, null]
      }

      // 🧩 Extrai dados principais
      const [homePoss, awayPoss] = extract('BallPossesion')
      const [homeShots, awayShots] = extract('ShotsOnTarget')
      const [homeCorners, awayCorners] = extract('corners')
      const [homeFouls, awayFouls] = extract('fouls')

      // 🧠 Novos campos adicionais
      const [homeXG, awayXG] =
        extract('expected_goals')[0] !== null
          ? extract('expected_goals')
          : extract('xG') // fallback

      const [homeYellows, awayYellows] = extract('yellow_cards')
      const [homeReds, awayReds] = extract('red_cards')

      const [home1TGoals, away1TGoals] =
        extract('first_half_goals')[0] !== null
          ? extract('first_half_goals')
          : extract('1st_half_goals')

      // ✅ Atualiza ou cria estatísticas no banco
      await prisma.matchStat.upsert({
        where: {
          matchId_teamId: { matchId: match.id, teamId: match.homeTeamId },
        },
        update: {
          possession: homePoss,
          expectedGoals: homeXG,
          shotsOnTarget: homeShots,
          corners: homeCorners,
          yellowCards: homeYellows,
          redCards: homeReds,
          fouls: homeFouls,
          firstHalfGoals: home1TGoals,
        },
        create: {
          matchId: match.id,
          teamId: match.homeTeamId,
          possession: homePoss,
          expectedGoals: homeXG,
          shotsOnTarget: homeShots,
          corners: homeCorners,
          yellowCards: homeYellows,
          redCards: homeReds,
          fouls: homeFouls,
          firstHalfGoals: home1TGoals,
        },
      })

      await prisma.matchStat.upsert({
        where: {
          matchId_teamId: { matchId: match.id, teamId: match.awayTeamId },
        },
        update: {
          possession: awayPoss,
          expectedGoals: awayXG,
          shotsOnTarget: awayShots,
          corners: awayCorners,
          yellowCards: awayYellows,
          redCards: awayReds,
          fouls: awayFouls,
          firstHalfGoals: away1TGoals,
        },
        create: {
          matchId: match.id,
          teamId: match.awayTeamId,
          possession: awayPoss,
          expectedGoals: awayXG,
          shotsOnTarget: awayShots,
          corners: awayCorners,
          yellowCards: awayYellows,
          redCards: awayReds,
          fouls: awayFouls,
          firstHalfGoals: away1TGoals,
        },
      })

      console.log(
        `✅ Estatísticas salvas para ${match.homeTeam.name} x ${match.awayTeam.name}`,
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
