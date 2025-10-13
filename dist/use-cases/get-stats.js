"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStatsUseCase = void 0;
class GetStatsUseCase {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        return this.repo.getAggregates(params);
    }
}
exports.GetStatsUseCase = GetStatsUseCase;
