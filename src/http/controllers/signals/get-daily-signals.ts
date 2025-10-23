import { prisma } from '../../../lib/prisma'
import dayjs from 'dayjs'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function getDailySignals(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { date, result } = request.query as {
      date?: string
      result?: string
    }

    // 📅 Usa a data de hoje se nenhuma for passada
    const selectedDate = date ? dayjs(date) : dayjs()
    const startOfDay = selectedDate.startOf('day').toDate()
    const endOfDay = selectedDate.endOf('day').toDate()

    // 🔹 Busca sinais do dia, com filtro opcional por resultado
    const signals = await prisma.signal.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(result ? { result } : {}),
      },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true,
            league: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = signals.map((s) => ({
      id: s.id,
      type: s.type,
      confidence: Number(s.confidence?.toFixed(1)),
      description: s.description,
      result: s.result,
      status: s.status,
      league: s.match?.league?.name ?? 'Desconhecida',
      match: `${s.match?.homeTeam?.name ?? 'N/A'} x ${
        s.match?.awayTeam?.name ?? 'N/A'
      }`,
      date: s.match?.date,
    }))

    return reply.status(200).send({
      status: 'success',
      total: formatted.length,
      date: selectedDate.format('YYYY-MM-DD'),
      resultFilter: result ?? 'all',
      signals: formatted,
    })
  } catch (error) {
    console.error('❌ Erro ao listar sinais do dia:', error)
    return reply
      .status(500)
      .send({ status: 'error', message: 'Erro ao listar sinais' })
  }
}
