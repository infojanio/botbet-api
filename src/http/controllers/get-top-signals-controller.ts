import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../lib/prisma'

export async function getTopSignalsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const matches = await prisma.match.findMany({
      where: {
        trendScore: { not: null },
      },
      orderBy: {
        trendScore: 'desc',
      },
      take: 10,
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        signals: true,
      },
    })

    const result = matches.map((m) => ({
      matchId: m.id,
      league: m.league.name,
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      trendScore: m.trendScore?.toFixed(1),
      signals: m.signals.map((s) => ({
        type: s.type,
        confidence: s.confidence,
        description: s.description,
        status: s.status,
      })),
    }))

    return reply.status(200).send({
      status: 'success',
      total: result.length,
      matches: result,
    })
  } catch (err) {
    console.error('❌ Erro ao buscar top sinais:', err)
    return reply.status(500).send({
      status: 'error',
      message: 'Erro interno ao buscar sinais',
    })
  }
}
