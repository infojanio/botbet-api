import 'dotenv/config'
import { ApiFootballService } from '../services/external-api/api-football-service'
import { PrismaLeagueRepository } from '../repositories/prisma/prisma-league-repository'
import { PrismaMatchRepository } from '../repositories/prisma/prisma-match-repository'
import { PrismaTeamRepository } from '../repositories/prisma/prisma-team-repository'
import { prisma } from '../lib/prisma'

async function run() {
  const api = new ApiFootballService()
  const leagueRepo = new PrismaLeagueRepository()
  const teamRepo = new PrismaTeamRepository()
  const matchRepo = new PrismaMatchRepository()

  console.log('🌍 Sincronizando ligas populares...')
  const leaguesResponse = await api.getPopularLeagues()

  const leagues =
    leaguesResponse?.response?.popular ||
    leaguesResponse?.data ||
    leaguesResponse ||
    []

  if (!Array.isArray(leagues) || leagues.length === 0) {
    console.warn(
      '⚠️ Nenhuma liga encontrada na resposta da API:',
      leaguesResponse,
    )
    return
  }

  for (const l of leagues) {
    const league = await leagueRepo.upsert({
      externalId: String(l.leagueid || l.id),
      name: l.name || l.league_name,
      country: l.country || 'Desconhecido',
      logo: l.logo || null,
      season: l.season || 2025,
    })

    console.log(`🏆 Liga sincronizada: ${league.name}`)
    console.log(`⚽ Buscando jogos da liga ${league.name}...`)

    const matchesResponse = await api.getMatchesByLeague(l.leagueid || l.id)
    const matches =
      matchesResponse?.response?.matches ||
      matchesResponse?.data ||
      matchesResponse ||
      []

    if (!Array.isArray(matches) || matches.length === 0) {
      console.warn(`⚠️ Nenhum jogo encontrado para ${league.name}`)
      continue
    }

    console.log(`📊 Estrutura do primeiro jogo recebido:`, matches[0])

    for (const m of matches) {
      // ⚠️ Ignora partidas sem times definidos
      if (!m.home?.id || !m.away?.id) {
        console.warn(`⚠️ Partida ignorada por dados incompletos:`, m)
        continue
      }

      // 🔹 Cria ou atualiza time mandante
      const home = await teamRepo.upsert({
        externalId: Number(m.home.id),
        name: m.home.name,
        logo: null,
        country: league.country,
        leagueId: league.id,
      })

      // 🔹 Cria ou atualiza time visitante
      const away = await teamRepo.upsert({
        externalId: Number(m.away.id),
        name: m.away.name,
        logo: null,
        country: league.country,
        leagueId: league.id,
      })

      // 🔹 Cria ou atualiza partida
      await matchRepo.upsert({
        externalId: Number(m.id),
        date: new Date(m.status.utcTime),
        leagueId: league.id,
        homeTeamId: home.id,
        awayTeamId: away.id,
        status: m.status.reason?.long || 'scheduled',
        homeScore: m.home.score ?? null,
        awayScore: m.away.score ?? null,
      })
    }
  }

  console.log('✅ Sincronização concluída.')
  await prisma.$disconnect()
  process.exit(0)
}

run().catch(async (err) => {
  console.error('❌ Erro na sincronização:', err)
  await prisma.$disconnect()
  process.exit(1)
})
