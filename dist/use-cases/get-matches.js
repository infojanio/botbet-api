"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMatchesUseCase = void 0;
class GetMatchesUseCase {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        const matches = await this.repo.findUpcoming(params);
        return matches.map((m) => ({
            id: m.id,
            date: m.date,
            leagueName: m.league.name,
            home: m.homeTeam.name,
            away: m.awayTeam.name,
            signals: m.signals.map((s) => ({
                market: s.market,
                line: s.line,
                selection: s.selection,
                prob: (s.confidence * 100).toFixed(1) + "%",
            
                confidence: s.confidence,
            })),
        }));
    }
}
exports.GetMatchesUseCase = GetMatchesUseCase;
