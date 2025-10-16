import { prisma } from "../../lib/prisma";
import { ISignalRepository } from "../interfaces/ISignalRepository";

export class PrismaSignalRepository implements ISignalRepository {
  async create(data: any) {
    await prisma.signal.create({ data });
  }

  async findMany(params: any) {
    const where: any = {
      ...(params.market && { market: params.market.toUpperCase() }),
      ...(params.line && { line: params.line }),
      ...(params.selection && { selection: params.selection.toUpperCase() }),
      ...(params.minProb && { modelProb: { gte: params.minProb } }),
      ...(params.from || params.to
        ? { createdAt: { ...(params.from && { gte: params.from }), ...(params.to && { lte: params.to }) } }
        : {}),
      ...(params.competition && { match: { competition: { contains: params.competition, mode: "insensitive" } } }),
    };

    return prisma.signal.findMany({
      where,
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
      orderBy: { createdAt: "desc" },
      skip: params.skip ?? 0,
      take: params.take ?? 20,
    });
  }

  async count(params: any) {
    const where: any = {
      ...(params.market && { market: params.market.toUpperCase() }),
      ...(params.line && { line: params.line }),
      ...(params.selection && { selection: params.selection.toUpperCase() }),
      ...(params.minProb && { modelProb: { gte: params.minProb } }),
      ...(params.from || params.to
        ? { createdAt: { ...(params.from && { gte: params.from }), ...(params.to && { lte: params.to }) } }
        : {}),
      ...(params.competition && { match: { competition: { contains: params.competition, mode: "insensitive" } } }),
    };

    return prisma.signal.count({ where });
  }
}
