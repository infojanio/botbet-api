import { FastifyRequest, FastifyReply } from 'fastify'
import { makeGetUpcomingMatchesAnalysis } from '../../factories/make-get-upcoming-matches-analysis'

/**
 * Controller responsável por retornar partidas com suas análises
 * Se for passado um parâmetro de data (?date=YYYY-MM-DD), filtra por essa data.
 * Caso contrário, retorna partidas de hoje e amanhã.
 */
export async function getMatchesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = makeGetUpcomingMatchesAnalysis()

    // Query opcional: ?date=YYYY-MM-DD
    const query = request.query as { date?: string }
    const fromDate = query?.date ? new Date(query.date) : undefined

    const result = await useCase.execute(fromDate)

    if (!result.length) {
      return reply.status(200).send({
        success: true,
        message: fromDate
          ? `Nenhuma partida encontrada para ${query.date}.`
          : 'Nenhuma partida encontrada para hoje ou amanhã.',
        total: 0,
        data: [],
      })
    }

    return reply.status(200).send({
      success: true,
      message: fromDate
        ? `Partidas e análises encontradas para ${query.date}.`
        : 'Partidas e análises de hoje e amanhã geradas com sucesso.',
      total: result.length,
      data: result,
    })
  } catch (err) {
    console.error('❌ Erro no getMatchesController:', err)
    return reply.status(500).send({
      success: false,
      message: 'Erro interno ao buscar partidas.',
    })
  }
}
