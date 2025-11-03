import 'dotenv/config'
import { prisma } from '../lib/prisma'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

async function run() {
  console.log('📊 Iniciando atualização dos resultados dos sinais...')

  // 🔹 Atualiza os últimos 3 dias (hoje, ontem e anteontem)
  const today = dayjs.utc().startOf('day')
  const startDate = today.subtract(3, 'day').toDate()
  const endDate = today.endOf('day').toDate()

  console.log(
    `📅 Intervalo: ${startDate.toISOString()} → ${endDate.toISOString()}`,
  )

  // 🔹 Busca sinais criados nos últimos 3 dias
  const signals = await prisma.signal.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      match: {
        status: {
          in: ['finished', 'FT', 'Full-Time', 'Match Finished', 'ended'],
        },
      },
    },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
          stats: true,
        },
      },
    },
  })

  console.log(`🔍 ${signals.length} sinais encontrados para conferência.`)

  if (signals.length === 0) {
    console.log('⚠️ Nenhum sinal encontrado para o período informado.')
    await prisma.$disconnect()
    return
  }

  for (const signal of signals) {
    const { match, type } = signal
    if (!match) continue

    const homeGoals = Number(match.homeScore ?? 0)
    const awayGoals = Number(match.awayScore ?? 0)
    const totalGols = homeGoals + awayGoals

    const homeStats = match.stats.find((s) => s.teamId === match.homeTeamId)
    const awayStats = match.stats.find((s) => s.teamId === match.awayTeamId)

    const totalEscanteios =
      (homeStats?.corners ?? 0) + (awayStats?.corners ?? 0)
    const totalCartoes =
      (homeStats?.yellowCards ?? 0) +
      (awayStats?.yellowCards ?? 0) +
      (homeStats?.redCards ?? 0) +
      (awayStats?.redCards ?? 0)
    const gols1T =
      (homeStats?.firstHalfGoals ?? 0) + (awayStats?.firstHalfGoals ?? 0)

    let result: 'green' | 'red' | 'void' = 'void'

    switch (type) {
      case 'OVER_2_5':
        result = totalGols >= 3 ? 'green' : 'red'
        break
      case 'BTTS_YES':
        result = homeGoals > 0 && awayGoals > 0 ? 'green' : 'red'
        break
      case 'FIRST_HALF_GOAL':
        result = gols1T >= 1 ? 'green' : 'red'
        break
      case 'CORNERS_OVER_8':
        result = totalEscanteios >= 9 ? 'green' : 'red'
        break
      case 'CARDS_OVER_4_5':
        result = totalCartoes >= 5 ? 'green' : 'red'
        break
      case 'OFFENSIVE_TREND':
        result = totalGols >= 3 ? 'green' : 'red'
        break
      case 'HOME_OR_DRAW':
        result = homeGoals >= awayGoals ? 'green' : 'red'
        break
      case 'AWAY_OR_DRAW':
        result = awayGoals >= homeGoals ? 'green' : 'red'
        break
      default:
        result = 'void'
        break
    }

    await prisma.signal.update({
      where: { id: signal.id },
      data: { result, status: 'checked' },
    })

    console.log(
      `✅ ${signal.league} | ${match.homeTeam.name} x ${
        match.awayTeam.name
      } | ${type} → ${result.toUpperCase()}`,
    )
  }

  console.log('🏁 Atualização de resultados concluída.')
  await prisma.$disconnect()
}

run()
