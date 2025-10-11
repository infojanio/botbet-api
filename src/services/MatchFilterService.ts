import { ApiFootballService } from './api-football-service'
import { IMatchCacheRepository } from '../repositories/interfaces/IMatchCacheRepository'

interface MatchFilterInput {
  date: string
  maxOdd: number
  league?: string
}

export class MatchFilterService {
  constructor(
    private api: ApiFootballService,
    private matchCacheRepository: IMatchCacheRepository,
  ) {}

  async execute({ date, maxOdd, league }: MatchFilterInput) {
    console.log(`🏆 Buscando jogos: ${league || 'todas'} | Data: ${date}`)

    const cached = await this.matchCacheRepository.findByDate(new Date(date))
    if (cached.length > 0) {
      console.log(`💾 ${cached.length} jogos encontrados em cache`)
      return cached.filter((m) => m.lowestOdd && m.lowestOdd <= maxOdd)
    }

    const fixtures = await this.api.getFixturesByDate(date, league)
    console.log(`📅 ${fixtures.length} jogos retornados pela API`)

    const jogosComOdds = []

    for (const fixture of fixtures) {
      const eventId = fixture.event_id || fixture.event_key || fixture.id
      if (!eventId) {
        console.warn(
          '⚠️ Event ID ausente, pulando jogo:',
          fixture.home_name,
          'x',
          fixture.away_name,
        )
        continue
      }

      const odds = await this.api.getOdds(eventId)

      const oddHome = odds?.[0]?.odd || 0
      const oddAway = odds?.[2]?.odd || 0
      const lowest = Math.min(oddHome || 99, oddAway || 99)

      if (lowest <= maxOdd) {
        jogosComOdds.push({
          eventId: String(eventId),
          date: new Date(fixture.date),
          league: fixture.league_name,
          homeTeam: fixture.home_name,
          awayTeam: fixture.away_name,
          status: fixture.status,
          lowestOdd: lowest,
          rawData: fixture,
        })
      }
    }

    if (jogosComOdds.length > 0) {
      await this.matchCacheRepository.createMany(jogosComOdds)
    }

    console.log(
      `✅ ${jogosComOdds.length} jogos encontrados com odd <= ${maxOdd}`,
    )
    return jogosComOdds
  }
}
