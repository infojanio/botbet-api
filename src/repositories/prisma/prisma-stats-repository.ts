import { prisma } from "../../lib/prisma";
import { IStatsRepository } from "../interfaces/IStatsRepository";

export class PrismaStatsRepository implements IStatsRepository {
  async getSummary() {
    const total = await prisma.signal.count();

    const avg = await prisma.signal.aggregate({
      _avg: { confidence: true },
    });

    const byType = await prisma.signal.groupBy({
      by: ["type"],
      _count: { type: true },
      _avg: { confidence: true },
    });

    return {
      total,
      avgConfidence: avg._avg.confidence ?? 0,
      byType: byType.map((t) => ({
        type: t.type,
        count: t._count.type,
        avgConfidence: t._avg.confidence ?? 0,
      })),
    };
  }
}
