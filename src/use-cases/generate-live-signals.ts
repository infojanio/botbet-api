import { IExternalApiService } from "../repositories/interfaces/IExternalApiService"
import { ISignalRepository } from "../repositories/interfaces/ISignalRepository"
import { IMatchRepository } from "../repositories/interfaces/IMatchRepository"

export class GenerateLiveSignalsUseCase {
  constructor(
    private apiService: IExternalApiService,
    private signalRepo: ISignalRepository,
    private matchRepo: IMatchRepository,
  ) {}

  async execute() {
    console.log("🎯 Iniciando varredura de jogos ao vivo...")

    const liveMatches = await this.apiService.getLiveMatches()
    console.log(`📡 ${liveMatches.length} jogos em andamento detectados.`)

    for (const m of liveMatches) {
      const home = m.teams.home
      const away = m.teams.away
      const homeGoals = m.goals?.home ?? 0
      const awayGoals = m.goals?.away ?? 0
      const totalGoals = homeGoals + awayGoals

      // Simula tempo de jogo (para teste, usando diferença de horário)
      const startTime = new Date(m.fixture.date).getTime()
      const now = Date.now()
      const minutes = Math.floor((now - startTime) / 60000)

      // Simula odd favorita (mock)
      const oddFavorito = 1.40 + Math.random() * 0.15

      if (oddFavorito < 1.6 && totalGoals >= 3 && minutes <= 20) {
        await this.signalRepo.create({
          matchId: String(m.fixture.id),
          market: "LIVE",
          line: 4.5,
          selection: "Over",
          modelProb: 0.85,
          impliedProb: 1 / oddFavorito,
          edge: 0.25,
          confidence: 95,
          reason: `Favorito com odd ${oddFavorito.toFixed(
            2,
          )}, ${totalGoals} gols até ${minutes}min`,
        })

        console.log(
          `🔥 Sinal LIVE: ${home.name} x ${away.name} — ${totalGoals} gols (${minutes}min) | Odd ${oddFavorito.toFixed(
            2,
          )}`,
        )
      }
    }

    console.log("✅ Varredura de jogos ao vivo concluída.")
  }
}
