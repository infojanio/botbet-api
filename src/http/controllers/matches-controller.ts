import { FastifyReply, FastifyRequest } from 'fastify'
import { makeGetMatches } from '../../factories/make-get-matches'
import { makeGetMatchDetails } from '../../factories/make-get-match-details'
import { makeFilterMatchesUseCase } from '../../factories/make-filter-matches'

export class MatchesController {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const { from, to, market, minProb, limit } = req.query as any
    const useCase = makeGetMatches()
    const result = await useCase.execute({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      market,
      minProb: minProb ? parseFloat(minProb) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    })
    return reply.send(result)
  }

  async details(req: FastifyRequest, reply: FastifyReply) {
    const { id } = req.params as { id: string }
    const useCase = makeGetMatchDetails()
    const result = await useCase.execute(id)
    if (!result) return reply.status(404).send({ error: 'Match not found' })
    return reply.send(result)
  }

  // ✅ Novo método: Filtra jogos por data e odd
  async filterMatches(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { date, odd, league } = req.query as {
        date?: string
        odd?: string
        league?: string
      }

      // Validação robusta de parâmetros
      if (!date || !odd) {
        return reply.status(400).send({
          error: 'Parâmetros obrigatórios: date (YYYY-MM-DD) e odd máxima.',
        })
      }

      // Confirma formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(date)) {
        return reply.status(400).send({
          error: 'Formato inválido de data. Use YYYY-MM-DD (ex: 2025-10-12).',
        })
      }

      console.log(
        `⚙️ Iniciando filtro de jogos: data=${date}, odd<=${odd}, liga=${
          league || 'todas'
        }`,
      )

      const useCase = makeFilterMatchesUseCase()
      const matches = await useCase.execute({
        date,
        maxOdd: parseFloat(odd),
        league,
      })

      if (!matches.length) {
        return reply.status(404).send({
          message: 'Nenhum jogo encontrado para os critérios informados.',
        })
      }

      console.log(`✅ ${matches.length} jogos encontrados com odd <= ${odd}`)
      return reply.send(matches)
    } catch (error) {
      console.error('❌ Erro ao filtrar partidas:', error)
      return reply.status(500).send({ error: error.message })
    }
  }
}
