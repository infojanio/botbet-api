import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function run() {
  console.log('📊 Iniciando atualização dos resultados dos sinais...')

  // 🔹 Busca todos os sinais pendentes e com partida finalizada
  const signals = await prisma.signal.findMany({
    where: {
      status: 'pending',
      match: {
        status: { in: ['finished', 'FT', 'Full-Time', 'ended'] },
      },
    },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
          stats: true, // tabela MatchStat
        },
      },
    },
  })

  console.log(`🔍 ${signals.length} sinais encontrados para conferência.`)

  for (const signal of signals) {
    const { match, type } = signal
    if (!match) continue

    const homeGoals = Number(match.homeScore ?? 0)
    const awayGoals = Number(match.awayScore ?? 0)
    const totalGols = homeGoals + awayGoals

    // 🔹 Estatísticas adicionais do MatchStat
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

    // 🔸 Determina o resultado
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
