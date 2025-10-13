"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSignalsUseCase = void 0;
class GetSignalsUseCase {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        const signals = await this.repo.findMany(params);
        const total = await this.repo.count(params);
        return {
            total,
            signals: signals.map((s) => ({
                id: s.id,
                date: s.match.dateUtc,
                competition: s.match.competition,
                match: `${s.match.homeTeam.name} x ${s.match.awayTeam.name}`,
                market: s.market,
                line: s.line,
                selection: s.selection,
                prob: (s.modelProb * 100).toFixed(1) + "%",
                edge: (s.edge * 100).toFixed(1) + "%",
                confidence: s.confidence,
                reason: s.reason,
            })),
        };
    }
}
exports.GetSignalsUseCase = GetSignalsUseCase;
