import { Signal } from "@prisma/client";

export interface ISignalRepository {
  create(data: {
    matchId: number;
    type: string;
    confidence: number;
    description?: string;
    status: string;
    result?: string;
  }): Promise<Signal>;

  findById(id: number): Promise<Signal | null>;

  findMany(params?: any): Promise<Signal[]>;

  findByMatchAndType(matchId: number, type: string): Promise<Signal | null>;

  updateStatus(id: number, status: string): Promise<Signal>;

  delete(id: number): Promise<Signal>;

  count(params?: any): Promise<number>;
}
