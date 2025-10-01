import { prisma } from "../../db/prisma";
import { IMatchRepository } from "../interfaces/IMatchRepository";

export class PrismaMatchRepository implements IMatchRepository {
  async findUpcoming(params: { from?: Date; to?: Date; market?: string; minProb?: number; limit?: number }) {
    return prisma.match.findMany({
      where: {
        dateUtc: { gte: params.from ?? new Date(), lte: params.to },
        status: "scheduled",
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        signals: {
          where: {
            ...(params.market && { market: params.market.toUpperCase() }),
            ...(params.minProb && { modelProb: { gte: params.minProb } }),
          },
          orderBy: { createdAt: "desc" }
        },
      },
      orderBy: { dateUtc: "asc" },
      take: params.limit ?? 50,
    });
  }

  async findById(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: { homeTeam: true, awayTeam: true, signals: true, odds: true },
    });
  }

  async upsert(data: any) {
    return prisma.match.upsert({
      where: { id: data.id },
      update: {
        dateUtc: data.dateUtc,
        competition: data.competition,
        season: data.season,
        status: data.status,
        homeTeamId: data.homeTeam.id,
        awayTeamId: data.awayTeam.id,
      },
      create: {
        id: data.id,
        dateUtc: data.dateUtc,
        competition: data.competition,
        season: data.season,
        status: data.status,
        homeTeam: {
          connectOrCreate: {
            where: { id: data.homeTeam.id },
            create: { id: data.homeTeam.id, name: data.homeTeam.name, country: data.homeTeam.country },
          },
        },
        awayTeam: {
          connectOrCreate: {
            where: { id: data.awayTeam.id },
            create: { id: data.awayTeam.id, name: data.awayTeam.name, country: data.awayTeam.country },
          },
        },
      },
      include: { homeTeam: true, awayTeam: true },
    });
  }
}
