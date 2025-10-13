"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaSignalRepository = void 0;
const prisma_1 = require("../../db/prisma");
class PrismaSignalRepository {
    async create(data) {
        await prisma_1.prisma.signal.create({ data });
    }
    async findMany(params) {
        const where = {
            ...(params.market && { market: params.market.toUpperCase() }),
            ...(params.line && { line: params.line }),
            ...(params.selection && { selection: params.selection.toUpperCase() }),
            ...(params.minProb && { modelProb: { gte: params.minProb } }),
            ...(params.from || params.to
                ? { createdAt: { ...(params.from && { gte: params.from }), ...(params.to && { lte: params.to }) } }
                : {}),
            ...(params.competition && { match: { competition: { contains: params.competition, mode: "insensitive" } } }),
        };
        return prisma_1.prisma.signal.findMany({
            where,
            include: { match: { include: { homeTeam: true, awayTeam: true } } },
            orderBy: { createdAt: "desc" },
            skip: params.skip ?? 0,
            take: params.take ?? 20,
        });
    }
    async count(params) {
        const where = {
            ...(params.market && { market: params.market.toUpperCase() }),
            ...(params.line && { line: params.line }),
            ...(params.selection && { selection: params.selection.toUpperCase() }),
            ...(params.minProb && { modelProb: { gte: params.minProb } }),
            ...(params.from || params.to
                ? { createdAt: { ...(params.from && { gte: params.from }), ...(params.to && { lte: params.to }) } }
                : {}),
            ...(params.competition && { match: { competition: { contains: params.competition, mode: "insensitive" } } }),
        };
        return prisma_1.prisma.signal.count({ where });
    }
}
exports.PrismaSignalRepository = PrismaSignalRepository;
