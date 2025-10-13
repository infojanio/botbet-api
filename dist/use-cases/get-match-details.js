"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMatchDetailsUseCase = void 0;
class GetMatchDetailsUseCase {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(id) {
        const match = await this.repo.findById(id);
        if (!match)
            return null;
        return {
            id: match.id,
            date: match.dateUtc,
            competition: match.competition,
            home: match.homeTeam.name,
            away: match.awayTeam.name,
            status: match.status,
            signals: match.signals,
            odds: match.odds,
        };
    }
}
exports.GetMatchDetailsUseCase = GetMatchDetailsUseCase;
