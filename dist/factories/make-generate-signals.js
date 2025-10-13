"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGenerateSignals = makeGenerateSignals;
const generate_signals_1 = require("../use-cases/generate-signals");
const prisma_match_repository_1 = require("../repositories/prisma/prisma-match-repository");
const prisma_signal_repository_1 = require("../repositories/prisma/prisma-signal-repository");
const prisma_stats_repository_1 = require("../repositories/prisma/prisma-stats-repository");
const api_football_service_1 = require("../services/api-football-service");
function makeGenerateSignals() {
    const api = new api_football_service_1.ApiFootballService();
    const matchRepo = new prisma_match_repository_1.PrismaMatchRepository();
    const signalRepo = new prisma_signal_repository_1.PrismaSignalRepository();
    const statsRepo = new prisma_stats_repository_1.PrismaStatsRepository();
    return new generate_signals_1.GenerateSignalsUseCase(api, matchRepo, signalRepo, statsRepo);
}
