import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { prisma } from '../../lib/prisma'

dayjs.extend(utc)

export class PrismaMatchRepository {
  async upsert(data: {
    externalId: string | number
    date: Date
    leagueId: number
    homeTeamId: number
    awayTeamId: number
    status: string
    homeScore?: number | null
    awayScore?: number | null
  }) {
    return prisma.match.upsert({
      where: { externalId: Number(data.externalId) },
      update: {
        date: data.date,
        leagueId: data.leagueId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        status: data.status,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
      },
      create: {
        externalId: Number(data.externalId),
        date: data.date,
        leagueId: data.leagueId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        status: data.status,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
      },
    })
  }

  async findById(id: number) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        stats: true,
        league: true,
        signals: true,
      },
    })
  }

  /**
   * Retorna partidas de uma data específica (00:00 até 23:59)
   */
  async findByDate(date: Date) {
    const startOfDay = dayjs(date).utc().startOf('day').toDate()
    const endOfDay = dayjs(date).utc().endOf('day').toDate()

    return prisma.match.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'scheduled',
      },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        signals: true,
      },
      orderBy: { date: 'asc' },
    })
  }

  /**
   * Retorna partidas de HOJE e AMANHÃ (status 'scheduled')
   */
  async findUpcoming(params?: { limit?: number }) {
    const today = dayjs()
    const startOfDay = today.startOf('day').toDate()
    const endOfTomorrow = today.add(1, 'day').endOf('day').toDate()

    console.log('🕒 [findUpcoming] Intervalo de busca:')
    console.log('   Início:', startOfDay)
    console.log('   Fim   :', endOfTomorrow)

    const matches = await prisma.match.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfTomorrow,
        },
        status: {
          in: [
            'scheduled',
            'NS',
            'not_started',
            'upcoming',
            'fixture',
            'Not Started',
          ],
        },
      },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        signals: true,
      },
      orderBy: { date: 'asc' },
      take: params?.limit ?? 50,
    })

    console.log(`📊 [findUpcoming] ${matches.length} partida(s) encontrada(s).`)

    if (matches.length > 0) {
      console.table(
        matches.map((m) => ({
          id: m.id,
          status: m.status,
          date: m.date,
          league: m.league?.name,
        })),
      )
    } else {
      console.log(
        '⚠️ Nenhuma partida encontrada dentro do intervalo e status especificados.',
      )
    }

    return matches
  }
}
