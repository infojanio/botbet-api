import { prisma } from "../../lib/prisma";
import { ISignalRepository } from "../interfaces/ISignalRepository";

export class PrismaSignalRepository implements ISignalRepository {
  async create(data: {
    matchId: number;
    type: string;
    confidence: number;
    description?: string;
    status: string;
    result?: string;
  }) {
    return prisma.signal.create({
      data: {
        matchId: data.matchId,
        type: data.type,
        confidence: data.confidence,
        description: data.description,
        status: data.status,
        result: data.result,
      },
    });
  }

  async findById(id: number) {
    return prisma.signal.findUnique({ where: { id } });
  }

  async findMany(params?: any) {
    return prisma.signal.findMany({
      where: params?.where ?? {},
      include: { match: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByMatchAndType(matchId: number, type: string) {
    return prisma.signal.findFirst({
      where: { matchId, type },
    });
  }

  async updateStatus(id: number, status: string) {
    return prisma.signal.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: number) {
    return prisma.signal.delete({ where: { id } });
  }

  async count(params?: any) {
    return prisma.signal.count({
      where: params?.where ?? {},
    });
  }
}
