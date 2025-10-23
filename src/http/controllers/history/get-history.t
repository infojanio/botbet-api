import { FastifyInstance } from 'fastify'
import { prisma } from '../../../lib/prisma'

export async function historyRoutes(app: FastifyInstance) {
  app.get('/signals/history', async (req, reply) => {
    const history = await prisma.signalHistory.findMany({
      orderBy: { date: 'desc' },
      take: 7,
    })

    return reply.status(200).send({
      totalDays: history.length,
      averageAccuracy: Number(
        (
          history.reduce((acc, h) => acc + h.accuracy, 0) / history.length
        ).toFixed(2),
      ),
      history,
    })
  })
}