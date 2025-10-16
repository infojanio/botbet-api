// src/http/controllers/match-discipline-controller.ts

import { FastifyReply, FastifyRequest } from 'fastify'
import { ApiFootballService } from '../../services/external-api/api-football-service'
import { makeGenerateDisciplineSignalUseCase } from '../../factories/make-generate-discipline-signal-use-case'

export async function getMatchDisciplineAnalysis(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const api = new ApiFootballService()

  const statsData = await api.getMatchStatistics(id)
  const stats = statsData.response?.statistics

  if (!stats || stats.length === 0) {
    return reply.status(404).send({ status: 'error', message: 'Estatísticas não disponíveis' })
  }

  // adaptando a estrutura da API
  const homeStats = {
    corners: stats.find((s: any) => s.title === 'Corner Kicks')?.home || 0,
    yellowCards: stats.find((s: any) => s.title === 'Yellow Cards')?.home || 0,
    redCards: stats.find((s: any) => s.title === 'Red Cards')?.home || 0,
  }

  const awayStats = {
    corners: stats.find((s: any) => s.title === 'Corner Kicks')?.away || 0,
    yellowCards: stats.find((s: any) => s.title === 'Yellow Cards')?.away || 0,
    redCards: stats.find((s: any) => s.title === 'Red Cards')?.away || 0,
  }

  // gerar e salvar os sinais
  const useCase = makeGenerateDisciplineSignalUseCase()
  const signals = await useCase.execute({
    matchId: Number(id),
    homeStats,
    awayStats,
  })

  return reply.send({
    status: 'success',
    matchId: id,
    summary: { homeStats, awayStats },
    signals,
  })
}
