import { IExternalApiService } from '../repositories/interfaces/IExternalApiService'
import { IMatchRepository } from '../repositories/interfaces/IMatchRepository'
import { ISignalRepository } from '../repositories/interfaces/ISignalRepository'
import { IStatsRepository } from '../repositories/interfaces/IStatsRepository'

// Funções auxiliares
function factorial(n: number): number {
  return n <= 1 ? 1 : n * factorial(n - 1)
}

function poissonProbabilityOver(lambda: number, line: number): number {
  let prob = 0
  const max = Math.floor(line) // até a linha (ex: 2 para Over 2.5)

  for (let k = 0; k <= max; k++) {
    prob += (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)
  }
  return 1 - prob // chance de passar da linha
}

export class GenerateSignalsUseCase {
  constructor(
    private apiService: IExternalApiService,
    private matchRepo: IMatchRepository,
    private signalRepo: ISignalRepository,
    private statsRepo: IStatsRepository,
  ) {}

  async execute(leagueId: number, season: number, limit: number = 5) {
    console.log('🚀 Iniciando job de geração de sinais...')

    const upcoming = await this.apiService.getUpcomingMatches(leagueId, season, limit)
    console.log(`📊 API retornou ${upcoming.length} jogos.`)

    for (const m of upcoming) {
      const home = m.teams.home
      const away = m.teams.away

      // Salva sempre os times e o jogo
      const match = await this.matchRepo.upsert({
        id: String(m.fixture.id),
        dateUtc: new Date(m.fixture.date),
        status: m.fixture.status.short,
        competition: m.league.name,
        homeTeam: { id: String(home.id), name: home.name },
        awayTeam: { id: String(away.id), name: away.name },
      })

      console.log(`⚽ Jogo salvo: ${home.name} x ${away.name}`)

      // Buscar últimos jogos do time da casa e visitante
      const homeMatches = await this.apiService.getRecentMatches(home.id, 5)
      const awayMatches = await this.apiService.getRecentMatches(away.id, 5)

      const avgGoalsHome =
        homeMatches.reduce((a, b) => a + (b.goals?.home ?? 0) + (b.goals?.away ?? 0), 0) /
        (homeMatches.length || 1)

      const avgGoalsAway =
        awayMatches.reduce((a, b) => a + (b.goals?.home ?? 0) + (b.goals?.away ?? 0), 0) /
        (awayMatches.length || 1)

      const avgGoals = (avgGoalsHome + avgGoalsAway) / 2

      // Modelo Poisson: probabilidade Over 2.5 gols
      const modelProbGoals = poissonProbabilityOver(avgGoals, 2.5)

      // Mock para escanteios (sem endpoint de corners detalhado no plano free, podemos assumir média ~10)
      const avgCorners = 10
      const modelProbCorners = poissonProbabilityOver(avgCorners, 9.5)

      // Buscar odds do jogo
      const oddsData = await this.apiService.getOdds(m.fixture.id)
      console.log(`   → Odds retornadas: ${oddsData.length}`)

      if (!oddsData.length) {
        console.warn(`⚠️ Sem odds para jogo ${match.id}`)
        continue
      }

      // Processar odds e comparar com modelo
      for (const market of oddsData) {
        for (const b of market.bookmakers) {
          for (const bet of b.bets) {
            if (bet.name !== 'Match Goals' && bet.name !== 'Corners') continue

            for (const o of bet.values) {
              const selection = o.value
              const price = parseFloat(o.odd)
              const impliedProb = 1 / price

              let modelProb = 0
              if (bet.name === 'Match Goals' && parseFloat(o.handicap ?? '0') === 2.5) {
                modelProb = modelProbGoals
              }
              if (bet.name === 'Corners' && parseFloat(o.handicap ?? '0') === 9.5) {
                modelProb = modelProbCorners
              }

              const edge = modelProb - impliedProb

              if (edge < 0.06) continue

              await this.signalRepo.create({
                matchId: match.id,
                market: bet.name === 'Match Goals' ? 'GOALS' : 'CORNERS',
                line: parseFloat(o.handicap ?? '0'),
                selection,
                modelProb,
                impliedProb,
                edge,
                confidence: Math.floor(modelProb * 100),
                reason: 'Poisson calculation (últimos jogos)',
              })

              console.log(
                `✅ Sinal criado: ${bet.name} ${o.handicap} ${selection} @${price} (Prob=${(
                  modelProb * 100
                ).toFixed(1)}%)`,
              )
            }
          }
        }
      }
    }
  }
}
