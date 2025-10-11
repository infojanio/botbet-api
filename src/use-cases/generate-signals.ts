import { ApiFootballService } from '../services/api-football-service'
import { PatternAnalyzerService } from '../services/pattern-analyzer-service'
import { prisma } from '../db/prisma'

export class GenerateSignalsUseCase {
  constructor(
    private api = new ApiFootballService(),
    private analyzer = new PatternAnalyzerService(),
  ) {}

  async execute({ league, limit }: { league?: string; limit?: number }) {
    const date = new Date().toISOString().split('T')[0]
    const fixtures = await this.api.getFixturesByDate(date, league)

    const signalsToCreate: any[] = []

    for (const fixture of fixtures.slice(0, limit || 10)) {
      const eventId = fixture.event_id || fixture.event_key
      if (!eventId) continue

      const home = fixture.home_name
      const away = fixture.away_name
      const matchId = String(eventId)
      const leagueName = fixture.league_name || league || 'Desconhecida'

      // garante que o Match existe
      const match = await prisma.match.upsert({
        where: { id: matchId },
        update: {},
        create: {
          id: matchId,
          dateUtc: new Date(fixture.date || Date.now()),
          competition: leagueName,
          status: fixture.status || 'SCHEDULED',
          homeTeam: {
            connectOrCreate: {
              where: { id: String(fixture.home_id || home) },
              create: { id: String(fixture.home_id || home), name: home },
            },
          },
          awayTeam: {
            connectOrCreate: {
              where: { id: String(fixture.away_id || away) },
              create: { id: String(fixture.away_id || away), name: away },
            },
          },
        },
      })

      // cálculos de probabilidade com Poisson
      const { expHome, expAway } = this.analyzer.adjustByContext(
        {
          name: home,
          side: 'HOME',
          avgGoalsFor: 1.3,
          avgGoalsAgainst: 1.1,
          strength: 1.0,
        },
        {
          name: away,
          side: 'AWAY',
          avgGoalsFor: 1.1,
          avgGoalsAgainst: 1.2,
          strength: 1.0,
        },
      )

      const pOver25 = this.analyzer.probOver25(expHome, expAway)
      const pBTTS = this.analyzer.probBTTS(expHome, expAway)
      const confidence = Math.floor(
        this.analyzer.confidenceScore(pOver25, pBTTS, 0.5, 1) * 100,
      )

      // 🎯 monta sinais com base no modelo Signal
      signalsToCreate.push(
        {
          matchId: match.id,
          market: 'GOALS',
          line: 2.5,
          selection: 'OVER',
          modelProb: pOver25,
          impliedProb: 0, // sem odds aqui
          edge: 0,
          confidence,
          reason: 'Modelo Poisson: Over 2.5',
        },
        {
          matchId: match.id,
          market: 'BTTS',
          line: 0,
          selection: 'YES',
          modelProb: pBTTS,
          impliedProb: 0,
          edge: 0,
          confidence,
          reason: 'Ambas marcam com prob. combinada',
        },
      )
    }

    if (signalsToCreate.length) {
      await prisma.signal.createMany({ data: signalsToCreate })
    }

    return signalsToCreate
  }
}
