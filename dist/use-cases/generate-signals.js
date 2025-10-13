"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSignalsUseCase = void 0;
class GenerateSignalsUseCase {
    constructor(apiService, matchRepo, signalRepo, statsRepo) {
        this.apiService = apiService;
        this.matchRepo = matchRepo;
        this.signalRepo = signalRepo;
        this.statsRepo = statsRepo;
    }
    async execute() {
        console.log('🚀 Iniciando job de geração de sinais...');
        const upcoming = await this.apiService.getUpcomingMatches(5);
        console.log(`📊 API retornou ${upcoming.length} jogos.`);
        for (const m of upcoming) {
            const home = m.teams.home;
            const away = m.teams.away;
            // Salva sempre os times e o jogo
            const match = await this.matchRepo.upsert({
                id: String(m.fixture.id),
                dateUtc: new Date(m.fixture.date),
                status: m.fixture.status.short,
                competition: m.league.name,
                homeTeam: { id: String(home.id), name: home.name },
                awayTeam: { id: String(away.id), name: away.name },
            });
            console.log(`⚽ Jogo salvo: ${home.name} x ${away.name}`);
            // Tenta buscar odds
            const oddsData = await this.apiService.getOdds(m.fixture.id);
            console.log(`   → Odds retornadas: ${oddsData.length}`);
            if (!oddsData.length) {
                console.warn(`⚠️ Sem odds para jogo ${match.id}`);
                continue; // salva apenas o jogo, sem sinais
            }
            // Aqui você mantém a lógica de calcular probabilidade / edge
            // Exemplo:
            for (const market of oddsData) {
                for (const b of market.bookmakers) {
                    for (const bet of b.bets) {
                        if (bet.name !== 'Match Goals' && bet.name !== 'Corners')
                            continue;
                        for (const o of bet.values) {
                            const selection = o.value;
                            const price = parseFloat(o.odd);
                            const impliedProb = 1 / price;
                            const modelProb = Math.random(); // mock, ajuste aqui
                            const edge = modelProb - impliedProb;
                            if (edge < 0.06)
                                continue;
                            await this.signalRepo.create({
                                matchId: match.id,
                                market: bet.name === 'Match Goals' ? 'GOALS' : 'CORNERS',
                                line: parseFloat(o.handicap ?? '0'),
                                selection,
                                modelProb,
                                impliedProb,
                                edge,
                                confidence: Math.floor(modelProb * 100),
                                reason: 'Mock calculation',
                            });
                            console.log(`✅ Sinal criado: ${bet.name} ${o.handicap} ${selection} @${price}`);
                        }
                    }
                }
            }
        }
    }
}
exports.GenerateSignalsUseCase = GenerateSignalsUseCase;
