// src/http/controllers/match-analysis-controller.ts

import { FastifyReply, FastifyRequest } from 'fastify'
import { ApiFootballService } from '../../services/external-api/api-football-service'
import { makeGenerateSignalUseCase } from '../../factories/make-generate-signals'

export async function getMatchAnalysis(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  const api = new ApiFootballService()

  const matchData = await api.getMatchDetails(id)
  const match = matchData.response?.match

  if (!match) {
    return reply.status(404).send({ status: 'error', message: 'Partida não encontrada' })
  }

  const homeId = match.home.id
  const awayId = match.away.id

  const [h2h, lastHome, lastAway] = await Promise.all([
    api.getHeadToHead(homeId, awayId),
    api.getRecentMatches(homeId),
    api.getRecentMatches(awayId),
  ])

  const avgGoalsHome = averageGoals(lastHome.response)
  const avgGoalsAway = averageGoals(lastAway.response)
  const avgH2HGoals = averageGoals(h2h.response)

  const signalData = generateSignal(avgGoalsHome, avgGoalsAway, avgH2HGoals)

  // 🔹 Salva no banco
  const generateSignalUseCase = makeGenerateSignalUseCase()
  const savedSignal = await generateSignalUseCase.execute({
    matchId: Number(id),
    type: signalData.type,
    confidence: parseFloat(signalData.confidence),
    description: signalData.reasoning,
  })

  return reply.send({
    status: 'success',
    match: {
      id,
      league: match.league?.name,
      home: match.home?.name,
      away: match.away?.name,
      score: match.status?.scoreStr,
      status: match.status?.liveTime?.short,
    },
    analysis: {
      avgGoalsHome,
      avgGoalsAway,
      avgH2HGoals,
      signal: signalData,
      saved: savedSignal,
    },
  })
}

function averageGoals(matches: any[]) {
  if (!matches || matches.length === 0) return 0
  const total = matches.reduce(
    (sum, m) => sum + ((m.home?.score || 0) + (m.away?.score || 0)),
    0
  )
  return (total / matches.length).toFixed(2)
}

function generateSignal(homeAvg: any, awayAvg: any, h2hAvg: any) {
  const avg = (parseFloat(homeAvg) + parseFloat(awayAvg) + parseFloat(h2hAvg)) / 3
  let probability = 0
  let type = 'under'

  if (avg >= 3) {
    probability = 85
    type = 'over 2.5'
  } else if (avg >= 2) {
    probability = 70
    type = 'over 1.5'
  } else if (avg < 1) {
    probability = 65
    type = 'under 2.5'
  }

  return {
    type,
    confidence: probability.toFixed(0),
    reasoning: `Média de gols recentes (${avg.toFixed(2)}) indica ${type} (${probability}%)`,
  }
}
