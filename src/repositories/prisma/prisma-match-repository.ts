import { prisma } from "../../lib/prisma";
import { IMatchRepository } from "../interfaces/IMatchRepository";

export class PrismaMatchRepository implements IMatchRepository {
  async findUpcoming(params: { from?: Date; to?: Date; limit?: number }) {
    return prisma.match.findMany({
      where: {
        date: {
          gte: params.from ?? new Date(),
          lte: params.to ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: "scheduled",
      },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        signals: true,
      },
      orderBy: { date: "asc" },
      take: params.limit ?? 50,
    });
  }

  async findById(id: number) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        league: true,
        homeTeam: true,
        awayTeam: true,
        signals: true,
        stats: true,
      },
    });
  }

  async upsert(data: {
    externalId: number;
    date: Date;
    status: string;
    leagueId: number;
    homeTeamId: number;
    awayTeamId: number;
  }) {
    return prisma.match.upsert({
      where: { externalId: data.externalId },
      update: {
        date: data.date,
        status: data.status,
        leagueId: data.leagueId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
      },
      create: {
        externalId: data.externalId,
        date: data.date,
        status: data.status,
        leagueId: data.leagueId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
      },
    });
  }
}
