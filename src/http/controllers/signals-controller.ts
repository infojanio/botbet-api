import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'

export async function getSignals(_: FastifyRequest, reply: FastifyReply) {
  const signals = await prisma.signal.findMany({
    include: {
      match: {
        include: { homeTeam: true, awayTeam: true, league: true },
      },
    },
  })
  return reply.send({ status: 'success', data: signals })
}
