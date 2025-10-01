import { IMatchRepository } from "../repositories/interfaces/IMatchRepository";
import { ISignalRepository } from "../repositories/interfaces/ISignalRepository";
import { IExternalApiService } from "../repositories/interfaces/IExternalApiService";
import { calcOverProb } from "../services/calculate-probabilities";

export class GenerateSignalsUseCase {
  constructor(
    private matchRepo: IMatchRepository,
    private signalRepo: ISignalRepository,
    private apiService: IExternalApiService
  ) {}

  async execute() {
    console.log("🚀 Iniciando job de geração de sinais...");
    try {
      const fixtures = await this.apiService.getUpcomingMatches(20);

      for (const m of fixtures) {
        try {
          const matchId = m.fixture.id.toString();
          const homeId = m.teams.home.id;
          const awayId = m.teams.away.id;

          // Persist Match + Teams
          const saved = await this.matchRepo.upsert({
            id: matchId,
            dateUtc: new Date(m.fixture.date),
            competition: m.league.name,
            season: m.league.season?.toString(),
            status: m.fixture.status.short,
            homeTeam: { id: homeId.toString(), name: m.teams.home.name, country: m.league.country },
            awayTeam: { id: awayId.toString(), name: m.teams.away.name, country: m.league.country },
          });

          // Data for probabilities
          const h2h = await this.apiService.getHeadToHead(homeId, awayId);
          const h2hGoals = h2h.map((g: any) => g.goals.home + g.goals.away);
          const h2hCorners = h2h.map((g: any) => (g.statistics?.corners ?? 0));

          const recentHome = await this.apiService.getRecentMatches(homeId, 6);
          const recentAway = await this.apiService.getRecentMatches(awayId, 6);
          const recentGoals = [
            ...recentHome.map((x: any) => x.goals.home + x.goals.away),
            ...recentAway.map((x: any) => x.goals.home + x.goals.away),
          ];
          const recentCorners = [
            ...recentHome.map((x: any) => x.statistics?.corners ?? 0),
            ...recentAway.map((x: any) => x.statistics?.corners ?? 0),
          ];

          // Odds
          const oddsData = await this.apiService.getOdds(m.fixture.id);
          if (!oddsData.length) {
            console.warn(`⚠️ Sem odds para jogo ${matchId}`);
            continue;
          }

          // Map provider-specific odds into normalized list
          const normalized: { market: "GOALS"|"CORNERS"; line: number; selection: "OVER"|"UNDER"; price: number; source?: string }[] = [];

          for (const prov of oddsData) {
            const book = prov.bookmaker?.name || "unknown";
            for (const market of prov.bookmaker?.bets || prov.bets || []) {
              const name = (market.name || market.market_name || "").toLowerCase();
              const mk: "GOALS" | "CORNERS" | null =
                name.includes("goals") || name.includes("total goals") ? "GOALS" :
                name.includes("corners") || name.includes("corner") ? "CORNERS" : null;
              if (!mk) continue;

              for (const v of market.values || []) {
                // Expect format: "Over 2.5" or "Under 9.5"
                const valName: string = v.value || v.selection || "";
                const parts = valName.toLowerCase().split(" ");
                const sel = parts[0] === "over" ? "OVER" : parts[0] === "under" ? "UNDER" : null;
                const ln = parseFloat(parts[1]);
                const odd = parseFloat(v.odd || v.price);
                if (!sel || isNaN(ln) || isNaN(odd)) continue;
                normalized.push({ market: mk, line: ln, selection: sel, price: odd, source: book });
              }
            }
          }

          // Calculate signals for each normalized odd
          for (const o of normalized) {
            const p = o.market === "GOALS"
              ? calcOverProb(h2hGoals, recentGoals, o.line)
              : calcOverProb(h2hCorners, recentCorners, o.line);
            if (p == null) continue;

            const implied = 1 / o.price;
            const edge = p - implied;
            if (edge < 0.06) continue;

            await this.signalRepo.create({
              matchId,
              market: o.market,
              line: o.line,
              selection: o.selection,
              modelProb: p,
              impliedProb: implied,
              edge,
              confidence: Math.min(95, Math.round(p * 100)),
              reason: `H2H + Recent form (linha ${o.line})`,
            });
            console.log(`✅ Sinal: ${saved.homeTeam.name} x ${saved.awayTeam.name} | ${o.selection} ${o.line} ${o.market} @${o.price}`);
          }

        } catch (inner) {
          console.error("Erro processando fixture:", inner);
        }
      }

    } catch (err) {
      console.error("❌ Erro geral no job de sinais:", err);
    }
  }
}
