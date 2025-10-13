"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGetStats = makeGetStats;
const prisma_stats_repository_1 = require("../repositories/prisma/prisma-stats-repository");
const get_stats_1 = require("../use-cases/get-stats");
function makeGetStats() {
    return new get_stats_1.GetStatsUseCase(new prisma_stats_repository_1.PrismaStatsRepository());
}
