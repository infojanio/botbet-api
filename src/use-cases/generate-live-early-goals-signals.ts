import { IExternalApiService } from "../repositories/interfaces/IExternalApiService";
import { ISignalRepository } from "../repositories/interfaces/ISignalRepository";
import { IMatchRepository } from "../repositories/interfaces/IMatchRepository";

type Params = {
  maxMinute?: number; // Ex: 20
  minGoals?: number;  // Ex: 3
  maxFavOdd?: number; // Ex: 1.60
};

export class GenerateLiveEarlyGoalsSignalsUseCase {
  constructor(
    private apiService: IExternalApiService,
    private signalRepo: ISignalRepository,
    private matchRepo: IMatchRepository
  ) {}

  private pickFavoriteOdd(bets: any[]): number | null {
    const bet = bets.find((b: any) => /match winner|1x2/i.test(b.name));
    if (!bet) return null;

    let lowest = Infinity;
    for (const v of bet.values ?? []) {
      const odd = parseFloat(v.odd);
      if (!isNaN(odd) && odd < lowest) lowest = odd;
    }
    return lowest !== Infinity ? lowest : null;
  }

  async execute(params: Params = {}) {
    const maxMinute = params.maxMinute ?? 20;
    const minGoals = params.minGoals ?? 3;
    const maxFavOdd = params.maxFavOdd ?? 1.6;

    console.log(`🎯 Estratégia AO VIVO: <=${maxMinute}’ & gols>=${minGoals} & odd<=${maxFavOdd}`);

    const live = await this.apiService.getLiveMatches();

    for (const m of live) {
      try {
        const minute = m.status?.liveTime?.long?.match(/\d+/)
          ? parseInt(m.status.liveTime.long)
          : 0;
        const gHome = m.home?.score ?? 0;
        const gAway = m.away?.score ?? 0;
        const totalG = gHome + gAway;
        if (minute > maxMinute || totalG < minGoals) continue;

        await this.matchRepo.upsert({
          externalId: m.id,
          date: new Date(m.status.utcTime),
          status: "live",
          leagueId: m.leagueId ?? 0,
          homeTeamId: m.home.id,
          awayTeamId: m.away.id,
        });

        const odds = await this.apiService.getLiveOdds(m.id);
        const favOdd = this.pickFavoriteOdd(odds || []);
        if (!favOdd || favOdd > maxFavOdd) continue;

        const confidence = Math.min(95, Math.round((minGoals / (minute + 1)) * 100));

        await this.signalRepo.create({
          matchId: m.id,
          type: "live-early-goals",
          confidence,
          description: `🔥 ${m.home.name} x ${m.away.name}: ${totalG} gols até ${minute}’, favorito @${favOdd.toFixed(2)}`,
          status: "active",
        });

        console.log(`✅ Sinal salvo: ${m.home.name} x ${m.away.name} (${totalG} gols aos ${minute}’)`);
      } catch (e) {
        console.error(`❌ Erro ao gerar sinal para ${m.home?.name} x ${m.away?.name}:`, e);
      }
    }
  }
}
