import { IExternalApiService } from "../repositories/interfaces/IExternalApiService"
import { ISignalRepository } from "../repositories/interfaces/ISignalRepository"
import { IMatchRepository } from "../repositories/interfaces/IMatchRepository"

type Params = {
  maxMinute?: number      // ex: 20
  minGoals?: number       // ex: 3
  maxFavOdd?: number      // ex: 1.60
}

export class GenerateLiveEarlyGoalsSignalsUseCase {
  constructor(
    private apiService: IExternalApiService,
    private signalRepo: ISignalRepository,
    private matchRepo: IMatchRepository,
  ) {}

  private pickFavoriteOdd(bets: any[]): { side: "Home"|"Away"|"Draw"|null, price: number|null } {
    // Procura mercado de vencedor (1X2). Nomes comuns no API-FOOTBALL: "Match Winner", "1X2"
    const bet = bets.find((b: any) =>
      /match winner|1x2/i.test(b.name)
    )
    if (!bet) return { side: null, price: null }

    const map: Record<string,"Home"|"Away"|"Draw"|undefined> = {
      "Home": "Home", "1": "Home",
      "Away": "Away", "2": "Away",
      "Draw": "Draw", "X": "Draw"
    }
    let best: { side: "Home"|"Away"|"Draw"|null, price: number|null } = { side: null, price: null }
    for (const v of bet.values || []) {
      const side = map[v.value]
      const price = parseFloat(v.odd)
      if (!side || !price || Number.isNaN(price)) continue
      if (best.price === null || price < best.price) {
        best = { side, price }
      }
    }
    return best
  }

  async execute(params: Params = {}) {
    const maxMinute = params.maxMinute ?? 20
    const minGoals  = params.minGoals  ?? 3
    const maxFavOdd = params.maxFavOdd ?? 1.60

    console.log(`🎯 Live strategy: <=${maxMinute}’ & goals>=${minGoals} & favOdd<=${maxFavOdd}`)

    const live = await this.apiService.getLiveMatches()
    console.log(`📡 Live fixtures: ${live.length}`)

    for (const m of live) {
      try {
        const minute = m.fixture?.status?.elapsed ?? 0
        const home   = m.teams?.home
        const away   = m.teams?.away
        const gHome  = m.goals?.home ?? 0
        const gAway  = m.goals?.away ?? 0
        const totalG = gHome + gAway

        if (minute > maxMinute || totalG < minGoals) continue

        // upsert do jogo (garante FK do signal)
        await this.matchRepo.upsert({
          id: String(m.fixture.id),
          dateUtc: new Date(m.fixture.date),
          status: m.fixture.status.short,
          competition: m.league?.name ?? "Unknown",
          homeTeam: { id: String(home?.id), name: home?.name },
          awayTeam: { id: String(away?.id), name: away?.name },
        })

        // Odds ao vivo (1X2) para achar o favorito
        const odds = await this.apiService.getLiveOdds(m.fixture.id)
        if (!odds?.length) {
          console.log(`ℹ️ Sem live odds p/ fixture ${m.fixture.id}; pulando.`)
          continue
        }

        // Estrutura típica: [{bookmakers:[{bets:[{name, values:[{value, odd}]}]}]}]
        let favoritePrice: number | null = null
        for (const market of odds) {
          for (const bm of market.bookmakers || []) {
            const fav = this.pickFavoriteOdd(bm.bets || [])
            if (fav.price && (favoritePrice === null || fav.price < favoritePrice)) {
              favoritePrice = fav.price
            }
          }
        }

        if (favoritePrice === null || favoritePrice > maxFavOdd) continue

        // Heurística simples de probabilidade para Over 4.5 dado início “quente”
        const pace = totalG / Math.max(1, minute) // gols por minuto
        const projected = totalG + pace * (90 - minute) * 0.6
        const modelProb = Math.max(0.6, Math.min(0.95, 0.7 + 0.2 * Math.max(0, projected - 4.5) / 2))
        const impliedProb = 1 / favoritePrice
        const edge = modelProb - impliedProb
        const confidence = Math.round(modelProb * 100)

        await this.signalRepo.create({
          matchId: String(m.fixture.id),
          market: "LIVE",
          line: 4.5,
          selection: "Over",
          modelProb,
          impliedProb,
          edge,
          confidence,
          reason: `AO VIVO: ${totalG} gols até ${minute}’ | favorito @${favoritePrice.toFixed(2)}`,
        })

        console.log(
          `🔥 LIVE sinal: ${home?.name} x ${away?.name} | ${totalG}g aos ${minute}’ | fav @${favoritePrice?.toFixed(2)} | prob ${(modelProb*100).toFixed(1)}%`
        )
      } catch (e) {
        console.error(`❌ Erro em fixture live ${m.fixture?.id}:`, e)
      }
    }

    console.log("✅ Live strategy concluída.")
  }
}
