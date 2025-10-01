import { prisma } from "../../db/prisma";
import { IStatsRepository } from "../interfaces/IStatsRepository";

export class PrismaStatsRepository implements IStatsRepository {
  async getAggregates(params: { from?: Date; to?: Date; market?: string }) {
    const where: any = {
      ...(params.market && { market: params.market.toUpperCase() }),
      ...(params.from || params.to
        ? { createdAt: { ...(params.from && { gte: params.from }), ...(params.to && { lte: params.to }) } }
        : {})
    };

    const total = await prisma.signal.count({ where });
    const avg = await prisma.signal.aggregate({ _avg: { modelProb: true, edge: true }, where });
    const byMarket = await prisma.signal.groupBy({
      by: ["market"],
      _count: { market: true },
      _avg: { modelProb: true, edge: true },
      where
    });
    const byLine = await prisma.signal.groupBy({
      by: ["market", "line"],
      _count: { _all: true },
      _avg: { modelProb: true, edge: true },
      where
    });

    return { total, avgProb: avg._avg.modelProb, avgEdge: avg._avg.edge, byMarket, byLine };
  }
}
