import { FastifyReply, FastifyRequest } from 'fastify'
import { makePatternAnalysisUseCase } from '../../factories/make-pattern-analysis-use-case'

export class AnalysisController {
  async patterns(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { home, away, leagueId, eventId } = req.query as {
        home?: string
        away?: string
        leagueId?: string
        eventId?: string
      }

      if (!home || !away) {
        return reply
          .status(400)
          .send({ error: 'Parâmetros obrigatórios: home e away' })
      }

      console.log(`🔍 Analisando padrão: ${home} x ${away}`)

      const useCase = makePatternAnalysisUseCase()
      const report = await useCase.execute({ home, away, leagueId, eventId })

      return reply.send(report)
    } catch (err) {
      console.error('❌ Erro na análise de padrões:', err)
      return reply.status(500).send({ error: err.message })
    }
  }
}
