import { IExternalApiService } from "../repositories/interfaces/IExternalApiService";
import { ISignalRepository } from "../repositories/interfaces/ISignalRepository";
import { IMatchRepository } from "../repositories/interfaces/IMatchRepository";

export class GenerateLiveSignalsUseCase {
  constructor(
    private apiService: IExternalApiService,
    private signalRepo: ISignalRepository,
    private matchRepo: IMatchRepository
  ) {}

  async execute() {
    console.log("📡 Buscando partidas ao vivo...");
    const liveMatches = await this.apiService.getLiveMatches();

    for (const m of liveMatches) {
      const gHome = m.home?.score ?? 0;
      const gAway = m.away?.score ?? 0;
      const totalG = gHome + gAway;

      if (totalG >= 4) {
        await this.matchRepo.upsert({
          externalId: m.id,
          date: new Date(m.status.utcTime),
          status: "live",
          leagueId: m.leagueId ?? 0,
          homeTeamId: m.home.id,
          awayTeamId: m.away.id,
        });

        await this.signalRepo.create({
          matchId: m.id,
          type: "live-over25",
          confidence: 90,
          description: `🚀 ${m.home.name} x ${m.away.name}: ${totalG} gols — forte tendência de over`,
          status: "active",
        });

        console.log(`🔥 Sinal gerado: ${m.home.name} x ${m.away.name} (${totalG} gols)`);
      }
    }
  }
}
