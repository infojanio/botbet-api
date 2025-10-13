"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaStatsRepository = void 0;
const prisma_1 = require("../../db/prisma");
class PrismaStatsRepository {
    async getAggregates(params) {
        const where = {
            ...(params.market && { market: params.market.toUpperCase() }),
            ...(params.from || params.to
                ? { createdAt: { ...(params.from && { gte: params.from }), ...(params.to && { lte: params.to }) } }
                : {})
        };
        const total = await prisma_1.prisma.signal.count({ where });
        const avg = await prisma_1.prisma.signal.aggregate({ _avg: { modelProb: true, edge: true }, where });
        const byMarket = await prisma_1.prisma.signal.groupBy({
            by: ["market"],
            _count: { market: true },
            _avg: { modelProb: true, edge: true },
            where
        });
        const byLine = await prisma_1.prisma.signal.groupBy({
            by: ["market", "line"],
            _count: { _all: true },
            _avg: { modelProb: true, edge: true },
            where
        });
        return { total, avgProb: avg._avg.modelProb, avgEdge: avg._avg.edge, byMarket, byLine };
    }
}
exports.PrismaStatsRepository = PrismaStatsRepository;
